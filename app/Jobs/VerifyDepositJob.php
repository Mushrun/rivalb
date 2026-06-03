<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Services\BscScanService;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\DB;

class VerifyDepositJob implements ShouldQueue
{
    use Queueable;

    public int   $tries   = 10;
    public array $backoff = [30, 60, 120, 300, 300, 300, 600, 600, 600, 600];

    public function __construct(private int $transactionId) {}

    public function middleware(): array
    {
        return [new WithoutOverlapping($this->transactionId)];
    }

    public function handle(NotificationService $notifService): void
    {
        $transaction = Transaction::with('user')->find($this->transactionId);

        if (!$transaction || $transaction->status !== 'en_attente') {
            return;
        }

        $service = new BscScanService(
            apiKey:         config('services.bscscan.key'),
            tokenAddress:   config('services.bscscan.token_address'),
            usdtAddress:    config('services.bscscan.usdt_address'),
            platformWallet: config('services.bscscan.platform_wallet'),
        );

        if ($transaction->currency === 'usdt') {
            $result    = $service->verifyUsdtTransfer($transaction->tx_hash, (float) $transaction->amount_usdt);
            $creditedRb = (int) $transaction->amount_usdt * config('services.bscscan.rb_per_usdt', 500);
        } else {
            $result    = $service->verifyRbTransfer($transaction->tx_hash, $transaction->amount_rb);
            $creditedRb = $transaction->amount_rb;
        }

        if ($result->isPending()) {
            $this->release(30);
            return;
        }

        if ($result->isValid()) {
            DB::transaction(function () use ($transaction, $creditedRb) {
                $transaction->user->increment('balance_rb', $creditedRb);
                $transaction->update(['status' => 'valide', 'amount_rb' => $creditedRb]);
            });

            $notifService->depotValide($transaction->user, $creditedRb);
            return;
        }

        $transaction->update(['status' => 'refuse', 'reject_reason' => $result->reason]);
        $notifService->depotRefuse($transaction->user, $transaction->amount_rb, $result->reason);
    }

    public function failed(\Throwable $_): void
    {
        $transaction = Transaction::find($this->transactionId);
        if ($transaction && $transaction->status === 'en_attente') {
            $transaction->update([
                'status'        => 'refuse',
                'reject_reason' => 'Vérification échouée après plusieurs tentatives.',
            ]);
        }
    }
}
