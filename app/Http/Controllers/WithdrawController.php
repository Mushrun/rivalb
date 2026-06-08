<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawController extends Controller
{
    private const MIN_RB           = 500;
    private const MIN_USDT         = 1.0;
    private const RATE_RB_PER_USDT = 500;

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
                'currency'       => $t->currency ?? 'rb',
                'amount_rb'      => $t->amount_rb,
                'amount_usdt'    => $t->amount_usdt,
                'wallet_address' => $t->wallet_address,
                'status'         => $t->status,
                'created_at'     => $t->created_at->format('d/m H:i'),
            ]);

        return Inertia::render('Retrait', [
            'balance_rb'   => $user->balance_rb,
            'balance_usdt' => $user->balance_usdt,
            'minAmountRb'  => self::MIN_RB,
            'minAmountUsdt'=> self::MIN_USDT,
            'rate'         => self::RATE_RB_PER_USDT,
            'history'      => $history,
        ]);
    }

    public function store(Request $request)
    {
        $user     = Auth::user();
        $currency = $request->input('currency', 'rb');

        if (!$user->wallet_address) {
            return back()->withErrors(['amount' => 'Tu dois connecter ton MetaMask dans les paramètres.']);
        }

        if ($currency === 'usdt') {
            $request->validate([
                'amount_usdt' => ['required', 'numeric', 'min:' . self::MIN_USDT],
            ], [
                'amount_usdt.min' => 'Montant minimum : ' . self::MIN_USDT . ' USDT.',
            ]);

            $amount = (float) $request->input('amount_usdt');

            DB::transaction(function () use ($user, $amount) {
                $fresh = \App\Models\User::lockForUpdate()->findOrFail($user->id);

                if ((float) $fresh->balance_usdt < $amount) {
                    throw new \RuntimeException('Solde USDT insuffisant.');
                }

                $fresh->decrement('balance_usdt', $amount);

                Transaction::create([
                    'user_id'        => $user->id,
                    'type'           => 'retrait',
                    'currency'       => 'usdt',
                    'amount_usdt'    => $amount,
                    'wallet_address' => $user->wallet_address,
                    'status'         => 'en_attente',
                ]);
            });

            return back()->with('flash', ['success' => 'Demande de retrait USDT soumise ! Traitement sous 24h.']);
        }

        // RB
        $request->validate([
            'amount_rb' => ['required', 'integer', 'min:' . self::MIN_RB],
        ], [
            'amount_rb.min' => 'Montant minimum : ' . self::MIN_RB . ' RB.',
        ]);

        $amountRb = (int) $request->input('amount_rb');

        DB::transaction(function () use ($user, $amountRb) {
            $fresh = \App\Models\User::lockForUpdate()->findOrFail($user->id);

            if ($fresh->balance_rb < $amountRb) {
                throw new \RuntimeException('Solde RB insuffisant.');
            }

            $fresh->decrement('balance_rb', $amountRb);

            Transaction::create([
                'user_id'        => $user->id,
                'type'           => 'retrait',
                'currency'       => 'rb',
                'amount_rb'      => $amountRb,
                'wallet_address' => $user->wallet_address,
                'status'         => 'en_attente',
            ]);
        });

        return back()->with('flash', ['success' => 'Demande de retrait RB soumise ! Traitement sous 24h.']);
    }
}
