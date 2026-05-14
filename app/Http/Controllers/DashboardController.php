<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Apartment;
use App\Models\Building;
use App\Models\Charge;
use App\Models\Document;
use App\Models\Expense;
use App\Models\Item;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\User;
use App\Services\ChargeGenerationService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        if ($user?->role === 'Coproprietaire') {
            return $this->coOwnerDashboard($user);
        }

        if ($user?->role === 'Locataire') {
            return $this->tenantDashboard($user);
        }

        $buildingId = request()->query('building_id');
        $isGlobal = ! $buildingId;
        $now = now();
        $months = collect(range(5, 0))->map(
            fn (int $offset) => $now->copy()->startOfMonth()->subMonthsNoOverflow($offset)
        );
        $expenseBase = Expense::query();
        if ($buildingId) {
            $expenseBase->where('building_id', $buildingId);
        }
        $paymentBase = Payment::query();
        if ($buildingId) {
            $paymentBase->whereHas('charge.apartment.floor.building', fn ($query) => $query->where('id', $buildingId));
        }
        $chargeBase = Charge::query();
        if ($buildingId) {
            $chargeBase->whereHas('apartment.floor.building', fn ($query) => $query->where('id', $buildingId));
        }

        $monthlySeries = $months->map(function (Carbon $month) use ($expenseBase, $paymentBase, $chargeBase) {
            return [
                'label' => $month->format('M Y'),
                'expenses' => (float) (clone $expenseBase)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
                'charges' => (float) (clone $chargeBase)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
                'payments' => (float) (clone $paymentBase)
                    ->whereNotNull('payment_date')
                    ->whereYear('payment_date', $month->year)
                    ->whereMonth('payment_date', $month->month)
                    ->where('status', 'validated')
                    ->sum('amount'),
            ];
        });

        $chargeStatuses = Charge::query()
            ->when($buildingId, function ($query) use ($buildingId) {
                $query->whereHas('apartment.floor.building', fn ($q) => $q->where('id', $buildingId));
            })
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $ticketStatuses = Ticket::query()
            ->when($buildingId, function ($query) use ($buildingId) {
                $query->whereHas('apartment.floor.building', fn ($q) => $q->where('id', $buildingId));
            })
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();
        $mode = $isGlobal ? 'global' : 'building';
        $buildings = Building::query()
            ->with(['apartments', 'expenses' => function ($query) use ($now) {
                $query->whereYear('date', $now->year)->whereMonth('date', $now->month);
            }])
            ->orderBy('name')
            ->get()
            ->map(function (Building $building) use ($mode) {

                $apartments = $building->apartments;

                $areaTotal = $apartments->sum(fn ($a) => (float) ($a->area ?? 0));

                $occupied = $apartments->whereNotNull('user_id')->count();

                $expenses = (float) $building->expenses->sum('amount');

                // tantième (same for both modes)
                $totalExpenses = (float) $building->expenses->sum('amount');

                $totalCharges = $totalExpenses;

                return [
                    'id' => $building->id,
                    'name' => $building->name,
                    'address' => $building->address,

                    // always shown
                    'apartments' => $apartments->count(),
                    'occupied' => $occupied,
                    'occupancyRate' => $apartments->count() > 0
                        ? round(($occupied / $apartments->count()) * 100)
                        : 0,

                    'areaTotal' => round($areaTotal, 2),

                    // mode-aware data
                    'expenses' => round($expenses, 2),
                    'charges' => round($totalCharges, 2),

                    'mode' => $mode,
                ];
            });

        $expenseQuery = Expense::query()
            ->when($buildingId, fn ($q) => $q->where('building_id', $buildingId)
            );
        $chargeQuery = Charge::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            });
        $paymentQuery = Payment::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('charge.apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            });
        $ticketQuery = Ticket::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            });
        $itemQuery = Item::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            });

        $residentCount = $buildingId
            ? Apartment::query()
                ->whereHas('floor.building', fn ($q) => $q->where('id', $buildingId))
                ->whereNotNull('user_id')
                ->distinct('user_id')
                ->count('user_id')
            : User::count();

        $buildingCount = $buildingId
            ? Building::query()->whereKey($buildingId)->count()
            : Building::count();

        $apartmentCount = $buildingId
            ? Apartment::query()
                ->whereHas('floor.building', fn ($q) => $q->where('id', $buildingId))
                ->count()
            : Apartment::count();

        $summary = [
            'users' => $residentCount,
            'buildings' => $buildingCount,
            'apartments' => $apartmentCount,

            'charges' => (clone $chargeQuery)->count(),
            'payments' => (clone $paymentQuery)->count(),
            'tickets' => (clone $ticketQuery)->count(),
            'items' => (clone $itemQuery)->count(),

            'expensesThisMonth' => (clone $expenseQuery)
                ->whereYear('date', $now->year)
                ->whereMonth('date', $now->month)
                ->sum('amount'),

            'chargesThisMonth' => (clone $chargeQuery)
                ->whereYear('date', $now->year)
                ->whereMonth('date', $now->month)
                ->sum('amount'),

            'validatedPaymentsThisMonth' => (clone $paymentQuery)
                ->where('status', 'validated')
                ->whereNotNull('payment_date')
                ->whereYear('payment_date', $now->year)
                ->whereMonth('payment_date', $now->month)
                ->sum('amount'),

            'unpaidCharges' => (clone $chargeQuery)
                ->whereIn('status', ['pending', 'overdue'])
                ->sum('amount'),
        ];

        $pendingPayments = (clone $paymentQuery)
            ->with(['charge.apartment.floor.building', 'charge.apartment.user'])
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Payment $payment) {
                $charge = $payment->charge;
                $apartment = $charge?->apartment;

                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                    'payment_date' => optional($payment->payment_date)->format('d/m/Y') ?? '-',
                    'charge' => $charge?->description,
                    'apartment' => $apartment?->number,
                    'building' => $apartment?->floor?->building?->name,
                    'resident' => $apartment?->user?->name,
                ];
            });

        $urgentTickets = (clone $ticketQuery)
            ->with(['apartment.floor.building', 'createdBy'])
            ->whereIn('status', ['open', 'in_progress'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Ticket $ticket) {
                return [
                    'id' => $ticket->id,
                    'title' => $ticket->title,
                    'status' => $ticket->status,
                    'apartment' => $ticket->apartment?->number,
                    'building' => $ticket->apartment?->floor?->building?->name,
                    'created_by' => $ticket->createdBy?->name,
                    'created_at' => optional($ticket->created_at)->diffForHumans(),
                ];
            });

        $recentAnnouncements = Announcement::query()
            ->when($buildingId, function ($query) use ($buildingId) {
                $query->where(function ($q) use ($buildingId) {
                    $q->whereNull('building_id')->orWhere('building_id', $buildingId);
                });
            })
            ->with(['building', 'creator'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(function (Announcement $announcement) {
                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'target_role' => $announcement->target_role,
                    'building' => $announcement->building?->name ?? 'Tous les immeubles',
                    'creator' => $announcement->creator?->name,
                    'created_at' => optional($announcement->created_at)->diffForHumans(),
                ];
            });

        $recentDocuments = Document::query()
            ->with('uploader')
            ->latest()
            ->limit(4)
            ->get()
            ->map(function (Document $document) {
                return [
                    'id' => $document->id,
                    'title' => $document->title,
                    'uploader' => $document->uploader?->name,
                    'created_at' => optional($document->created_at)->diffForHumans(),
                ];
            });

        $collectionRate = (float) $summary['chargesThisMonth'] > 0
            ? round(((float) $summary['validatedPaymentsThisMonth'] / (float) $summary['chargesThisMonth']) * 100)
            : 0;

        $health = [
            'collectionRate' => min($collectionRate, 100),
            'pendingPayments' => (clone $paymentQuery)->where('status', 'pending')->count(),
            'overdueCharges' => (clone $chargeQuery)->where('status', 'overdue')->count(),
            'openTickets' => (clone $ticketQuery)->whereIn('status', ['open', 'in_progress'])->count(),
            'openItems' => (clone $itemQuery)->whereIn('status', ['ouvert', 'en_contact'])->count(),
            'documents' => Document::count(),
            'announcementsThisMonth' => Announcement::query()
                ->when($buildingId, function ($query) use ($buildingId) {
                    $query->where(function ($q) use ($buildingId) {
                        $q->whereNull('building_id')->orWhere('building_id', $buildingId);
                    });
                })
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count(),
        ];

        $recentChargesQuery = Charge::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            })
            ->with(['apartment.floor.building'])
            ->latest()
            ->limit(6);
        $recentCharges = $recentChargesQuery
            ->get()
            ->map(function (Charge $charge) {
                return [
                    'id' => $charge->id,
                    'description' => $charge->description,
                    'amount' => (float) $charge->amount,
                    'status' => $charge->status,
                    'date' => optional($charge->date)->format('d/m/Y') ?? $charge->date,
                    'apartment' => $charge->apartment?->number,
                    'building' => $charge->apartment?->floor?->building?->name,
                ];
            });
        $recentExpensesQuery = Expense::query()
            ->when($buildingId, fn ($q) => $q->where('building_id', $buildingId)
            )
            ->with('building')
            ->latest()
            ->limit(6);
        $recentExpenses = $recentExpensesQuery
            ->get()
            ->map(function (Expense $expense) {
                return [
                    'id' => $expense->id,
                    'title' => $expense->title,
                    'description' => $expense->description,
                    'amount' => (float) $expense->amount,
                    'date' => optional($expense->date)->format('d/m/Y') ?? $expense->date,
                    'building' => $expense->building?->name,
                ];
            });
        $priorityChargesQuery = Charge::query()
            ->when($buildingId, function ($q) use ($buildingId) {
                $q->whereHas('apartment.floor.building', fn ($q2) => $q2->where('id', $buildingId)
                );
            })
            ->with(['apartment.floor.building'])
            ->whereIn('status', ['pending', 'overdue']);
        $priorityCharges = $priorityChargesQuery
            ->orderByRaw("CASE WHEN status = 'overdue' THEN 0 ELSE 1 END")
            ->latest('date')
            ->limit(8)
            ->get()
            ->map(function (Charge $charge) {
                return [
                    'id' => $charge->id,
                    'description' => $charge->description,
                    'amount' => (float) $charge->amount,
                    'status' => $charge->status,
                    'apartment' => $charge->apartment?->number,
                    'building' => $charge->apartment?->floor?->building?->name,
                ];
            });
        $recentItems = (clone $itemQuery)
            ->with(['user', 'apartment.floor.building'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function (Item $item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'category' => $item->category,
                    'type' => $item->type,
                    'status' => $item->status,
                    'location' => $item->location,
                    'apartment' => $item->apartment?->number,
                    'building' => $item->apartment?->floor?->building?->name,
                    'created_by' => $item->user?->name,
                    'created_at' => optional($item->created_at)->diffForHumans(),
                ];
            });

        return Inertia::render('Dashboard', [
            'isGlobal' => $isGlobal,
            'summary' => $summary,
            'monthlySeries' => $monthlySeries,
            'chargeStatuses' => $chargeStatuses,
            'ticketStatuses' => $ticketStatuses,
            'buildings' => $buildings,
            'recentCharges' => $recentCharges,
            'recentExpenses' => $recentExpenses,
            'priorityCharges' => $priorityCharges,
            'pendingPayments' => $pendingPayments,
            'urgentTickets' => $urgentTickets,
            'recentAnnouncements' => $recentAnnouncements,
            'recentDocuments' => $recentDocuments,
            'recentItems' => $recentItems,
            'health' => $health,
        ]);
    }

    private function coOwnerDashboard(User $user): Response
    {
        $now = now();
        $months = collect(range(5, 0))->map(
            fn (int $offset) => $now->copy()->startOfMonth()->subMonthsNoOverflow($offset)
        );

        $apartments = Apartment::query()
            ->where('user_id', $user->id)
            ->with(['floor.building', 'charges.payments.receipt', 'tickets'])
            ->orderBy('number')
            ->get();

        $apartmentIds = $apartments->pluck('id');
        $buildingIds = $apartments
            ->map(fn (Apartment $apartment) => $apartment->floor?->building?->id)
            ->filter()
            ->unique()
            ->values();

        $chargeQuery = Charge::query()->whereIn('apartment_id', $apartmentIds);
        $paymentQuery = Payment::query()
            ->whereHas('charge', fn ($query) => $query->whereIn('apartment_id', $apartmentIds));
        $ticketQuery = Ticket::query()
            ->where(function ($query) use ($user, $apartmentIds) {
                $query->where('assingned_by', $user->id);

                if ($apartmentIds->isNotEmpty()) {
                    $query->orWhereIn('apartment_id', $apartmentIds);
                }
            });

        $unpaidCharges = (clone $chargeQuery)
            ->whereIn('status', ['pending', 'overdue'])
            ->sum('amount');
        $validatedPayments = (clone $paymentQuery)
            ->where('status', 'validated')
            ->sum('amount');
        $monthlyCharges = (clone $chargeQuery)
            ->whereYear('date', $now->year)
            ->whereMonth('date', $now->month)
            ->sum('amount');

        $monthlySeries = $months->map(function (Carbon $month) use ($apartmentIds) {
            return [
                'label' => $month->format('M Y'),
                'charges' => (float) Charge::query()
                    ->whereIn('apartment_id', $apartmentIds)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->sum('amount'),
                'payments' => (float) Payment::query()
                    ->whereHas('charge', fn ($query) => $query->whereIn('apartment_id', $apartmentIds))
                    ->whereNotNull('payment_date')
                    ->whereYear('payment_date', $month->year)
                    ->whereMonth('payment_date', $month->month)
                    ->where('status', 'validated')
                    ->sum('amount'),
            ];
        });

        $apartmentCards = $apartments->map(function (Apartment $apartment) {
            $charges = $apartment->charges;
            $balance = (float) $charges
                ->whereIn('status', ['pending', 'overdue'])
                ->sum('amount');
            $paid = (float) $charges
                ->flatMap(fn (Charge $charge) => $charge->payments)
                ->where('status', 'validated')
                ->sum('amount');

            return [
                'id' => $apartment->id,
                'number' => $apartment->number,
                'area' => (float) ($apartment->area ?? 0),
                'building' => $apartment->floor?->building?->name,
                'floor' => $apartment->floor?->number,
                'balance' => $balance,
                'paid' => $paid,
                'open_tickets' => $apartment->tickets
                    ->whereIn('status', ['open', 'in_progress'])
                    ->count(),
                'status' => $balance > 0 ? 'A regulariser' : 'A jour',
            ];
        });

        $recentCharges = (clone $chargeQuery)
            ->with(['apartment.floor.building', 'payments.receipt'])
            ->latest('date')
            ->limit(8)
            ->get()
            ->map(function (Charge $charge) {
                $latestPayment = $charge->payments->sortByDesc('created_at')->first();
                $receipt = $charge->payments
                    ->where('status', 'validated')
                    ->map(fn (Payment $payment) => $payment->receipt)
                    ->filter()
                    ->first();

                return [
                    'id' => $charge->id,
                    'description' => $charge->description,
                    'amount' => (float) $charge->amount,
                    'status' => $charge->status,
                    'date' => optional($charge->date)->format('d/m/Y') ?? $charge->date,
                    'apartment' => $charge->apartment?->number,
                    'building' => $charge->apartment?->floor?->building?->name,
                    'payment_status' => $latestPayment?->status,
                    'receipt_path' => $receipt?->file_path,
                ];
            });

        $payments = (clone $paymentQuery)
            ->with(['charge.apartment.floor.building', 'receipt'])
            ->latest('payment_date')
            ->latest()
            ->limit(6)
            ->get()
            ->map(function (Payment $payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                    'payment_date' => optional($payment->payment_date)->format('d/m/Y') ?? '-',
                    'charge' => $payment->charge?->description,
                    'apartment' => $payment->charge?->apartment?->number,
                    'building' => $payment->charge?->apartment?->floor?->building?->name,
                    'receipt_path' => $payment->receipt?->file_path,
                ];
            });

        $tickets = (clone $ticketQuery)
            ->with(['apartment.floor.building', 'assignedTo'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'assigned_to' => $ticket->assignedTo?->name,
                'apartment' => $ticket->apartment?->number,
                'building' => $ticket->apartment?->floor?->building?->name,
                'created_at' => optional($ticket->created_at)->diffForHumans(),
            ]);

        $announcements = $this->visibleAnnouncements($buildingIds, [
            'all',
            'coproprietaires',
            'copropriétaires',
            'copropriÃ©taires',
        ])->limit(4)->get()->map(fn (Announcement $announcement) => [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'content' => $announcement->content,
            'target_role' => $announcement->target_role,
            'building' => $announcement->building?->name ?? 'Tous les immeubles',
            'creator' => $announcement->creator?->name,
            'created_at' => optional($announcement->created_at)->diffForHumans(),
        ]);

        $documents = Document::query()
            ->with('uploader')
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Document $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'file_path' => $document->file_path,
                'uploader' => $document->uploader?->name,
                'created_at' => optional($document->created_at)->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'roleDashboard' => [
                'role' => 'Coproprietaire',
                'summary' => [
                    'lots' => $apartments->count(),
                    'buildings' => $buildingIds->count(),
                    'balance' => (float) $unpaidCharges,
                    'monthlyCharges' => (float) $monthlyCharges,
                    'validatedPayments' => (float) $validatedPayments,
                    'openTickets' => (clone $ticketQuery)->whereIn('status', ['open', 'in_progress'])->count(),
                    'documents' => $documents->count(),
                ],
                'apartments' => $apartmentCards,
                'monthlySeries' => $monthlySeries,
                'charges' => $recentCharges,
                'payments' => $payments,
                'tickets' => $tickets,
                'announcements' => $announcements,
                'documents' => $documents,
            ],
        ]);
    }

    private function tenantDashboard(User $user): Response
    {
        $apartments = Apartment::query()
            ->where('user_id', $user->id)
            ->with('floor.building')
            ->orderBy('number')
            ->get();

        $apartmentIds = $apartments->pluck('id');
        $buildingIds = $apartments
            ->map(fn (Apartment $apartment) => $apartment->floor?->building?->id)
            ->filter()
            ->unique()
            ->values();

        $ticketQuery = Ticket::query()
            ->where(function ($query) use ($user, $apartmentIds) {
                $query->where('assingned_by', $user->id);

                if ($apartmentIds->isNotEmpty()) {
                    $query->orWhereIn('apartment_id', $apartmentIds);
                }
            });

        $announcements = $this->visibleAnnouncements($buildingIds, ['all', 'locataires'])
            ->limit(8)
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
                'target_role' => $announcement->target_role,
                'building' => $announcement->building?->name ?? 'Tous les immeubles',
                'creator' => $announcement->creator?->name,
                'created_at' => optional($announcement->created_at)->diffForHumans(),
            ]);

        $tickets = (clone $ticketQuery)
            ->with(['apartment.floor.building', 'assignedTo'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Ticket $ticket) => [
                'id' => $ticket->id,
                'title' => $ticket->title,
                'description' => $ticket->description,
                'status' => $ticket->status,
                'assigned_to' => $ticket->assignedTo?->name,
                'apartment' => $ticket->apartment?->number,
                'building' => $ticket->apartment?->floor?->building?->name,
                'created_at' => optional($ticket->created_at)->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'roleDashboard' => [
                'role' => 'Locataire',
                'summary' => [
                    'apartments' => $apartments->count(),
                    'announcements' => $announcements->count(),
                    'openTickets' => (clone $ticketQuery)->whereIn('status', ['open', 'in_progress'])->count(),
                    'closedTickets' => (clone $ticketQuery)->where('status', 'closed')->count(),
                ],
                'apartments' => $apartments->map(fn (Apartment $apartment) => [
                    'id' => $apartment->id,
                    'number' => $apartment->number,
                    'building' => $apartment->floor?->building?->name,
                    'floor' => $apartment->floor?->number,
                ]),
                'announcements' => $announcements,
                'tickets' => $tickets,
            ],
        ]);
    }

    private function visibleAnnouncements($buildingIds, array $roles)
    {
        return Announcement::query()
            ->whereIn('target_role', $roles)
            ->where(function ($query) use ($buildingIds) {
                $query->whereNull('building_id');

                if ($buildingIds->isNotEmpty()) {
                    $query->orWhereIn('building_id', $buildingIds);
                }
            })
            ->with(['building', 'creator'])
            ->latest();
    }

    public function previewMonthlyCharges(Request $request, ChargeGenerationService $service): array
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'building_id' => ['nullable', 'integer', 'exists:buildings,id'],
        ]);

        return $service->preview(
            period: $this->chargePeriod($validated['month'] ?? null),
            buildingId: $validated['building_id'] ?? null,
        );
    }

    public function generateMonthlyChargesForPeriod(
        Request $request,
        ChargeGenerationService $service,
        NotificationService $notifications,
    ): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'building_id' => ['nullable', 'integer', 'exists:buildings,id'],
        ]);

        $period = $this->chargePeriod($validated['month'] ?? null);
        $buildingId = $validated['building_id'] ?? null;
        $result = $service->generate($period, $buildingId);

        $this->notifyGeneratedCharges($result['created_charge_ids'] ?? [], $period, $notifications);

        return redirect()
            ->route('dashboard', $buildingId ? ['building_id' => $buildingId] : [])
            ->with(
                'success',
                $result['created'].' charges generees pour '.$result['period_label'].
                ' ('.$result['skipped'].' deja existantes).'
            );
    }

    private function chargePeriod(?string $month): Carbon
    {
        return $month
            ? Carbon::createFromFormat('Y-m', $month)->startOfMonth()
            : now()->startOfMonth();
    }

    private function notifyGeneratedCharges(array $chargeIds, Carbon $period, NotificationService $notifications): void
    {
        if ($chargeIds === []) {
            return;
        }

        Charge::query()
            ->with('apartment.user')
            ->whereIn('id', $chargeIds)
            ->get()
            ->filter(fn (Charge $charge) => $charge->apartment?->user)
            ->groupBy(fn (Charge $charge) => $charge->apartment->user->id)
            ->each(function ($charges) use ($period, $notifications): void {
                $firstCharge = $charges->first();
                $user = $firstCharge->apartment->user;
                $total = $charges->sum(fn (Charge $charge) => (float) $charge->amount);
                $apartments = $charges
                    ->pluck('apartment.number')
                    ->filter()
                    ->unique()
                    ->implode(', ');

                $notifications->createForUser(
                    $user,
                    'Nouvelles charges',
                    sprintf(
                        '%d charge(s) generee(s) pour %s%s. Total: %s MAD.',
                        $charges->count(),
                        $period->format('m/Y'),
                        $apartments ? ' - appartement(s) '.$apartments : '',
                        number_format($total, 2, ',', ' ')
                    ),
                    'warning'
                );
            });
    }
}
