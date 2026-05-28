<?php

namespace App\Http\Controllers;

use App\Models\Apartment;
use App\Models\Audit_log;
use App\Models\Building;
use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    private const TARGET_TYPES = ['all', 'building', 'apartment', 'role'];
    private const TARGET_ROLES = ['Coproprietaire', 'Locataire'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Document::class);

        $query = Document::query()
            ->with(['building', 'apartment.floor.building', 'uploader'])
            ->latest();

        if ($request->user()->role !== 'Syndic') {
            $this->applyResidentVisibility($query, $request);
        }

        return Inertia::render('Documents/Index', [
            'documents' => $query->paginate(10)->through(fn (Document $document) => $this->documentPayload($document)),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Document::class);

        return Inertia::render('Documents/Create', [
            'buildings' => Building::query()->orderBy('name')->get(['id', 'name']),
            'apartments' => $this->apartmentOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Document::class);

        $validated = $this->validatedDocumentData($request);

        Document::create($validated + ['uploaded_by' => $request->user()->id]);
Audit_log::create([
            'action' => 'Creation de document',
            'details' => 'Un document intitulé "' . $validated['title'] . '" a été créé par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('documents.index')->with('success', 'Document created successfully.');
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
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $this->authorize('update', $document);

        $validated = $this->validatedDocumentData($request);

        $document->update($validated);
Audit_log::create([
            'action' => 'Mise à jour de document',
            'details' => 'Le document ID '.$document->id.' a été mis à jour en "' . $validated['title'] . '" par ' . $request->user()->name . '.',
            'performed_by' => auth()->id(),
        ]);
        return redirect()->route('documents.index')->with('success', 'Document updated successfully.');
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

        return redirect()->route('documents.index')->with('success', 'Document deleted successfully.');
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
                        ->whereIn('building_id', $buildingIds);
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

    private function validatedDocumentData(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'file_path' => ['required', 'string', 'max:255'],
            'target_type' => ['required', Rule::in(self::TARGET_TYPES)],
            'building_id' => ['nullable', 'required_if:target_type,building', $this->tenantExists('buildings')],
            'apartment_id' => ['nullable', 'required_if:target_type,apartment', $this->tenantExists('apartments')],
            'target_role' => ['nullable', 'required_if:target_type,role', Rule::in(self::TARGET_ROLES)],
        ]);

        return match ($validated['target_type']) {
            'building' => array_merge($validated, ['apartment_id' => null, 'target_role' => null]),
            'apartment' => array_merge($validated, ['building_id' => null, 'target_role' => null]),
            'role' => array_merge($validated, ['building_id' => null, 'apartment_id' => null]),
            default => array_merge($validated, ['building_id' => null, 'apartment_id' => null, 'target_role' => null]),
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
                'label' => trim(($apartment->floor?->building?->name ? $apartment->floor->building->name.' - ' : '').'Apartment '.$apartment->number),
            ]);
    }

    private function documentPayload(Document $document): array
    {
        return $document->toArray() + [
            'target_label' => $this->targetLabel($document),
        ];
    }

    private function targetLabel(Document $document): string
    {
        $targetType = $document->target_type ?: ($document->building_id ? 'building' : 'all');

        return match ($targetType) {
            'building' => $document->building?->name
                ? 'Building '.$document->building->name
                : 'Building #'.$document->building_id,
            'apartment' => $document->apartment
                ? trim(($document->apartment->floor?->building?->name ? $document->apartment->floor->building->name.' - ' : '').'Apartment '.$document->apartment->number)
                : 'Apartment #'.$document->apartment_id,
            'role' => 'Role '.$document->target_role,
            default => 'Everyone',
        };
    }
}
