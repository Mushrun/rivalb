<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ShadowCoinService
{
    public function getBalance(User $user): int
    {
        return $user->balance_rb;
    }

    public function credit(User $user, int $amount, string $type, array $meta = []): Transaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $meta) {
            $user->increment('balance_rb', $amount);

            return Transaction::create([
                'user_id'        => $user->id,
                'type'           => $type,
                'amount_rb'      => $amount,
                'amount_crypto'  => $meta['amount_crypto']  ?? null,
                'wallet_address' => $meta['wallet_address'] ?? null,
                'tx_hash'        => $meta['tx_hash']        ?? null,
                'status'         => $meta['status']         ?? 'valide',
            ]);
        });
    }

    public function debit(User $user, int $amount, string $type, array $meta = []): Transaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $meta) {
            // Verrouillage pessimiste : empêche deux débits simultanés sur le même compte
            $fresh = User::lockForUpdate()->findOrFail($user->id);

            if ($fresh->balance_rb < $amount) {
                throw new \RuntimeException('Solde insuffisant.');
            }

            $fresh->decrement('balance_rb', $amount);
            $user->balance_rb = $fresh->balance_rb;

            return Transaction::create([
                'user_id'        => $user->id,
                'type'           => $type,
                'amount_rb'      => $amount,
                'amount_crypto'  => $meta['amount_crypto']  ?? null,
                'wallet_address' => $meta['wallet_address'] ?? null,
                'tx_hash'        => $meta['tx_hash']        ?? null,
                'status'         => $meta['status']         ?? 'valide',
            ]);
        });
    }

    public function transfer(User $from, User $to, int $amount, string $type): void
    {
        DB::transaction(function () use ($from, $to, $amount, $type) {
            $this->debit($from, $amount, $type);
            $this->credit($to, $amount, $type);
        });
    }

    public function hasEnough(User $user, int $amount): bool
    {
        return $user->balance_rb >= $amount;
    }

    public function hasEnoughUsdt(User $user, int $amount): bool
    {
        return $user->balance_usdt >= $amount;
    }

    public function debitUsdt(User $user, int $amount, string $type, array $meta = []): void
    {
        DB::transaction(function () use ($user, $amount, $type, $meta) {
            $fresh = User::lockForUpdate()->findOrFail($user->id);
            if ($fresh->balance_usdt < $amount) {
                throw new \RuntimeException('Solde USDT insuffisant.');
            }
            $fresh->decrement('balance_usdt', $amount);
            $user->balance_usdt = $fresh->balance_usdt;
        });
    }

    public function creditUsdt(User $user, float $amount, string $type): Transaction
    {
        return DB::transaction(function () use ($user, $amount, $type) {
            $user->increment('balance_usdt', $amount);

            return Transaction::create([
                'user_id'      => $user->id,
                'type'         => $type,
                'amount_rb'    => 0,
                'amount_usdt'  => $amount,
                'currency'     => 'usdt',
                'status'       => 'valide',
            ]);
        });
    }
}
