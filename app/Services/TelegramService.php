<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    private string $token;
    private string $groupId;
    private string $baseUrl;

    public function __construct()
    {
        $this->token   = config('services.telegram.token', '');
        $this->groupId = config('services.telegram.group_id', '');
        $this->baseUrl = "https://api.telegram.org/bot{$this->token}";
    }

    public function sendMessage(string $text, ?string $chatId = null): ?array
    {
        if (!$this->token || !$this->groupId) return null;

        try {
            $response = Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id'    => $chatId ?? $this->groupId,
                'text'       => $text,
                'parse_mode' => 'HTML',
            ]);

            return $response->successful() ? $response->json('result') : null;
        } catch (\Throwable $e) {
            Log::error('TelegramService::sendMessage failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function sendDisputePoll(int $disputeId, string $player1, string $player2, string $game, string $bet): ?array
    {
        if (!$this->token || !$this->groupId) return null;

        try {
            // Message d'annonce du litige
            $this->sendMessage(
                "⚠️ <b>LITIGE #{$disputeId} OUVERT</b>\n\n" .
                "👊 <b>{$player1}</b> vs <b>{$player2}</b>\n" .
                "🎮 Jeu : {$game}\n" .
                "💰 Mise : {$bet}\n\n" .
                "Les deux joueurs ont déclaré victoire.\n" .
                "📸 Soumettez vos preuves (vidéo/capture) ici avant de voter.\n" .
                "⏳ <b>Vote communautaire ouvert pendant 24h</b>"
            );

            // Sondage de vote
            $response = Http::post("{$this->baseUrl}/sendPoll", [
                'chat_id'      => $this->groupId,
                'question'     => "⚔️ LITIGE #{$disputeId} — Qui a gagné ?",
                'options'      => json_encode(["🏆 {$player1}", "💀 {$player2}"]),
                'is_anonymous' => false,
            ]);

            if (!$response->successful()) {
                Log::error('TelegramService::sendDisputePoll failed', ['response' => $response->body()]);
                return null;
            }

            return [
                'message_id' => (string) $response->json('result.message_id'),
                'poll_id'    => $response->json('result.poll.id'),
            ];
        } catch (\Throwable $e) {
            Log::error('TelegramService::sendDisputePoll exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function stopPoll(string $messageId): ?array
    {
        if (!$this->token || !$this->groupId) return null;

        try {
            $response = Http::post("{$this->baseUrl}/stopPoll", [
                'chat_id'    => $this->groupId,
                'message_id' => $messageId,
            ]);

            return $response->successful() ? $response->json('result') : null;
        } catch (\Throwable $e) {
            Log::error('TelegramService::stopPoll failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function sendPrivateMessage(string $telegramChatId, string $text): void
    {
        if (!$this->token) return;

        try {
            Http::post("{$this->baseUrl}/sendMessage", [
                'chat_id'    => $telegramChatId,
                'text'       => $text,
                'parse_mode' => 'HTML',
            ]);
        } catch (\Throwable $e) {
            Log::error('TelegramService::sendPrivateMessage failed', ['error' => $e->getMessage()]);
        }
    }

    public function setWebhook(string $url): bool
    {
        try {
            $response = Http::post("{$this->baseUrl}/setWebhook", ['url' => $url]);
            return $response->successful() && $response->json('ok');
        } catch (\Throwable $e) {
            return false;
        }
    }
}
