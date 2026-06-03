<?php

namespace App\Services;

use App\Models\Dispute;
use App\Models\GameMatch;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DisputeService
{
    public function __construct(
        private ShadowCoinService   $coinService,
        private NotificationService $notifService,
    ) {}

    public function open(User $user, GameMatch $match, ?string $videoPath = null): Dispute
    {
        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            throw new \RuntimeException('Tu ne participes pas à ce match.');
        }

        if ($match->dispute()->exists()) {
            throw new \RuntimeException('Un litige est déjà ouvert pour ce match.');
        }

        $dispute = Dispute::create([
            'match_id'   => $match->id,
            'opened_by'  => $user->id,
            'status'     => 'ouvert',
            'video_path' => $videoPath,
        ]);

        $match->update(['status' => 'litige']);

        $player1 = $match->player1;
        $player2 = $match->player2;

        Message::create([
            'match_id'  => $match->id,
            'sender_id' => $match->player1_id,
            'body'      => '⚠️ Les deux joueurs ont déclaré victoire. Un litige a été ouvert — un admin va trancher.',
            'type'      => 'system',
        ]);

        $this->notifService->litigeOuvert($player1, $dispute->id, $match->id);
        $this->notifService->litigeOuvert($player2, $dispute->id, $match->id);

        return $dispute;
    }

    public function resolve(Dispute $dispute, int $winnerId, string $note = ''): void
    {
        DB::transaction(function () use ($dispute, $winnerId, $note) {
            $match = $dispute->gameMatch;

            if ($winnerId !== $match->player1_id && $winnerId !== $match->player2_id) {
                throw new \RuntimeException('Le gagnant désigné ne fait pas partie de ce match.');
            }

            $bet   = $match->challenge->bet_amount;
            $prize = $bet * 2;

            $winner = User::findOrFail($winnerId);
            $loser  = $match->player1_id === $winnerId
                ? $match->player2
                : $match->player1;

            $this->coinService->credit($winner, $prize, 'match_gain');

            $dispute->update([
                'status'             => 'resolu',
                'decision_player_id' => $winnerId,
                'admin_note'         => $note,
                'resolved_at'        => now(),
            ]);

            $match->update([
                'status'    => 'termine',
                'winner_id' => $winnerId,
                'ended_at'  => now(),
            ]);

            $match->challenge->update(['status' => 'termine']);

            $noteText = $note ? " · Note : {$note}" : '';
            Message::create([
                'match_id'  => $match->id,
                'sender_id' => $match->player1_id,
                'body'      => "⚖️ Litige tranché par l'admin. Vainqueur : {$winner->username} (+{$prize} RB){$noteText}",
                'type'      => 'system',
            ]);

            $this->notifService->litigeResolu($winner, $dispute->id, true,  $prize);
            $this->notifService->litigeResolu($loser,  $dispute->id, false, 0);

            $winner->updateReliabilityScore(true);
            $loser->updateReliabilityScore(false);
        });
    }

    public function cancelMatch(Dispute $dispute): void
    {
        DB::transaction(function () use ($dispute) {
            $match = $dispute->gameMatch;
            $bet   = $match->challenge->bet_amount;

            $this->coinService->credit($match->player1, $bet, 'remboursement');
            $this->coinService->credit($match->player2, $bet, 'remboursement');

            $dispute->update(['status' => 'annule', 'resolved_at' => now()]);
            $match->update(['status' => 'annule', 'ended_at' => now()]);
            $match->challenge->update(['status' => 'annule']);

            Message::create([
                'match_id'  => $match->id,
                'sender_id' => $match->player1_id,
                'body'      => "🚫 Match annulé par l'admin. Les deux joueurs ont été remboursés ({$bet} RB chacun).",
                'type'      => 'system',
            ]);

            $this->notifService->litigeResolu($match->player1, $dispute->id, false, $bet);
            $this->notifService->litigeResolu($match->player2, $dispute->id, false, $bet);
        });
    }

}
