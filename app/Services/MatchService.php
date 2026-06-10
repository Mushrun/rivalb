<?php

namespace App\Services;

use App\Events\MatchTermine;
use App\Mail\AdversairePretMail;
use App\Models\GameMatch;
use App\Models\MatchResult;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class MatchService
{
    public function __construct(
        private ShadowCoinService    $coinService,
        private DisputeService       $disputeService,
        private NotificationService  $notifService,
    ) {}

    public function setReady(User $user, GameMatch $match): void
    {
        if ($match->player1_id === $user->id) {
            $match->update(['player1_ready' => true]);
        } elseif ($match->player2_id === $user->id) {
            $match->update(['player2_ready' => true]);
        } else {
            throw new \RuntimeException('Tu ne participes pas à ce match.');
        }

        $match->refresh();

        // Notifier l'adversaire que ce joueur est prêt
        $match->load('player1', 'player2');
        $opponent = $match->player1_id === $user->id ? $match->player2 : $match->player1;
        $this->notifService->joueurPret($opponent, $match->id, $user->username);

        // Email à l'adversaire dans les deux sens
        Mail::to($opponent->email)
            ->queue(new AdversairePretMail($opponent, $user->username, $match->id));

        if ($match->player1_ready && $match->player2_ready) {
            $this->start($match);
        }
    }

    public function start(GameMatch $match): void
    {
        $match->update([
            'status'     => 'en_cours',
            'started_at' => now(),
        ]);
    }

    public function submitResult(User $user, GameMatch $match, string $claimedResult, ?string $screenshotPath = null): MatchResult
    {
        if ($match->player1_id !== $user->id && $match->player2_id !== $user->id) {
            throw new \RuntimeException('Tu ne participes pas à ce match.');
        }

        if ($match->status !== 'en_cours') {
            throw new \RuntimeException('Ce match n\'accepte plus de résultats.');
        }

        $existing = MatchResult::where('match_id', $match->id)
            ->where('player_id', $user->id)
            ->first();

        if ($existing) {
            throw new \RuntimeException('Tu as déjà soumis un résultat pour ce match.');
        }

        $result = MatchResult::create([
            'match_id'        => $match->id,
            'player_id'       => $user->id,
            'claimed_result'  => $claimedResult,
            'screenshot_path' => $screenshotPath,
        ]);

        $this->checkResults($match);

        return $result;
    }

    private function checkResults(GameMatch $match): void
    {
        $results = MatchResult::where('match_id', $match->id)->get();

        if ($results->count() < 2) {
            return;
        }

        $r1 = $results->firstWhere('player_id', $match->player1_id);
        $r2 = $results->firstWhere('player_id', $match->player2_id);

        // Les deux déclarent la même chose — résultats cohérents
        if ($r1->claimed_result === 'win' && $r2->claimed_result === 'loss') {
            $this->confirmResult($match, $match->player1_id);
        } elseif ($r1->claimed_result === 'loss' && $r2->claimed_result === 'win') {
            $this->confirmResult($match, $match->player2_id);
        } else {
            // Les deux déclarent gagner → litige automatique
            $this->disputeService->open($match->player1, $match);
        }
    }

    private const PLATFORM_FEE_RATE = 0.05; // 5% commission plateforme

    private function confirmResult(GameMatch $match, int $winnerId): void
    {
        $currency   = $match->challenge->currency ?? 'rb';
        $bet        = $match->challenge->bet_amount;
        $totalPot   = $bet * 2;
        $commission = (int) round($totalPot * self::PLATFORM_FEE_RATE);
        $prize      = $totalPot - $commission;
        $winner     = User::findOrFail($winnerId);
        $loser      = $match->player1_id === $winnerId ? $match->player2 : $match->player1;

        DB::transaction(function () use ($match, $winner, $prize, $commission, $winnerId, $currency) {
            if ($currency === 'usdt') {
                $this->coinService->creditUsdt($winner, $prize, 'match_gain');
            } else {
                $this->coinService->credit($winner, $prize, 'match_gain');
            }

            if ($commission > 0) {
                \App\Models\Transaction::create([
                    'user_id'   => $winnerId,
                    'type'      => 'match_perte',
                    'currency'  => $currency,
                    'amount_rb' => $currency === 'rb' ? $commission : 0,
                    'status'    => 'valide',
                ]);
            }

            MatchResult::where('match_id', $match->id)->update(['confirmed_at' => now()]);

            $match->update([
                'status'    => 'termine',
                'winner_id' => $winnerId,
                'ended_at'  => now(),
            ]);

            $match->challenge->update(['status' => 'termine']);
        });

        $winner->updateReliabilityScore(true);
        $loser->updateReliabilityScore(false);

        event(new MatchTermine($match->fresh(), $winner, $loser, $prize, $currency));
    }
}
