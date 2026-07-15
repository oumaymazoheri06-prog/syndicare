<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Item;
use App\Models\ItemClaim;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    private const TYPES = ['Perdue', 'Trouve'];
    private const STATUSES = ['ouvert', 'en_contact', 'rendu', 'ferme'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Item::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'type' => $request->string('type')->toString(),
            'status' => $request->string('status')->toString(),
        ];

        $baseQuery = Item::query();

        if ($request->user()->role !== 'Syndic') {
            $buildingIds = $this->residentBuildingIds($request);

            $baseQuery->where(function ($query) use ($request, $buildingIds) {
                $query->where('user_id', $request->user()->id);

                if ($buildingIds->isNotEmpty()) {
                    $query->orWhereHas('apartment.floor', function ($floorQuery) use ($buildingIds) {
                        $floorQuery->whereIn('building_id', $buildingIds);
                    });
                }
            });
        }

        $query = (clone $baseQuery)
            ->with(['user:id,name,role', 'apartment.floor.building'])
            ->withCount('claims')
            ->when($filters['type'], fn ($q, $type) => $q->where('type', $type))
            ->when($filters['status'], fn ($q, $status) => $q->where('status', $status))
            ->when($filters['search'], function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->latest();

        $statsQuery = clone $baseQuery;

        return Inertia::render('Items/Index', [
            'items' => $query
                ->paginate(9)
                ->withQueryString()
                ->through(fn (Item $item) => $this->serializeItem($item)),
            'filters' => $filters,
            'stats' => [
                'lost' => (clone $statsQuery)->where('type', 'Perdue')->count(),
                'found' => (clone $statsQuery)->where('type', 'Trouve')->count(),
                'open' => (clone $statsQuery)->where('status', 'ouvert')->count(),
                'inContact' => (clone $statsQuery)->where('status', 'en_contact')->count(),
                'resolved' => (clone $statsQuery)->where('status', 'rendu')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Item::class);

        return Inertia::render('Items/Create', [
            'apartments' => $this->apartmentOptions(),
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Item::class);

        $validated = $this->validateItem($request);

        $imagePath = $request->file('image')?->store('lost-found', 'public');
        unset($validated['image']);

        $item = Item::create([
            ...$validated,
            'status' => 'ouvert',
            'user_id' => $request->user()->id,
            'image_path' => $imagePath,
        ]);
        $typeLabel = $item->type === 'Perdue' ? 'perdu' : 'trouvé';
 Audit_log:: create([
    'action'=> "Création de déclaration d'objet",
    'details'=>'Un objet '.$typeLabel.' a été déclaré : "'.$item->title.'" par '.$request->user()->name.'.',
'performed_by' =>auth()->id(),
 ]);
        $this->notifyResidents($item, $notifications, $request->user()->name);

        if ($item->type === 'Trouve') {
            $this->notifyMatchingLostOwners($item, $notifications);
        }

        return redirect()
            ->route('items.show', $item)
            ->with(
                'success',
                $item->type === 'Perdue'
                    ? 'Objet perdu déclaré. Les objets trouvés similaires sont affichés dans la fiche.'
                    : 'Objet trouvé déclaré. Les résidents ont été notifiés.'
            );
    }

    public function show(Item $item): Response
    {
        $this->authorize('view', $item);

        $item->load([
            'user:id,name,email,role',
            'apartment.floor.building',
            'claims.user:id,name,email,role',
        ]);

        return Inertia::render('Items/Show', [
            'item' => $this->serializeItem($item, true),
            'suggestions' => $item->type === 'Perdue'
                ? $this->similarItems($item, 'Trouve')
                : [],
            'canManage' => $this->canManage($item),
            'canInteract' => auth()->id() !== $item->user_id,
        ]);
    }

    public function edit(Item $item): Response
    {
        $this->authorize('update', $item);

        return Inertia::render('Items/Edit', [
            'item' => $this->serializeItem($item),
            'apartments' => $this->apartmentOptions(),
        ]);
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $this->authorize('update', $item);

        $validated = $this->validateItem($request, true);

        if ($request->hasFile('image')) {
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }

            $validated['image_path'] = $request->file('image')->store('lost-found', 'public');
        }

        unset($validated['image']);

        $validated['resolved_at'] = in_array($validated['status'], ['rendu', 'ferme'], true)
            ? now()
            : null;

        $item->update($validated);
Audit_log::create([
    'action' => "Mise à jour de déclaration d'objet",
    'details' => 'La déclaration de l\'objet "'.$item->title.'" a été mise à jour par '.$request->user()->name.'.',
    'performed_by' => auth()->id(),
]);
        return redirect()
            ->route('items.show', $item)
            ->with('success', 'Objet mis à jour avec succès.');
    }

    public function updateStatus(Request $request, Item $item, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('update', $item);

        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $item->update([
            'status' => $validated['status'],
            'resolved_at' => in_array($validated['status'], ['rendu', 'ferme'], true) ? now() : null,
        ]);
        $statusLabel = match ($validated['status']) {
            'en_contact' => 'en contact',
            'rendu' => 'rendu',
            'ferme' => 'fermé',
            default => 'ouvert',
        };
Audit_log::create([
    'action' => "Mise à jour de statut d'objet",
    'details' => 'Le statut de l\'objet "'.$item->title.'" a été mis à jour en "'.$statusLabel.'" par '.$request->user()->name.'.',
    'performed_by' => auth()->id(),
]);
        $notifications->createForUser(
            $item->user,
            "Statut de l'objet mis à jour",
            sprintf('Le statut de "%s" est maintenant "%s".', $item->title, $statusLabel),
            'info'
        );

        return back()->with('success', 'Statut mis à jour.');
    }

    public function claim(Request $request, Item $item, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('claim', $item);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        ItemClaim::updateOrCreate(
            [
                'item_id' => $item->id,
                'user_id' => $request->user()->id,
            ],
            [
                'message' => $validated['message'],
                'status' => 'pending',
            ]
        );

        if ($item->status === 'ouvert') {
            $item->update(['status' => 'en_contact']);
        }

        $notifications->createForUser(
            $item->user,
            'Nouvelle interaction objet',
            sprintf('%s a envoyé un message concernant "%s".', $request->user()->name, $item->title),
            'warning'
        );

        return back()->with('success', 'Message envoyé au déclarant.');
    }

    public function destroy(Item $item): RedirectResponse
    {
        $this->authorize('delete', $item);

        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        Audit_log::create([
            'action' => "Suppression de déclaration d'objet",
            'details' => 'La déclaration de l\'objet "'.$item->title.'" a été supprimée par '.(auth()->user()?->name ?? 'Système').'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('items.index')->with('success', 'Objet supprimé.');
    }

    private function validateItem(Request $request, bool $includeStatus = false): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:80'],
            'description' => ['required', 'string', 'max:3000'],
            'location' => ['nullable', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'type' => ['required', Rule::in(self::TYPES)],
            'apartment_id' => ['nullable', $this->tenantExists('apartments')],
            'image' => ['nullable', 'image', 'max:4096'],
        ];

        if ($includeStatus) {
            $rules['status'] = ['required', Rule::in(self::STATUSES)];
        }

        return $request->validate($rules);
    }

    private function notifyResidents(Item $item, NotificationService $notifications, string $creatorName): void
    {
        $label = $item->type === 'Perdue' ? 'perdu' : 'trouvé';

        $notifications->createForRole(
            ['Locataire', 'Coproprietaire'],
            $item->type === 'Perdue' ? 'Objet perdu déclaré' : 'Objet trouvé déclaré',
            sprintf(
                '%s a déclaré un objet %s: "%s"%s.',
                $creatorName,
                $label,
                $item->title,
                $item->location ? " à {$item->location}" : ''
            ),
            $item->type === 'Perdue' ? 'warning' : 'info'
        );
    }

    private function notifyMatchingLostOwners(Item $foundItem, NotificationService $notifications): void
    {
        $matches = $this->similarItems($foundItem, 'Perdue', 50);

        foreach ($matches as $match) {
            $lostItem = Item::query()->with('user')->find($match['item']['id']);

            if (! $lostItem?->user || $lostItem->user_id === $foundItem->user_id) {
                continue;
            }

            $notifications->createForUser(
                $lostItem->user,
                'Objet trouvé similaire',
                sprintf('Un objet trouvé ressemble à votre déclaration "%s": "%s".', $lostItem->title, $foundItem->title),
                'info'
            );
        }
    }

    private function similarItems(Item $source, string $targetType, int $minimumScore = 28): array
    {
        return Item::query()
            ->with(['user:id,name,role', 'apartment.floor.building'])
            ->where('id', '<>', $source->id)
            ->where('type', $targetType)
            ->whereIn('status', ['ouvert', 'en_contact'])
            ->latest()
            ->limit(80)
            ->get()
            ->map(function (Item $candidate) use ($source) {
                return [
                    'item' => $this->serializeItem($candidate),
                    'score' => $this->similarityScore($source, $candidate),
                    'reasons' => $this->similarityReasons($source, $candidate),
                ];
            })
            ->filter(fn (array $match) => $match['score'] >= $minimumScore)
            ->sortByDesc('score')
            ->take(5)
            ->values()
            ->all();
    }

    private function similarityScore(Item $source, Item $candidate): int
    {
        $score = 0;

        if (mb_strtolower($source->category ?? '') === mb_strtolower($candidate->category ?? '')) {
            $score += 35;
        }

        if ($source->location && $candidate->location) {
            $sourceLocation = mb_strtolower($source->location);
            $candidateLocation = mb_strtolower($candidate->location);

            if (str_contains($sourceLocation, $candidateLocation) || str_contains($candidateLocation, $sourceLocation)) {
                $score += 15;
            }
        }

        similar_text(
            mb_strtolower(($source->title ?? '').' '.($source->description ?? '')),
            mb_strtolower(($candidate->title ?? '').' '.($candidate->description ?? '')),
            $percent
        );

        $score += min(30, (int) round($percent * 0.30));

        $sharedTokens = array_intersect(
            $this->tokens($source->title.' '.$source->description),
            $this->tokens($candidate->title.' '.$candidate->description)
        );

        $score += min(20, count($sharedTokens) * 5);

        return min(100, $score);
    }

    private function similarityReasons(Item $source, Item $candidate): array
    {
        $reasons = [];

        if (mb_strtolower($source->category ?? '') === mb_strtolower($candidate->category ?? '')) {
            $reasons[] = 'Meme categorie';
        }

        if ($source->location && $candidate->location) {
            $reasons[] = 'Lieu proche';
        }

        $sharedTokens = array_intersect(
            $this->tokens($source->title.' '.$source->description),
            $this->tokens($candidate->title.' '.$candidate->description)
        );

        if (count($sharedTokens) > 0) {
            $reasons[] = 'Mots similaires';
        }

        return $reasons ?: ['Description proche'];
    }

    private function tokens(string $text): array
    {
        $words = preg_split('/[^a-z0-9]+/i', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_unique(array_filter(
            $words ?: [],
            fn (string $word) => mb_strlen($word) >= 4
        )));
    }

    private function serializeItem(Item $item, bool $withClaims = false): array
    {
        $apartment = $item->apartment;
        $building = $apartment?->floor?->building;

        $data = [
            'id' => $item->id,
            'title' => $item->title,
            'category' => $item->category,
            'description' => $item->description,
            'location' => $item->location,
            'date' => optional($item->date)->format('d/m/Y'),
            'date_value' => optional($item->date)->format('Y-m-d'),
            'type' => $item->type,
            'status' => $item->status ?? 'ouvert',
            'image_url' => $item->image_path ? Storage::url($item->image_path) : null,
            'claims_count' => $item->claims_count ?? $item->claims?->count() ?? 0,
            'created_at' => optional($item->created_at)->diffForHumans(),
            'user' => $item->user ? [
                'id' => $item->user->id,
                'name' => $item->user->name,
                'email' => $item->user->email,
                'role' => $item->user->role,
            ] : null,
            'apartment' => $apartment ? [
                'id' => $apartment->id,
                'number' => $apartment->number,
                'building' => $building?->name,
            ] : null,
        ];

        if ($withClaims) {
            $data['claims'] = $item->claims->map(fn (ItemClaim $claim) => [
                'id' => $claim->id,
                'message' => $claim->message,
                'status' => $claim->status,
                'created_at' => optional($claim->created_at)->diffForHumans(),
                'user' => $claim->user ? [
                    'id' => $claim->user->id,
                    'name' => $claim->user->name,
                    'email' => $claim->user->email,
                    'role' => $claim->user->role,
                ] : null,
            ])->values();
        }

        return $data;
    }

    private function apartmentOptions()
    {
        return Apartment::query()
            ->with('floor.building')
            ->orderBy('number')
            ->get()
            ->map(fn (Apartment $apartment) => [
                'id' => $apartment->id,
                'label' => trim(sprintf(
                    'Appt %s%s',
                    $apartment->number,
                    $apartment->floor?->building?->name ? ' - '.$apartment->floor->building->name : ''
                )),
            ]);
    }

    private function residentBuildingIds(Request $request)
    {
        return $request->user()
            ->apartments()
            ->with('floor:id,building_id')
            ->get()
            ->pluck('floor.building_id')
            ->filter()
            ->unique()
            ->values();
    }

    private function canManage(Item $item): bool
    {
        $user = auth()->user();

        return $user?->role === 'Syndic' || $user?->id === $item->user_id;
    }
}
