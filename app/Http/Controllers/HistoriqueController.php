<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistoriqueController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $user   = Auth::user();

        Carbon::setLocale('fr');

        $matches = GameMatch::with(['challenge', 'player1', 'player2'])
            ->where('status', 'termine')
            ->where(function ($q) use ($userId) {
                $q->where('player1_id', $userId)
                  ->orWhere('player2_id', $userId);
            })
            ->orderByDesc('ended_at')
            ->get();

        $reviewedMatchIds = Review::where('reviewer_id', $userId)
            ->pluck('match_id')
            ->flip()
            ->toArray();

        $combats = $matches->map(function ($match) use ($userId, $reviewedMatchIds) {
            $won      = $match->winner_id === $userId;
            $opponent = $match->player1_id === $userId ? $match->player2 : $match->player1;
            $bet      = $match->challenge->bet_amount ?? 0;
            $date     = $match->ended_at
                ? ucfirst($match->ended_at->isoFormat('D MMM, HH:mm'))
                : '-';

            return [
                'id'          => $match->id,
                'name'        => $opponent->username ?? $opponent->name ?? 'Inconnu',
                'opponent_id' => $opponent->id ?? null,
                'date'        => $date,
                'amount'      => ($won ? '+' : '-') . $bet . ' RB',
                'won'         => $won,
                'avis_given'  => isset($reviewedMatchIds[$match->id]),
            ];
        })->values();

        $txList = $user->transactions()->orderByDesc('created_at')->get();

        $transactions = $txList->map(function ($tx) {
            [$type, $label, $sign, $method] = match ($tx->type) {
                'depot'          => ['recharge', 'Deposit',         '+', $tx->wallet_address ? 'Crypto' : 'Mobile Money'],
                'retrait'        => ['retrait',  'Withdrawal',      '-', $tx->wallet_address ? 'Crypto' : 'Mobile Money'],
                'match_gain'     => ['recharge', 'Match win',       '+', 'Combat'],
                'remboursement'  => ['recharge', 'Refund',          '+', 'Combat'],
                'match_perte'    => ['retrait',  'Match loss',      '-', 'Combat'],
                'bonus_bienvenue'=> ['recharge', 'Welcome bonus',   '+', 'RivalBet'],
                'transfer'       => str_starts_with($tx->note ?? '', 'From:')
                    ? ['recharge', 'Transfer received', '+', $tx->note ?? 'Transfer']
                    : ['retrait',  'Transfer sent',     '-', $tx->note ?? 'Transfer'],
                default          => ['retrait',  ucfirst($tx->type), '-', 'Système'],
            };

            $isUsdt  = $tx->currency === 'usdt';
            $amount  = $isUsdt
                ? $sign . number_format((float) ($tx->amount_usdt ?? 0), 2) . ' USDT'
                : $sign . ($tx->amount_rb ?? 0) . ' RB';

            return [
                'id'       => $tx->id,
                'type'     => $type,
                'label'    => $label,
                'date'     => ucfirst($tx->created_at->isoFormat('D MMM, HH:mm')),
                'amount'   => $amount,
                'method'   => $method,
                'currency' => $tx->currency ?? 'rb',
                'status'   => $tx->status,
                'note'     => $tx->note,
            ];
        })->values();

        $wins    = $combats->where('won', true)->count();
        $losses  = $combats->where('won', false)->count();
        $totalRb = $combats->sum(fn($c) => (int) filter_var($c['amount'], FILTER_SANITIZE_NUMBER_INT));

        return Inertia::render('Historique', [
            'combats'      => $combats,
            'transactions' => $transactions,
            'stats'        => ['wins' => $wins, 'losses' => $losses, 'total_rb' => $totalRb],
            'balance_rb'   => $user->balance_rb,
        ]);
    }
}
