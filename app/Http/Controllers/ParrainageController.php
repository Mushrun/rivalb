<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParrainageController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $referrees = $user->referrees()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'id'        => $r->id,
                'username'  => $r->username,
                'joined_at' => $r->created_at->format('d/m/Y'),
            ]);

        $commissionsRb   = Transaction::where('user_id', $user->id)
            ->where('type', 'commission_parrainage')
            ->where('currency', 'rb')
            ->sum('amount_rb');

        $commissionsUsdt = Transaction::where('user_id', $user->id)
            ->where('type', 'commission_parrainage')
            ->where('currency', 'usdt')
            ->sum('amount_usdt');

        return Inertia::render('Parrainage', [
            'referral_code'    => $user->referral_code,
            'referral_link'    => config('app.url') . '/register?ref=' . $user->referral_code,
            'referrees_count'  => $referrees->count(),
            'referrees'        => $referrees,
            'commissions_rb'   => (int) $commissionsRb,
            'commissions_usdt' => round((float) $commissionsUsdt, 4),
        ]);
    }
}
