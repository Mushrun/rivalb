<?php

use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\ChallengeController as AdminChallengeController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DisputeController as AdminDisputeController;
use App\Http\Controllers\Admin\FighterController as AdminFighterController;
use App\Http\Controllers\Admin\MatchController as AdminMatchController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\WithdrawController;
use App\Http\Controllers\DisputeController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WalletController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect('/login'));

// Wallet routes publiques (login MetaMask sans être connecté)
Route::get('/wallet/nonce/{address}', [WalletController::class, 'nonce']);
Route::post('/wallet/verify',         [WalletController::class, 'verify']);

// Auth routes (guest only)
Route::middleware('guest')->group(function () {
    Route::get('/login',          fn() => Inertia::render('Login'))->name('login');
    Route::post('/login',         [LoginController::class, 'store'])->middleware('throttle:5,1');

    Route::get('/register',       fn() => Inertia::render('Register'));
    Route::post('/register',      [RegisterController::class, 'store'])->middleware('throttle:10,1');

    Route::get('/forgot-password', fn() => Inertia::render('ForgotPassword'));
    Route::post('/forgot-password', [PasswordResetController::class, 'sendLink'])->name('password.email');

    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password',        [PasswordResetController::class, 'reset'])->name('password.update');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

// Protected user routes
Route::middleware('auth')->group(function () {
    Route::get('/battle',        [ChallengeController::class, 'index']);
    Route::get('/ads',           [ChallengeController::class, 'myDefis']);
    Route::get('/historique',    [HistoriqueController::class, 'index']);
    Route::get('/transactions',  fn() => redirect('/historique'));
    Route::get('/recharge',      [DepositController::class,  'show']);
    Route::post('/recharge',     [DepositController::class,  'store'])->middleware('throttle:5,1');
    Route::get('/retrait',       [WithdrawController::class, 'show']);
    Route::post('/retrait',      [WithdrawController::class, 'store'])->middleware('throttle:5,1');
    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read',[NotificationController::class, 'markRead']);

    Route::get('/chat',              [MessageController::class, 'index']);
    Route::get('/chat/{id}',         [MessageController::class, 'show']);
    Route::post('/chat/{id}',        [MessageController::class, 'store']);
    Route::get('/chat/{id}/poll',    [MessageController::class, 'poll']);

    Route::get('/profil',           [ProfileController::class, 'index']);
    Route::post('/profil/update',   [ProfileController::class, 'update']);
    Route::post('/profil/avatar',   [ProfileController::class, 'uploadAvatar']);
    Route::post('/profil/password', [ProfileController::class, 'updatePassword']);
    Route::post('/user/locale',    [ProfileController::class, 'updateLocale']);
    Route::get('/profil/{id}',      [ProfileController::class, 'show'])->whereNumber('id');
    Route::get('/settings',    fn() => Inertia::render('Settings'));
    Route::get('/support',     fn() => Inertia::render('Support'));

    Route::get('/defis/{challenge}',          [ChallengeController::class, 'show']);
    Route::post('/challenges',                [ChallengeController::class, 'store']);
    Route::post('/challenges/{challenge}/join',       [ChallengeController::class, 'join']);
    Route::post('/challenges/{challenge}/cancel',     [ChallengeController::class, 'cancel']);
    Route::post('/challenges/{challenge}/reactivate', [ChallengeController::class, 'reactivate']);
    Route::delete('/challenges/{challenge}',          [ChallengeController::class, 'destroy']);
    Route::get('/match/{id}',         [MatchController::class, 'show']);
    Route::post('/match/{id}/ready',  [MatchController::class, 'setReady']);
    Route::post('/match/{id}/result', [MatchController::class, 'submitResult'])->middleware('throttle:3,1');
    Route::post('/match/{id}/review', [ReviewController::class, 'store']);

    Route::post('/wallet/unlink', [WalletController::class, 'unlink']);

    Route::get('/litiges/{id}',            [DisputeController::class, 'show']);
    Route::post('/litiges/{id}/video',     [DisputeController::class, 'uploadVideo']);

    Route::get('/challenge/create/1', fn() => Inertia::render('Challenge/Step1'));
    Route::get('/challenge/create/2', fn() => Inertia::render('Challenge/Step2', [
        'activeFighters' => \App\Models\Fighter::active()->pluck('name')->toArray(),
    ]));
    Route::get('/challenge/create/3', fn() => Inertia::render('Challenge/Step3'));
    Route::get('/challenge/create/4', fn() => Inertia::render('Challenge/Step4'));
    Route::get('/challenge/create/5', fn() => Inertia::render('Challenge/Step5', [
        'balance'      => auth()->user()->balance_rb,
        'balance_usdt' => auth()->user()->balance_usdt,
    ]));
    Route::get('/challenge/create/6', fn() => Inertia::render('Challenge/Step6'));
});

// Admin routes
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin/login',  fn() => Inertia::render('Admin/Login'))->name('admin.login');
    Route::post('/admin/login', [AdminLoginController::class, 'store'])->middleware('throttle:5,1');
});

Route::post('/admin/logout', [AdminLoginController::class, 'destroy'])
    ->middleware('auth:admin')
    ->name('admin.logout');

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::get('/',                            [AdminDashboardController::class,  'index']);
    Route::get('/users',                      [AdminUserController::class,       'index']);
    Route::post('/users/{id}/status',         [AdminUserController::class,       'updateStatus']);
    Route::get('/defis',                      [AdminChallengeController::class,  'index']);
    Route::post('/defis/{id}/cancel',         [AdminChallengeController::class,  'cancel']);
    Route::get('/matchs',                     [AdminMatchController::class,      'index']);
    Route::post('/matchs/{id}/cancel',        [AdminMatchController::class,      'cancel']);
    Route::get('/litiges',                    [AdminDisputeController::class,    'index']);
    Route::post('/litiges/{id}/resolve',      [AdminDisputeController::class,    'resolve']);
    Route::get('/transactions',               [AdminTransactionController::class,'index']);
    Route::post('/transactions/{id}/approve', [AdminTransactionController::class,'approve']);
    Route::post('/transactions/{id}/reject',  [AdminTransactionController::class,'reject']);
    Route::get('/combattants',                [AdminFighterController::class,    'index']);
    Route::post('/combattants',               [AdminFighterController::class,    'store']);
    Route::post('/combattants/{id}/toggle',   [AdminFighterController::class,    'toggle']);
    Route::delete('/combattants/{id}',        [AdminFighterController::class,    'destroy']);
    Route::get('/admins',                     [AdminController::class,           'index']);
    Route::post('/admins',                    [AdminController::class,           'store']);
    Route::post('/admins/{id}/toggle',        [AdminController::class,           'toggleActive']);
    Route::delete('/admins/{id}',             [AdminController::class,           'destroy']);
});
