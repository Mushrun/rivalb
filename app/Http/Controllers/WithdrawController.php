<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WithdrawController extends Controller
{
    private const MIN_RB           = 500;
    private const MIN_USDT         = 25.0;
    private const RATE_RB_PER_USDT = 500;

    private const FEE_USDT         = 0.10;
    private const FEE_RB           = 0.06;
    private const PARRAIN_SHARE    = 0.04;

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
            'balance_rb'    => $user->balance_rb,
            'balance_usdt'  => $user->balance_usdt,
            'minAmountRb'   => self::MIN_RB,
            'minAmountUsdt' => self::MIN_USDT,
            'rate'          => self::RATE_RB_PER_USDT,
            'fee_rb'        => self::FEE_RB * 100,
            'fee_usdt'      => self::FEE_USDT * 100,
            'history'       => $history,
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

            $gross  = (float) $request->input('amount_usdt');
            $fee    = round($gross * self::FEE_USDT, 6);
            $net    = round($gross - $fee, 6);

            DB::transaction(function () use ($user, $gross, $net, $fee) {
                $fresh = User::lockForUpdate()->findOrFail($user->id);

                if ((float) $fresh->balance_usdt < $gross) {
                    throw new \RuntimeException('Solde USDT insuffisant.');
                }

                $fresh->decrement('balance_usdt', $gross);

                // Commission parrain
                if ($fresh->referred_by) {
                    $parrain       = User::find($fresh->referred_by);
                    $parrainShare  = round($gross * self::PARRAIN_SHARE, 6);
                    if ($parrain) {
                        $parrain->increment('balance_usdt', $parrainShare);
                        Transaction::create([
                            'user_id'     => $parrain->id,
                            'type'        => 'commission_parrainage',
                            'currency'    => 'usdt',
                            'amount_rb'   => 0,
                            'amount_usdt' => $parrainShare,
                            'status'      => 'valide',
                        ]);
                    }
                }

                Transaction::create([
                    'user_id'        => $user->id,
                    'type'           => 'retrait',
                    'currency'       => 'usdt',
                    'amount_rb'      => 0,
                    'amount_usdt'    => $net,
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

        $gross  = (int) $request->input('amount_rb');
        $fee    = (int) round($gross * self::FEE_RB);
        $net    = $gross - $fee;

        DB::transaction(function () use ($user, $gross, $net, $fee) {
            $fresh = User::lockForUpdate()->findOrFail($user->id);

            if ($fresh->balance_rb < $gross) {
                throw new \RuntimeException('Solde RB insuffisant.');
            }

            $fresh->decrement('balance_rb', $gross);

            // Commission parrain
            if ($fresh->referred_by) {
                $parrain      = User::find($fresh->referred_by);
                $parrainShare = (int) round($gross * self::PARRAIN_SHARE);
                if ($parrain) {
                    $parrain->increment('balance_rb', $parrainShare);
                    Transaction::create([
                        'user_id'     => $parrain->id,
                        'type'        => 'commission_parrainage',
                        'currency'    => 'rb',
                        'amount_rb'   => $parrainShare,
                        'amount_usdt' => 0,
                        'status'      => 'valide',
                    ]);
                }
            }

            Transaction::create([
                'user_id'        => $user->id,
                'type'           => 'retrait',
                'currency'       => 'rb',
                'amount_rb'      => $net,
                'wallet_address' => $user->wallet_address,
                'status'         => 'en_attente',
            ]);
        });

        return back()->with('flash', ['success' => 'Demande de retrait RB soumise ! Traitement sous 24h.']);
    }
}
