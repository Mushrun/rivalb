<?php

namespace App\Services\AI;

use App\Models\MatchResult;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResultValidationService extends AbstractAiService
{
    private const MODEL      = 'claude-haiku-4-5-20251001';
    private const THRESHOLD  = 80;

    public function validate(MatchResult $result): int
    {
        if (!$result->screenshot_path) {
            return 50;
        }

        $fullPath = Storage::disk('public')->path($result->screenshot_path);

        if (!file_exists($fullPath)) {
            return 50;
        }

        try {
            $claimed  = $result->claimed_result === 'win' ? 'victoire' : 'défaite';
            $imageB64 = base64_encode(file_get_contents($fullPath));
            $mime     = mime_content_type($fullPath);

            $prompt = "Tu es un arbitre de jeu vidéo compétitif. Analyse cette capture d'écran. "
                . "Le joueur déclare avoir obtenu une {$claimed}. "
                . "Donne un score de confiance entre 0 et 100 indiquant si la capture confirme ce résultat "
                . "(100 = certitude absolue que la déclaration est correcte, 0 = déclaration clairement fausse). "
                . "Réponds UNIQUEMENT avec un nombre entier entre 0 et 100, rien d'autre.";

            $output = $this->callClaude(self::MODEL, [[
                'role'    => 'user',
                'content' => [
                    [
                        'type'   => 'image',
                        'source' => [
                            'type'       => 'base64',
                            'media_type' => $mime,
                            'data'       => $imageB64,
                        ],
                    ],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]], maxTokens: 10);

            $confidence = $this->safeInt($output);
            $decision   = "result_validation:" . ($confidence >= self::THRESHOLD ? 'validated' : 'flagged');

            $this->record(
                action:          $decision,
                model:           self::MODEL,
                input:           json_encode(['match_result_id' => $result->id, 'claimed' => $claimed]),
                output:          $output,
                confidenceScore: $confidence,
            );

            return $confidence;
        } catch (\Throwable $e) {
            Log::error('ResultValidationService: ' . $e->getMessage());
            return 50;
        }
    }

    public function isFlagged(int $confidence): bool
    {
        return $confidence < self::THRESHOLD;
    }
}
