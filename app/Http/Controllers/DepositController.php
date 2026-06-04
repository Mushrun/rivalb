<?php

namespace App\Http\Controllers;

use App\Jobs\VerifyDepositJob;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DepositController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        $history = Transaction::where('user_id', $user->id)
            ->where('type', 'depot')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn($t) => [
                'id'          => $t->id,
                'amount_rb'   => $t->amount_rb,
                'amount_usdt' => $t->amount_usdt,
                'currency'    => $t->currency ?? 'rb',
                'tx_hash'     => $t->tx_hash,
                'status'      => $t->status,
                'created_at'  => $t->created_at->format('d/m H:i'),
            ]);

        return Inertia::render('Recharge', [
            'balance'      => $user->balance_rb,
            'balance_usdt' => $user->balance_usdt,
            'history'      => $history,
        ]);
    }

    public function store(Request $request)
    {
        $user     = Auth::user();
        $currency = $request->input('currency', 'rb');

        if ($currency === 'usdt') {
            $validated = $request->validate([
                'tx_hash'     => ['required', 'string', 'regex:/^0x[a-fA-F0-9]{64}$/', Rule::unique('transactions', 'tx_hash')],
                'amount_usdt' => ['required', 'numeric', 'min:1'],
            ], [
                'tx_hash.regex'    => 'Hash invalide — format attendu : 0x suivi de 64 caractères hex.',
                'tx_hash.unique'   => 'Ce hash de transaction a déjà été soumis.',
                'amount_usdt.min'  => 'Montant minimum : 1 USDT.',
            ]);

            $transaction = Transaction::create([
                'user_id'     => $user->id,
                'type'        => 'depot',
                'currency'    => 'usdt',
                'amount_rb'   => 0,
                'amount_usdt' => $validated['amount_usdt'],
                'tx_hash'     => $validated['tx_hash'],
                'status'      => 'en_attente',
            ]);
        } else {
            $validated = $request->validate([
                'tx_hash'   => ['required', 'string', 'regex:/^0x[a-fA-F0-9]{64}$/', Rule::unique('transactions', 'tx_hash')],
                'amount_rb' => ['required', 'integer', 'min:500'],
            ], [
                'tx_hash.regex'  => 'Hash invalide — format attendu : 0x suivi de 64 caractères hex.',
                'tx_hash.unique' => 'Ce hash de transaction a déjà été soumis.',
                'amount_rb.min'  => 'Montant minimum : 500 RB.',
            ]);

            $transaction = Transaction::create([
                'user_id'   => $user->id,
                'type'      => 'depot',
                'currency'  => 'rb',
                'amount_rb' => $validated['amount_rb'],
                'tx_hash'   => $validated['tx_hash'],
                'status'    => 'en_attente',
            ]);
        }

        VerifyDepositJob::dispatch($transaction->id)->delay(now()->addSeconds(15));

        return back()->with('flash', ['success' => 'Dépôt soumis ! Vérification en cours, ton solde sera crédité automatiquement.']);
    }
}
