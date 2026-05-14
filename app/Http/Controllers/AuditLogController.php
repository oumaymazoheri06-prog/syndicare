<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('AuditLogs/Index', [
            'auditLogs' => Audit_log::query()->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('AuditLogs/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        Audit_log::create($validated + ['performed_by' => $request->user()->id]);

        return redirect()->route('audit-logs.index')->with('success', 'Audit log created successfully.');
    }

    public function show(Audit_log $audit_log): Response
    {
        return Inertia::render('AuditLogs/Show', [
            'auditLog' => $audit_log,
        ]);
    }

    public function edit(Audit_log $audit_log): Response
    {
        return Inertia::render('AuditLogs/Edit', [
            'auditLog' => $audit_log,
        ]);
    }

    public function update(Request $request, Audit_log $audit_log): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        $audit_log->update($validated);

        return redirect()->route('audit-logs.index')->with('success', 'Audit log updated successfully.');
    }

    public function destroy(Audit_log $audit_log): RedirectResponse
    {
        $audit_log->delete();

        return redirect()->route('audit-logs.index')->with('success', 'Audit log deleted successfully.');
    }
}
