<?php

namespace App\Http\Controllers;

use App\Models\Cache_lock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CacheLockController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('CacheLocks/Index', [
            'cacheLocks' => Cache_lock::query()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('CacheLocks/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:255', 'unique:cache_locks,key'],
            'owner' => ['required', 'string', 'max:255'],
            'expiration' => ['required', 'integer'],
        ]);

        Cache_lock::create($validated);

        return redirect()->route('cache-locks.index')->with('success', 'Traitement créé avec succès.');
    }

    public function show(Cache_lock $cache_lock): Response
    {
        return Inertia::render('CacheLocks/Show', [
            'cacheLock' => $cache_lock,
        ]);
    }

    public function edit(Cache_lock $cache_lock): Response
    {
        return Inertia::render('CacheLocks/Edit', [
            'cacheLock' => $cache_lock,
        ]);
    }

    public function update(Request $request, Cache_lock $cache_lock): RedirectResponse
    {
        $validated = $request->validate([
            'owner' => ['required', 'string', 'max:255'],
            'expiration' => ['required', 'integer'],
        ]);

        $cache_lock->update($validated);

        return redirect()->route('cache-locks.index')->with('success', 'Traitement mis à jour avec succès.');
    }

    public function destroy(Cache_lock $cache_lock): RedirectResponse
    {
        $cache_lock->delete();

        return redirect()->route('cache-locks.index')->with('success', 'Traitement supprimé avec succès.');
    }
}
