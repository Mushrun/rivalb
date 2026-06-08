<?php

namespace App\Jobs;

use App\Models\Dispute;
use App\Services\DisputeService;
use App\Services\TelegramService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ResolveTelegramPollJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(private int $disputeId) {}

    public function handle(TelegramService $telegram, DisputeService $disputeService): void
    {
        $dispute = Dispute::with([
            'gameMatch.player1',
            'gameMatch.player2',
            'gameMatch.challenge',
        ])->find($this->disputeId);

        if (!$dispute || $dispute->status !== 'ouvert') {
            return;
        }

        if (!$dispute->telegram_message_id) {
            Log::warning("ResolveTelegramPollJob: dispute #{$this->disputeId} has no telegram_message_id");
            return;
        }

        // Stopper le sondage et récupérer les résultats
        $poll = $telegram->stopPoll($dispute->telegram_message_id);

        if (!$poll) {
            Log::error("ResolveTelegramPollJob: failed to stop poll for dispute #{$this->disputeId}");
            $telegram->sendMessage(
                "⚖️ <b>LITIGE #{$dispute->id}</b> — Impossible de récupérer les résultats du vote. Un admin va trancher."
            );
            return;
        }

        $p1Votes = $poll['options'][0]['voter_count'] ?? 0;
        $p2Votes = $poll['options'][1]['voter_count'] ?? 0;
        $total   = $poll['total_voter_count'] ?? 0;

        // Sauvegarder les votes dans la dispute
        $dispute->update([
            'player1_votes' => $p1Votes,
            'player2_votes' => $p2Votes,
        ]);

        $match   = $dispute->gameMatch;
        $player1 = $match->player1->username;
        $player2 = $match->player2->username;

        // Pas assez de votes → admin tranche
        if ($total < 3) {
            $telegram->sendMessage(
                "⚖️ <b>LITIGE #{$dispute->id}</b> — Seulement {$total} vote(s), minimum 3 requis.\n" .
                "Un admin va trancher manuellement."
            );
            return;
        }

        // Égalité → admin tranche
        if ($p1Votes === $p2Votes) {
            $telegram->sendMessage(
                "⚖️ <b>LITIGE #{$dispute->id}</b> — Vote à égalité ({$p1Votes} vs {$p2Votes}).\n" .
                "Un admin va trancher manuellement."
            );
            return;
        }

        // Résolution par vote
        $winnerId   = $p1Votes > $p2Votes ? $match->player1_id : $match->player2_id;
        $winnerName = $p1Votes > $p2Votes ? $player1 : $player2;

        try {
            $disputeService->resolve(
                $dispute,
                $winnerId,
                "Résolu par vote communautaire ({$p1Votes} vs {$p2Votes} votes)"
            );

            $telegram->sendMessage(
                "✅ <b>LITIGE #{$dispute->id} résolu par vote communautaire</b>\n\n" .
                "🏆 Vainqueur : <b>{$winnerName}</b>\n" .
                "📊 Résultat : {$p1Votes} vote(s) pour {$player1} — {$p2Votes} vote(s) pour {$player2}\n" .
                "👥 {$total} votant(s)"
            );
        } catch (\Throwable $e) {
            Log::error("ResolveTelegramPollJob: resolve failed for dispute #{$this->disputeId}", [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
