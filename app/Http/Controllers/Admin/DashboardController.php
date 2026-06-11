<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\Dispute;
use App\Models\GameMatch;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now       = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();

        // Stats globales
        $totalUsers    = User::count();
        $newUsersMonth = User::where('created_at', '>=', $monthStart)->count();

        $activeDefis   = Challenge::whereIn('status', ['ouvert'])->count();
        $newDefisToday = Challenge::whereDate('created_at', today())->count();

        $totalMatchs    = GameMatch::where('status', 'termine')->count();
        $matchsMonth    = GameMatch::where('status', 'termine')->where('ended_at', '>=', $monthStart)->count();

        $openLitiges   = Dispute::where('status', 'ouvert')->count();
        $urgentLitiges = Dispute::where('status', 'ouvert')
            ->where('created_at', '<=', now()->subHours(24))->count();

        $pendingTx    = Transaction::where('status', 'en_attente')->count();

        // Commissions matchs RB
        $commissionRb = (int) Transaction::where('type', 'match_perte')
            ->where('status', 'valide')
            ->where(fn($q) => $q->whereNull('currency')->orWhere('currency', 'rb'))
            ->sum('amount_rb');

        // Commissions matchs USDT
        $commissionUsdt = round((float) Transaction::where('type', 'match_perte')
            ->where('status', 'valide')
            ->where('currency', 'usdt')
            ->sum('amount_usdt'), 4);

        // Total dépôts USDT validés
        $totalDepotUsdt = round((float) Transaction::where('type', 'depot')
            ->where('currency', 'usdt')
            ->where('status', 'valide')
            ->sum('amount_usdt'), 4);

        // Total retraits RB validés
        $totalRetraitRb = (int) Transaction::where('type', 'retrait')
            ->where('status', 'valide')
            ->where(fn($q) => $q->whereNull('currency')->orWhere('currency', 'rb'))
            ->sum('amount_rb');

        // Total retraits USDT validés
        $totalRetraitUsdt = round((float) Transaction::where('type', 'retrait')
            ->where('currency', 'usdt')
            ->where('status', 'valide')
            ->sum('amount_usdt'), 4);

        // Litiges récents
        $recentLitiges = Dispute::with(['gameMatch.player1', 'gameMatch.player2', 'gameMatch.challenge'])
            ->where('status', 'ouvert')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($d) => [
                'id'      => $d->id,
                'players' => ($d->gameMatch->player1->username ?? '?') . ' vs ' . ($d->gameMatch->player2->username ?? '?'),
                'bet'     => ($d->gameMatch->challenge->bet_amount ?? 0) . ' RB',
                'date'    => $d->created_at->diffForHumans(),
                'urgency' => $d->created_at->diffInHours(now()) >= 24 ? 'haute' : 'normale',
            ]);

        // Derniers inscrits
        $recentUsers = User::latest()
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'id'     => $u->id,
                'name'   => $u->username ?? $u->name,
                'email'  => $u->email,
                'date'   => $u->created_at->diffForHumans(),
                'status' => $u->status ?? 'actif',
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                ['label' => 'Utilisateurs',       'value' => number_format($totalUsers),                          'delta' => '+' . $newUsersMonth . ' ce mois',     'color' => '#4CD964'],
                ['label' => 'Défis actifs',        'value' => (string) $activeDefis,                               'delta' => '+' . $newDefisToday . " aujourd'hui", 'color' => '#FF9500'],
                ['label' => 'Matchs joués',        'value' => number_format($totalMatchs),                         'delta' => '+' . $matchsMonth . ' ce mois',       'color' => '#FF3B30'],
                ['label' => 'Litiges ouverts',     'value' => (string) $openLitiges,                               'delta' => $urgentLitiges . ' urgents',            'color' => '#FF3B30'],
                ['label' => 'Commission RB',       'value' => number_format($commissionRb) . ' RB',                'delta' => 'Total plateforme',                     'color' => '#FFAA88'],
                ['label' => 'Commission USDT',     'value' => number_format($commissionUsdt, 4) . ' USDT',         'delta' => 'Total plateforme',                     'color' => '#4CD964'],
                ['label' => 'Total dépôts USDT',   'value' => number_format($totalDepotUsdt, 4) . ' USDT',         'delta' => 'Dépôts validés',                       'color' => '#4CD964'],
                ['label' => 'Total retraits RB',   'value' => number_format($totalRetraitRb) . ' RB',             'delta' => 'Retraits validés',                     'color' => '#FF3B30'],
                ['label' => 'Total retraits USDT', 'value' => number_format($totalRetraitUsdt, 4) . ' USDT',      'delta' => 'Retraits validés',                     'color' => '#FF3B30'],
                ['label' => 'Tx en attente',       'value' => (string) $pendingTx,                                 'delta' => 'À valider',                            'color' => '#FF9500'],
            ],
            'recentLitiges' => $recentLitiges,
            'recentUsers'   => $recentUsers,
        ]);
    }
}
