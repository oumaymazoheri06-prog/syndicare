<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Documents/Index', [
            'documents' => Document::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Documents/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'file_path' => ['required', 'string', 'max:255'],
        ]);

        Document::create($validated + ['uploaded_by' => $request->user()->id]);

        return redirect()->route('documents.index')->with('success', 'Document created successfully.');
    }

    public function show(Document $document): Response
    {
        return Inertia::render('Documents/Show', [
            'document' => $document,
        ]);
    }

    public function edit(Document $document): Response
    {
        return Inertia::render('Documents/Edit', [
            'document' => $document,
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'file_path' => ['required', 'string', 'max:255'],
        ]);

        $document->update($validated);

        return redirect()->route('documents.index')->with('success', 'Document updated successfully.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        return redirect()->route('documents.index')->with('success', 'Document deleted successfully.');
    }
}
