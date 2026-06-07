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

        // Commission totale gagnée
        $commission = Transaction::where('type', 'match_perte')
            ->where('status', 'valide')
            ->sum('amount_rb');

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
                ['label' => 'Utilisateurs',      'value' => number_format($totalUsers),   'delta' => '+' . $newUsersMonth . ' ce mois',       'color' => '#4CD964'],
                ['label' => 'Défis actifs',       'value' => (string) $activeDefis,        'delta' => '+' . $newDefisToday . " aujourd'hui",   'color' => '#FF9500'],
                ['label' => 'Matchs joués',       'value' => number_format($totalMatchs),  'delta' => '+' . $matchsMonth . ' ce mois',         'color' => '#FF3B30'],
                ['label' => 'Litiges ouverts',    'value' => (string) $openLitiges,        'delta' => $urgentLitiges . ' urgents',              'color' => '#FF3B30'],
                ['label' => 'Commission gagnée',  'value' => number_format($commission) . ' RB', 'delta' => 'Total plateforme',               'color' => '#FFAA88'],
                ['label' => 'Tx en attente',      'value' => (string) $pendingTx,          'delta' => 'À valider',                             'color' => '#4CD964'],
            ],
            'recentLitiges' => $recentLitiges,
            'recentUsers'   => $recentUsers,
        ]);
    }
}
