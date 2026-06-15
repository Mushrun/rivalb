<?php

namespace App\Http\Controllers;

use App\Models\GameMatch;

class VictoireShareController extends Controller
{
    public function show(GameMatch $match)
    {
        if ($match->status !== 'termine' || ! $match->winner_id) {
            abort(404);
        }

        $winner   = $match->winner;
        $loser    = $match->player1_id === $match->winner_id ? $match->player2 : $match->player1;
        $challenge = $match->challenge;

        $betAmount = $challenge->bet_amount ?? 0;
        $currency  = $challenge->currency  ?? 'rb';
        $gain      = $currency === 'usdt'
            ? round($betAmount * 2 * 0.95, 2)
            : (int) floor($betAmount * 2 * 0.95);

        $referralLink = url('/register') . '?ref=' . $winner->referral_code;

        $data = [
            'winner_username'  => $winner->username,
            'loser_username'   => $loser->username,
            'game'             => $challenge->game ?? 'Shadow Fight',
            'gain'             => $gain,
            'currency'         => strtoupper($currency === 'usdt' ? 'USDT' : 'RB'),
            'referral_link'    => $referralLink,
            'app_url'          => config('app.url'),
            'match_date'       => $match->ended_at?->format('d M Y') ?? $match->updated_at->format('d M Y'),
        ];

        return view('victoire-share', $data);
    }
}
