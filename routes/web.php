<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\CacheLockController;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FloorController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketMessageController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/dashboard/charges-preview', [DashboardController::class, 'previewMonthlyCharges'])
    ->middleware(['auth', 'verified', 'role:Syndic'])
    ->name('dashboard.charges-preview');

Route::post('/dashboard/generate-charges', [DashboardController::class, 'generateMonthlyChargesForPeriod'])
    ->middleware(['auth', 'verified', 'role:Syndic'])
    ->name('dashboard.generate-charges');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('apartments', ApartmentController::class);
    Route::resource('buildings', BuildingController::class);
    Route::resource('floors', FloorController::class);
    Route::resource('charges', ChargeController::class);
    Route::resource('expenses', ExpenseController::class);
    Route::resource('items', ItemController::class);
    Route::post('items/{item}/claims', [ItemController::class, 'claim'])->name('items.claims.store');
    Route::patch('items/{item}/status', [ItemController::class, 'updateStatus'])->name('items.status.update');
    Route::resource('tickets', TicketController::class);
    Route::resource('ticket-messages', TicketMessageController::class);
    Route::resource('announcements', AnnouncementController::class);
    Route::resource('payments', PaymentController::class);
    Route::resource('receipts', ReceiptController::class);
    Route::resource('audit-logs', AuditLogController::class);
    Route::resource('documents', DocumentController::class);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.mark-read');
    Route::patch('notifications/{notification}/unread', [NotificationController::class, 'markUnread'])->name('notifications.mark-unread');
    Route::resource('notifications', NotificationController::class);
    Route::post('users/{user}/invitation', [UserController::class, 'resendInvitation'])->name('users.invitation.resend');
    Route::resource('users', UserController::class);

    Route::resource('cache-locks', CacheLockController::class);
});

require __DIR__.'/auth.php';
