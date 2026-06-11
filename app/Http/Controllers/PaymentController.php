<?php

namespace App\Http\Controllers;

use App\Models\Audit_log;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Payment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Payment::class);

        $validated = $request->validate([
            'building_id' => ['nullable', 'integer', $this->tenantExists('buildings')],
        ]);
        $buildingId = $validated['building_id'] ?? null;

        $query = Payment::query()
            ->with(['charge.apartment.floor.building', 'charge.apartment.user', 'user'])
            ->latest();

        if ($buildingId) {
            $query->whereHas('charge.apartment.floor.building', function ($q) use ($buildingId) {
                $q->whereKey($buildingId);
            });
        }

        if ($request->user()->role !== 'Syndic') {
            $query->whereHas('charge.apartment', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            });
        }

        $buildings = Building::query()
            ->when($request->user()->role !== 'Syndic', function ($buildingQuery) use ($request) {
                $buildingQuery->whereHas('apartments', function ($apartmentQuery) use ($request) {
                    $apartmentQuery->where('user_id', $request->user()->id);
                });
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Payments/Index', [
            'payments' => $query->paginate(10)->withQueryString(),
            'buildings' => $buildings,
            'filters' => [
                'building_id' => $buildingId ? (string) $buildingId : '',
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Payment::class);

        $charges = Charge::query()
            ->with('apartment.floor.building')
            ->orderBy('date');
        $selectedCharge = null;
        $syndic = User::query()
            ->where('organization_id', $request->user()->organization_id)
            ->where('role', 'Syndic')
            ->orderBy('id')
            ->first(['id', 'name', 'phone_number', 'payment_rib']);

        if ($request->user()->role !== 'Syndic') {
            $charges
                ->whereIn('status', ['pending', 'overdue'])
                ->whereDoesntHave('payments', function ($q) {
                    $q->whereIn('status', ['pending', 'validated']);
                })
                ->whereHas('apartment', function ($apartmentQuery) use ($request) {
                    $apartmentQuery->where('user_id', $request->user()->id);
                });
        }

        if ($request->filled('charge_id')) {
            $selectedCharge = Charge::query()->findOrFail($request->integer('charge_id'));
            $this->authorize('view', $selectedCharge);
        }

        return Inertia::render('Payments/Create', [
            'charges' => $charges->get(),
            'paymentDefaults' => [
                'amount' => $selectedCharge?->amount,
                'charge_id' => $selectedCharge?->id,
                'status' => 'pending',
                'payment_date' => now()->toDateString(),
                'method' => '',
                'payment_proof' => null,
            ],
            'paymentInstructions' => [
                'rib' => $syndic?->payment_rib,
                'cashplus_name' => $syndic?->name,
                'cashplus_phone' => $syndic?->phone_number,
            ],
        ]);
    }

    public function store(Request $request, NotificationService $notifications): RedirectResponse
    {
        $this->authorize('create', Payment::class);
        $isSyndic = $request->user()->role === 'Syndic';
        $messages = app()->getLocale() === 'ar'
            ? [
                'method.required' => 'طريقة الدفع مطلوبة.',
                'method.in' => 'طريقة الدفع المختارة غير صحيحة.',
                'payment_proof.required' => 'إثبات الدفع مطلوب إلا إذا اخترت الدفع المباشر للسانديك.',
                'payment_proof.file' => 'إثبات الدفع يجب أن يكون ملفا.',
                'payment_proof.mimes' => 'إثبات الدفع يجب أن يكون صورة JPG أو PNG أو ملف PDF.',
                'payment_proof.max' => 'حجم إثبات الدفع يجب ألا يتجاوز 4 ميغابايت.',
            ]
            : [
                'method.required' => 'La methode de paiement est obligatoire.',
                'method.in' => 'La methode de paiement selectionnee est invalide.',
                'payment_proof.required' => 'La preuve de paiement est obligatoire sauf pour le paiement direct au syndic.',
                'payment_proof.file' => 'La preuve de paiement doit etre un fichier.',
                'payment_proof.mimes' => 'La preuve de paiement doit etre une image JPG/PNG ou un fichier PDF.',
                'payment_proof.max' => 'La preuve de paiement ne doit pas depasser 4 Mo.',
            ];

        $validated = $request->validate([
            'charge_id' => ['required', $this->tenantExists('charges')],
            'amount' => [$isSyndic ? 'required' : 'nullable', 'numeric', 'min:0'],
            'status' => [$isSyndic ? 'required' : 'nullable', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
            'method' => [$isSyndic ? 'nullable' : 'required', Rule::in(['virement', 'cashplus', 'manuel'])],
            'payment_proof' => [
                Rule::requiredIf(fn () => ! $isSyndic && $request->input('method') !== 'manuel'),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:4096',
            ],
        ], $messages);

        $charge = Charge::query()->with('apartment')->findOrFail($validated['charge_id']);
        $this->authorize('view', $charge);

        $lockName = 'payment:create:charge:'.$validated['charge_id'].':user:'.$request->user()->id;
        $lock = Cache::lock($lockName, 300);

        if (! $lock->get()) {
            return back()->with('error', 'Cette action est deja en cours.');
        }

        try {
            if (! $isSyndic) {
                if ($charge->status === 'paid') {
                    return back()->with('error', 'Cette charge est deja payee.');
                }

                if ($charge->payments()->whereIn('status', ['pending', 'validated'])->exists()) {
                    return back()->with('error', 'Un paiement est deja en attente ou valide pour cette charge.');
                }
            }

            $proofPath = $request->hasFile('payment_proof')
                ? $request->file('payment_proof')->store('payment-proofs', 'public')
                : null;

            $paymentData = $isSyndic
                ? [
                    'amount' => $validated['amount'],
                    'charge_id' => $validated['charge_id'],
                    'status' => $validated['status'],
                    'payment_date' => $validated['payment_date'] ?? null,
                    'method' => $validated['method'] ?? null,
                    'payment_proof' => $proofPath,
                    'user_id' => $charge->apartment?->user_id ?? $request->user()->id,
                ]
                : [
                    'amount' => $charge->amount,
                    'charge_id' => $charge->id,
                    'status' => 'pending',
                    'payment_date' => now()->toDateString(),
                    'method' => $validated['method'],
                    'payment_proof' => $proofPath,
                    'user_id' => $request->user()->id,
                ];

            $payment = Payment::create($paymentData);

            $payment->load(['charge.apartment.floor.building', 'charge.apartment.user', 'user']);

            Audit_log::create([
                'action' => 'Creation de paiement',
                'details' => 'Un paiement de '.$payment->amount.' DH a ete enregistre pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
                'performed_by' => auth()->id(),
            ]);

            $notifications->createForRole(
                'Syndic',
                'Nouveau paiement',
                sprintf(
                    'Un paiement de %s MAD a ete envoye pour la charge "%s".',
                    number_format((float) $payment->amount, 2, ',', ' '),
                    $payment->charge?->description ?? 'Charge'
                ),
                'info'
            );

            return redirect()
                ->route($isSyndic ? 'payments.index' : 'charges.index')
                ->with('success', $isSyndic ? 'Payment created successfully.' : 'Votre preuve de paiement a ete envoyee au syndic.');
        } finally {
            $lock->release();
        }
    }

    public function show(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        return Inertia::render('Payments/Show', [
            'payment' => $payment->load(['charge.apartment.floor.building', 'charge.apartment.user', 'user']),
        ]);
    }

    public function edit(Payment $payment): Response
    {
        $this->authorize('update', $payment);

        return Inertia::render('Payments/Edit', [
            'payment' => $payment,
            'charges' => Charge::query()->orderBy('date')->get(),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $this->authorize('update', $payment);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'charge_id' => ['required', $this->tenantExists('charges')],
            'status' => ['required', Rule::in(['pending', 'validated'])],
            'payment_date' => ['nullable', 'date'],
            'method' => ['nullable', Rule::in(['virement', 'cashplus', 'manuel'])],
            'payment_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ]);

        $paymentData = $validated;
        unset($paymentData['payment_proof']);

        if ($request->hasFile('payment_proof')) {
            $paymentData['payment_proof'] = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        $payment->update($paymentData);
        if ($payment->wasChanged('status') && $payment->status === 'validated') {
            $payment->charge->update(['status' => 'paid']);
        }

        Audit_log::create([
            'action' => 'Mise à jour de paiement',
            'details' => 'Le paiement de '.$payment->amount.' DH a été mis à jour pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
            'performed_by' => auth()->id(),
        ]);

        return redirect()->route('payments.index')->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $this->authorize('delete', $payment);

        $payment->delete();

        Audit_log::create([
            'action' => 'Suppression de paiement',
            'details' => 'Le paiement de '.$payment->amount.' DH a été supprimé pour la charge "'.$payment->charge->description.'" de l\'appartement '.$payment->charge->apartment->number.'.',
            'performed_by' => auth()->id(),
        ]);
                                                 
        return redirect()->route('payments.index')->with('success', 'Payment deleted successfully.');
    }
}
