<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;

class ChatModerationService extends AbstractAiService
{
    private const MODEL = 'claude-haiku-4-5-20251001';

    public function moderate(string $body, int $matchId, int $userId): bool
    {
        if (!config('services.anthropic.moderation_enabled', true)) {
            return true;
        }

        if (!config('services.anthropic.key')) {
            return true;
        }

        try {
            $prompt = "Tu es un modérateur de contenu pour une plateforme de jeux vidéo compétitifs. "
                . "Analyse ce message de chat entre joueurs.\n"
                . "Réponds UNIQUEMENT par:\n"
                . "- OK : si le message est acceptable (argot, taquinerie, trash talk léger sont OK)\n"
                . "- BLOCKED : si le message contient des insultes graves, menaces, harcèlement, contenu illégal ou haineux\n\n"
                . "Message: \"" . addslashes($body) . "\"";

            $output  = $this->callClaude(self::MODEL, [[
                'role'    => 'user',
                'content' => $prompt,
            ]], maxTokens: 10);

            $allowed  = str_starts_with(strtoupper(trim($output)), 'OK');
            $decision = 'chat_moderation:' . ($allowed ? 'allowed' : 'blocked');

            $this->record(
                action:          $decision,
                model:           self::MODEL,
                input:           json_encode(['match_id' => $matchId, 'user_id' => $userId, 'body_preview' => mb_substr($body, 0, 100)]),
                output:          $output,
                confidenceScore: null,
            );

            return $allowed;
        } catch (\Throwable $e) {
            Log::error('ChatModerationService: ' . $e->getMessage());
            return true;
        }
    }
}
