<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VerificationResult
{
    public function __construct(
        public readonly string  $status,
        public readonly ?int    $amount = null,
        public readonly ?string $reason = null,
    ) {}

    public static function valid(int $amount): self   { return new self('valid', $amount); }
    public static function failed(string $reason): self { return new self('failed', reason: $reason); }
    public static function pending(): self              { return new self('pending'); }

    public function isValid(): bool   { return $this->status === 'valid'; }
    public function isPending(): bool { return $this->status === 'pending'; }
    public function isFailed(): bool  { return $this->status === 'failed'; }
}

class BscScanService
{
    private const API_URL      = 'https://api.bscscan.com/api';
    private const TRANSFER_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    public function __construct(
        private string $apiKey,
        private string $tokenAddress,
        private string $usdtAddress,
        private string $platformWallet,
    ) {}

    public function verifyRbTransfer(string $txHash, int $claimedAmount): VerificationResult
    {
        return $this->verifyTransfer($txHash, $this->tokenAddress, $claimedAmount, 18, 'RB');
    }

    public function verifyUsdtTransfer(string $txHash, float $claimedUsdt): VerificationResult
    {
        // USDT BSC a 18 décimales
        $claimedWhole = (int) floor($claimedUsdt);
        return $this->verifyTransfer($txHash, $this->usdtAddress, $claimedWhole, 18, 'USDT');
    }

    private function verifyTransfer(string $txHash, string $tokenAddress, int $claimedAmount, int $decimals, string $symbol): VerificationResult
    {
        $receipt = $this->getReceipt($txHash);

        if ($receipt === null) {
            return VerificationResult::pending();
        }

        if (($receipt['status'] ?? '') !== '0x1') {
            return VerificationResult::failed('La transaction a échoué sur la blockchain.');
        }

        foreach ($receipt['logs'] ?? [] as $log) {
            if (!$this->isTransferToWallet($log, $tokenAddress)) {
                continue;
            }

            $amountWei    = hexdec(ltrim($log['data'], '0x') ?: '0');
            $amountTokens = (int) bcdiv((string) $amountWei, bcpow('10', (string) $decimals), 0);

            if ($amountTokens < $claimedAmount) {
                return VerificationResult::failed(
                    "Montant insuffisant : {$amountTokens} {$symbol} reçus, {$claimedAmount} {$symbol} déclarés."
                );
            }

            return VerificationResult::valid($amountTokens);
        }

        return VerificationResult::failed("Aucun transfert {$symbol} vers le wallet de la plateforme trouvé dans cette transaction.");
    }

    private function getReceipt(string $txHash): ?array
    {
        try {
            $response = Http::timeout(10)->get(self::API_URL, [
                'module'  => 'proxy',
                'action'  => 'eth_getTransactionReceipt',
                'txhash'  => $txHash,
                'apikey'  => $this->apiKey,
            ]);

            $result = $response->json('result');
            return empty($result) ? null : $result;
        } catch (\Throwable $e) {
            Log::warning("BscScan API error for {$txHash}: " . $e->getMessage());
            return null;
        }
    }

    private function isTransferToWallet(array $log, string $tokenAddress): bool
    {
        if (strtolower($log['address'] ?? '') !== strtolower($tokenAddress)) return false;

        $topics = $log['topics'] ?? [];
        if (($topics[0] ?? '') !== self::TRANSFER_SIG) return false;

        $toAddress = '0x' . substr($topics[2] ?? '', -40);
        return strtolower($toAddress) === strtolower($this->platformWallet);
    }
}
