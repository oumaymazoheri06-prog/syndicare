<?php
use App\Http\Controllers\Admin\OrganizationController as AdminOrganizationController;
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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Middleware\RoleMiddleware;

Route::post('/language', function (Request $request) {
    $locale = (string) $request->input('locale', 'fr');
    $supportedLocales = array_keys(config('app.supported_locales', []));

    abort_unless(in_array($locale, $supportedLocales, true), 422);

    $request->session()->put('locale', $locale);
    app()->setLocale($locale);

    return back();
})->name('language.update');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/blog/{slug}', function (string $slug) {
    return Inertia::render('Blog/Show', [
        'slug' => $slug,
    ]);
})->name('blog.show');


Route::middleware(['auth', 'verified', 'role:SuperAdmin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('organizations', AdminOrganizationController::class)
            ->only(['index', 'edit', 'update']);
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
});

Route::middleware(['auth', 'verified', 'role:Syndic'])->group(function(){

Route::post('users/{user}/invitation', [UserController::class, 'resendInvitation'])->name('users.invitation.resend');
    Route::resource('users', UserController::class);

 Route::resource('apartments', ApartmentController::class);
    Route::resource('buildings', BuildingController::class);
    Route::resource('floors', FloorController::class);
    
    Route::resource('expenses', ExpenseController::class);
    Route::resource('audit-logs', AuditLogController::class);
    Route::resource('cache-locks', CacheLockController::class);




}







);


   Route::middleware(['auth','verified'])->group(function(){

Route::resource('charges', ChargeController::class);
 Route::post('items/{item}/claims', [ItemController::class, 'claim'])->name('items.claims.store');
    Route::patch('items/{item}/status', [ItemController::class, 'updateStatus'])->name('items.status.update');
    Route::resource('tickets', TicketController::class);
    Route::resource('ticket-messages', TicketMessageController::class);
    Route::resource('announcements', AnnouncementController::class);
    Route::resource('payments', PaymentController::class);
    Route::resource('receipts', ReceiptController::class);
  
    Route::resource('documents', DocumentController::class);
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.mark-read');
    Route::patch('notifications/{notification}/unread', [NotificationController::class, 'markUnread'])->name('notifications.mark-unread');
    Route::resource('notifications', NotificationController::class);
    
 Route::resource('items', ItemController::class);


   });
   
   

require __DIR__.'/auth.php';
