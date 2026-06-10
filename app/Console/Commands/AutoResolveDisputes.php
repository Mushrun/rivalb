<?php

namespace App\Console\Commands;

use App\Models\Dispute;
use App\Services\DisputeService;
use App\Services\TelegramService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoResolveDisputes extends Command
{
    protected $signature   = 'disputes:auto-resolve';
    protected $description = 'Résout automatiquement les litiges ouverts depuis plus de 24h via le vote Telegram';

    public function handle(TelegramService $telegram, DisputeService $disputeService): void
    {
        $disputes = Dispute::with([
            'gameMatch.player1',
            'gameMatch.player2',
            'gameMatch.challenge',
        ])
        ->where('status', 'ouvert')
        ->where('created_at', '<=', now()->subHours(24))
        ->get();

        if ($disputes->isEmpty()) {
            $this->info('Aucun litige à résoudre.');
            return;
        }

        foreach ($disputes as $dispute) {
            $this->resolveOne($dispute, $telegram, $disputeService);
        }
    }

    private function resolveOne(Dispute $dispute, TelegramService $telegram, DisputeService $disputeService): void
    {
        $match = $dispute->gameMatch;

        if (!$dispute->telegram_message_id) {
            Log::warning("disputes:auto-resolve — litige #{$dispute->id} sans telegram_message_id, en attente admin.");
            $telegram->sendMessage("⚖️ <b>LITIGE #{$dispute->id}</b> — Pas de sondage Telegram trouvé. Un admin doit trancher.");
            return;
        }

        $poll = $telegram->stopPoll($dispute->telegram_message_id);

        if (!$poll) {
            Log::error("disputes:auto-resolve — impossible de stopper le sondage pour litige #{$dispute->id}");
            $telegram->sendMessage("⚖️ <b>LITIGE #{$dispute->id}</b> — Impossible de récupérer les votes. Un admin doit trancher.");
            return;
        }

        $p1Votes = $poll['options'][0]['voter_count'] ?? 0;
        $p2Votes = $poll['options'][1]['voter_count'] ?? 0;
        $total   = $poll['total_voter_count'] ?? 0;

        $dispute->update(['player1_votes' => $p1Votes, 'player2_votes' => $p2Votes]);

        $player1 = $match->player1->username;
        $player2 = $match->player2->username;

        if ($total < 3) {
            $telegram->sendMessage("⚖️ <b>LITIGE #{$dispute->id}</b> — Seulement {$total} vote(s), minimum 3 requis. Un admin doit trancher.");
            $this->warn("Litige #{$dispute->id} — pas assez de votes ({$total}).");
            return;
        }

        if ($p1Votes === $p2Votes) {
            $telegram->sendMessage("⚖️ <b>LITIGE #{$dispute->id}</b> — Égalité ({$p1Votes} vs {$p2Votes}). Un admin doit trancher.");
            $this->warn("Litige #{$dispute->id} — égalité.");
            return;
        }

        $winnerId   = $p1Votes > $p2Votes ? $match->player1_id : $match->player2_id;
        $winnerName = $p1Votes > $p2Votes ? $player1 : $player2;

        try {
            $disputeService->resolve(
                $dispute,
                $winnerId,
                "Résolu par vote communautaire ({$p1Votes} vs {$p2Votes} votes)"
            );

            $telegram->sendMessage(
                "✅ <b>LITIGE #{$dispute->id} résolu automatiquement</b>\n\n" .
                "🏆 Vainqueur : <b>{$winnerName}</b>\n" .
                "📊 {$p1Votes} vote(s) pour {$player1} — {$p2Votes} vote(s) pour {$player2}\n" .
                "👥 {$total} votant(s)"
            );

            $this->info("Litige #{$dispute->id} résolu → {$winnerName}.");
        } catch (\Throwable $e) {
            Log::error("disputes:auto-resolve — erreur résolution litige #{$dispute->id}", ['error' => $e->getMessage()]);
            $this->error("Litige #{$dispute->id} — erreur : {$e->getMessage()}");
        }
    }
}
