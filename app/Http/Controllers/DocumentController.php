<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Building;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    private const TARGET_TYPES = ['all', 'building', 'apartment', 'role'];
    private const TARGET_ROLES = ['Coproprietaire', 'Locataire'];
    private const CATEGORIES = [
        'pv' => "Procès-Verbaux d'AG",
        'reglement' => 'Règlements',
        'finance' => 'Rapports Financiers',
        'contrat' => 'Contrats',
        'autre' => 'Autres',
    ];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Document::class);

        $query = Document::query()
            ->with(['building', 'apartment.floor.building', 'uploader'])
            ->latest();

        if ($request->user()->role !== 'Syndic') {
            $this->applyResidentVisibility($query, $request);
        }

        $canManageDocuments = $request->user()->role === 'Syndic';

        return Inertia::render('Documents/Index', [
            'documents' => $query->get()->map(fn (Document $document) => $this->documentPayload($document)),
            'categoryOptions' => $this->categoryOptions(),
            'buildings' => $canManageDocuments ? Building::query()->orderBy('name')->get(['id', 'name']) : [],
            'apartments' => $canManageDocuments ? $this->apartmentOptions() : [],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Document::class);

        return Inertia::render('Documents/Create', [
            'buildings' => Building::query()->orderBy('name')->get(['id', 'name']),
            'apartments' => $this->apartmentOptions(),
            'categoryOptions' => $this->categoryOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Document::class);

        $validated = $this->validatedDocumentData($request);

        Document::create($validated + ['uploaded_by' => $request->user()->id]);
Audit_log::create([
            'action' => 'Création de document',
            'details' => 'Un document intitulé "' . $validated['title'] . '" a été créé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('documents.index')->with('success', 'Document créé avec succès.');
    }

    public function show(Document $document): Response
    {
        $this->authorize('view', $document);

        return Inertia::render('Documents/Show', [
            'document' => $this->documentPayload($document->load(['building', 'apartment.floor.building', 'uploader'])),
        ]);
    }

    public function edit(Document $document): Response
    {
        $this->authorize('update', $document);

        return Inertia::render('Documents/Edit', [
            'document' => $this->documentPayload($document->load(['building', 'apartment.floor.building', 'uploader'])),
            'buildings' => Building::query()->orderBy('name')->get(['id', 'name']),
            'apartments' => $this->apartmentOptions(),
            'categoryOptions' => $this->categoryOptions(),
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $this->authorize('update', $document);

        $validated = $this->validatedDocumentData($request, $document);

        $document->update($validated);
Audit_log::create([
            'action' => 'Mise à jour de document',
            'details' => 'Le document ID '.$document->id.' a été mis à jour en "' . $validated['title'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('documents.index')->with('success', 'Document mis à jour avec succès.');
    }

    public function destroy(Document $document, Request $request): RedirectResponse
    {
        $this->authorize('delete', $document);

        $document->delete();
Audit_log::create([
            'action' => 'Suppression de document',
            'details' => 'Le document ID '.$document->id.' a été supprimé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('documents.index')->with('success', 'Document supprimé avec succès.');
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

    private function residentApartmentIds(Request $request)
    {
        return $request->user()
            ->apartments()
            ->pluck('apartments.id')
            ->filter()
            ->unique()
            ->values();
    }

    private function applyResidentVisibility($query, Request $request): void
    {
        $buildingIds = $this->residentBuildingIds($request);
        $apartmentIds = $this->residentApartmentIds($request);

        $query->where(function ($q) use ($request, $buildingIds, $apartmentIds) {
            $q->where('target_type', 'all')
                ->orWhere(function ($roleQuery) use ($request) {
                    $roleQuery
                        ->where('target_type', 'role')
                        ->where('target_role', $request->user()->role);
                });

            if ($buildingIds->isNotEmpty()) {
                $q->orWhere(function ($buildingQuery) use ($buildingIds) {
                    $buildingQuery
                        ->where('target_type', 'building')
                        ->where(function ($targetQuery) use ($buildingIds) {
                            $targetQuery->whereIn('building_id', $buildingIds);

                            foreach ($buildingIds as $buildingId) {
                                $targetQuery->orWhereJsonContains('building_ids', (int) $buildingId);
                            }
                        });
                });
            }

            if ($apartmentIds->isNotEmpty()) {
                $q->orWhere(function ($apartmentQuery) use ($apartmentIds) {
                    $apartmentQuery
                        ->where('target_type', 'apartment')
                        ->whereIn('apartment_id', $apartmentIds);
                });
            }
        });
    }

    private function validatedDocumentData(Request $request, ?Document $document = null): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(array_keys(self::CATEGORIES))],
            'file_path' => ['nullable', 'string', 'max:255'],
            'file' => ['nullable', 'file', 'max:10240'],
            'target_type' => ['required', Rule::in(self::TARGET_TYPES)],
            'building_id' => ['nullable', $this->tenantExists('buildings')],
            'building_ids' => ['nullable', 'array'],
            'building_ids.*' => [$this->tenantExists('buildings')],
            'apartment_id' => ['nullable', 'required_if:target_type,apartment', $this->tenantExists('apartments')],
            'target_role' => ['nullable', 'required_if:target_type,role', Rule::in(self::TARGET_ROLES)],
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents', 'public');
            $validated['file_path'] = Storage::url($path);
        } elseif (empty($validated['file_path'])) {
            if ($document) {
                $validated['file_path'] = $document->file_path;
            } else {
                throw ValidationException::withMessages([
                    'file' => 'Ajoutez un fichier ou renseignez un lien.',
                ]);
            }
        }

        unset($validated['file']);

        $buildingIds = collect($validated['building_ids'] ?? [])
            ->filter(fn ($id) => filled($id))
            ->map(fn ($id) => (int) $id);

        if ($buildingIds->isEmpty() && filled($validated['building_id'] ?? null)) {
            $buildingIds->push((int) $validated['building_id']);
        }

        $buildingIds = $buildingIds->unique()->values();

        if ($validated['target_type'] === 'building' && $buildingIds->isEmpty()) {
            throw ValidationException::withMessages([
                'building_ids' => 'Sélectionnez au moins un immeuble.',
            ]);
        }

        $validated['building_ids'] = $buildingIds->isEmpty() ? null : $buildingIds->all();
        $validated['building_id'] = $buildingIds->first();

        return match ($validated['target_type']) {
            'building' => array_merge($validated, ['apartment_id' => null, 'target_role' => null]),
            'apartment' => array_merge($validated, ['building_id' => null, 'building_ids' => null, 'target_role' => null]),
            'role' => array_merge($validated, ['building_id' => null, 'building_ids' => null, 'apartment_id' => null]),
            default => array_merge($validated, ['building_id' => null, 'building_ids' => null, 'apartment_id' => null, 'target_role' => null]),
        };
    }

    private function apartmentOptions()
    {
        return Apartment::query()
            ->with('floor.building')
            ->orderBy('number')
            ->get(['id', 'number', 'floor_id'])
            ->map(fn (Apartment $apartment) => [
                'id' => $apartment->id,
                'label' => trim(($apartment->floor?->building?->name ? $apartment->floor->building->name.' - ' : '').'Lot '.$apartment->number),
            ]);
    }

    private function documentPayload(Document $document): array
    {
        $category = array_key_exists($document->category, self::CATEGORIES)
            ? $document->category
            : 'autre';

        return array_merge($document->toArray(), [
            'category' => $category,
            'category_label' => self::CATEGORIES[$category],
            'target_label' => $this->targetLabel($document),
            'target_summary_label' => $this->targetSummaryLabel($document),
            'uploaded_by_name' => $document->uploader?->name,
            'uploaded_at_label' => optional($document->created_at)->format('Y-m-d'),
            'file_name' => $this->fileName($document->file_path),
            'file_extension' => $this->fileExtension($document->file_path),
            'file_size_label' => $this->fileSizeLabel($document->file_path),
        ]);
    }

    private function targetLabel(Document $document): string
    {
        $targetType = $document->target_type ?: ($document->building_id ? 'building' : 'all');

        return match ($targetType) {
            'building' => implode(', ', $this->buildingNamesForDocument($document)) ?: 'Immeuble',
            'apartment' => $document->apartment
                ? trim(($document->apartment->floor?->building?->name ? $document->apartment->floor->building->name.' - ' : '').'Lot '.$document->apartment->number)
                : 'Lot #'.$document->apartment_id,
            'role' => 'Rôle '.$document->target_role,
            default => 'Tous',
        };
    }

    private function targetSummaryLabel(Document $document): string
    {
        $targetType = $document->target_type ?: ($document->building_id ? 'building' : 'all');

        return match ($targetType) {
            'building' => ($count = count($this->documentBuildingIds($document)))
                ? $count.' Immeuble'.($count > 1 ? 's' : '')
                : 'Immeuble',
            'apartment' => '1 Lot',
            'role' => $document->target_role ?: 'Rôle',
            default => 'Tous',
        };
    }

    private function documentBuildingIds(Document $document): array
    {
        $ids = collect($document->building_ids ?? [])
            ->filter()
            ->map(fn ($id) => (int) $id);

        if ($ids->isEmpty() && $document->building_id) {
            $ids->push((int) $document->building_id);
        }

        return $ids->unique()->values()->all();
    }

    private function buildingNamesForDocument(Document $document): array
    {
        $ids = $this->documentBuildingIds($document);

        if ($ids === []) {
            return [];
        }

        if (count($ids) === 1 && $document->relationLoaded('building') && $document->building) {
            return [$document->building->name];
        }

        $names = Building::query()
            ->whereIn('id', $ids)
            ->pluck('name', 'id');

        return collect($ids)
            ->map(fn (int $id) => $names[$id] ?? 'Immeuble #'.$id)
            ->all();
    }

    private function categoryOptions(): array
    {
        return collect(self::CATEGORIES)
            ->map(fn (string $label, string $value) => [
                'value' => $value,
                'label' => $label,
            ])
            ->values()
            ->all();
    }

    private function fileName(?string $path): string
    {
        if (! $path) {
            return '-';
        }

        return basename((string) parse_url($path, PHP_URL_PATH)) ?: $path;
    }

    private function fileExtension(?string $path): string
    {
        $extension = pathinfo($this->fileName($path), PATHINFO_EXTENSION);

        return $extension ? strtoupper($extension) : 'FICHIER';
    }

    private function fileSizeLabel(?string $path): ?string
    {
        if (! $path || ! str_starts_with($path, '/storage/')) {
            return null;
        }

        $relativePath = substr($path, strlen('/storage/'));

        if (! Storage::disk('public')->exists($relativePath)) {
            return null;
        }

        $bytes = Storage::disk('public')->size($relativePath);

        if ($bytes < 1024) {
            return $bytes.' B';
        }

        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }
}
