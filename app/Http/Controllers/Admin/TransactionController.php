<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with('user')
            ->whereIn('type', ['depot', 'retrait'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id'             => $t->id,
                'user'           => $t->user->username,
                'email'          => $t->user->email,
                'type'           => $t->type,
                'currency'       => $t->currency ?? 'rb',
                'amount_rb'      => $t->amount_rb,
                'amount_usdt'    => $t->amount_usdt,
                'tx_hash'        => $t->tx_hash,
                'wallet_address' => $t->wallet_address,
                'status'         => $t->status,
                'created_at'     => $t->created_at->format('d/m H:i'),
            ]);

        return Inertia::render('Admin/Transactions', [
            'transactions' => $transactions,
        ]);
    }

    public function approve(int $id)
    {
        $transaction = Transaction::with('user')->findOrFail($id);

        if ($transaction->status !== 'en_attente') {
            return back()->withErrors(['error' => 'Cette transaction ne peut plus être modifiée.']);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->type === 'depot') {
                if (($transaction->currency ?? 'rb') === 'usdt') {
                    $transaction->user->increment('balance_usdt', (float) $transaction->amount_usdt);
                } else {
                    $transaction->user->increment('balance_rb', $transaction->amount_rb);
                }
            }
            $transaction->update(['status' => 'valide']);
        });

        return back()->with('flash', ['success' => 'Transaction validée.']);
    }

    public function reject(int $id)
    {
        $transaction = Transaction::with('user')->findOrFail($id);

        if ($transaction->status !== 'en_attente') {
            return back()->withErrors(['error' => 'Cette transaction ne peut plus être modifiée.']);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->type === 'retrait') {
                // Refund the held RB back to the user
                $transaction->user->increment('balance_rb', $transaction->amount_rb);
            }
            $transaction->update(['status' => 'refuse']);
        });

        return back()->with('flash', ['success' => 'Transaction refusée.']);
    }
}
