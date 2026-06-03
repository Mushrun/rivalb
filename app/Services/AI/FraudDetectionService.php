<?php

namespace App\Services\AI;

use App\Models\Dispute;
use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FraudDetectionService extends AbstractAiService
{
    private const MODEL     = 'claude-sonnet-4-6';
    private const THRESHOLD = 70;

    public function analyze(User $user): int
    {
        try {
            $totalMatches = GameMatch::where('player1_id', $user->id)
                ->orWhere('player2_id', $user->id)
                ->count();

            $wins = GameMatch::where('winner_id', $user->id)->count();

            $disputeCount = Dispute::whereHas('gameMatch', fn($q) =>
                $q->where('player1_id', $user->id)->orWhere('player2_id', $user->id)
            )->count();

            $profile = implode("\n", [
                "Joueur ID: {$user->id} ({$user->username})",
                "Nombre de matchs joués: {$totalMatches}",
                "Nombre de victoires: {$wins}",
                "Nombre de litiges initiés: {$disputeCount}",
                "Score de fiabilité actuel: " . ($user->reliability_score ?? 100) . "/100",
                "Ancienneté du compte: " . $user->created_at->diffForHumans(),
            ]);

            $prompt = "Tu es un système de détection de fraude sur une plateforme de compétitions de jeux vidéo. "
                . "Analyse ce profil de joueur et donne un score de risque de fraude entre 0 et 100 "
                . "(0 = aucun risque, 100 = comportement frauduleux quasi-certain). "
                . "Facteurs à considérer : ratio litiges/matchs élevé, compte récent, fiabilité basse. "
                . "Réponds UNIQUEMENT avec un nombre entier entre 0 et 100.\n\n"
                . $profile;

            $output = $this->callClaude(self::MODEL, [[
                'role'    => 'user',
                'content' => $prompt,
            ]], maxTokens: 10);

            $risk     = $this->safeInt($output, 0);
            $decision = "fraud_detection:" . ($risk >= self::THRESHOLD ? 'high_risk' : 'normal');

            $this->record(
                action:          $decision,
                model:           self::MODEL,
                input:           json_encode(compact('totalMatches', 'wins', 'disputeCount') + ['user_id' => $user->id]),
                output:          $output,
                confidenceScore: $risk,
            );

            return $risk;
        } catch (\Throwable $e) {
            Log::error('FraudDetectionService: ' . $e->getMessage());
            return 0;
        }
    }

    public function isHighRisk(int $score): bool
    {
        return $score >= self::THRESHOLD;
    }
}
