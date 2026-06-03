<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawController extends Controller
{
    private const MIN_AMOUNT       = 500;
    private const RATE_RB_PER_USDT = 500; // 1 USDT = 500 RB

    public function show()
    {
        $user = Auth::user();

        $history = Transaction::where('user_id', $user->id)
            ->where('type', 'retrait')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'amount_rb'      => $t->amount_rb,
                'wallet_address' => $t->wallet_address,
                'status'         => $t->status,
                'created_at'     => $t->created_at->format('d/m H:i'),
            ]);

        return Inertia::render('Retrait', [
            'balance'    => $user->balance_rb,
            'minAmount'  => self::MIN_AMOUNT,
            'rate'       => self::RATE_RB_PER_USDT,
            'history'    => $history,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->wallet_address) {
            return back()->withErrors(['amount_rb' => 'Tu dois connecter ton MetaMask dans les paramètres.']);
        }

        $validated = $request->validate([
            'amount_rb' => ['required', 'integer', 'min:' . self::MIN_AMOUNT],
        ], [
            'amount_rb.min' => 'Montant minimum : ' . self::MIN_AMOUNT . ' RB.',
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Verrou pessimiste — empêche deux retraits simultanés sur le même compte
            $fresh = \App\Models\User::lockForUpdate()->findOrFail($user->id);

            if ($fresh->balance_rb < $validated['amount_rb']) {
                throw new \RuntimeException('Solde insuffisant.');
            }

            $fresh->decrement('balance_rb', $validated['amount_rb']);

            Transaction::create([
                'user_id'        => $user->id,
                'type'           => 'retrait',
                'amount_rb'      => $validated['amount_rb'],
                'wallet_address' => $user->wallet_address,
                'status'         => 'en_attente',
            ]);
        });

        return back()->with('flash', ['success' => 'Demande de retrait soumise ! Traitement sous 24h.']);
    }
}
