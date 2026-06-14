<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ChallengeService
{
    public function __construct(
        private ShadowCoinService  $coinService,
        private NotificationService $notifService,
    ) {}

    public function create(User $creator, array $data): Challenge
    {
        return DB::transaction(function () use ($creator, $data) {
            $currency  = $data['currency'] ?? 'rb';
            $betAmount = $currency === 'usdt'
                ? round((float) $data['bet_amount'], 4)
                : (int) $data['bet_amount'];

            if ($currency === 'usdt') {
                if (! $this->coinService->hasEnoughUsdt($creator, $betAmount)) {
                    throw new \RuntimeException('Solde USDT insuffisant pour créer ce défi.');
                }
                $this->coinService->debitUsdt($creator, $betAmount, 'match_perte');
            } else {
                if (! $this->coinService->hasEnough($creator, $betAmount)) {
                    throw new \RuntimeException('Solde insuffisant pour créer ce défi.');
                }
                $this->coinService->debit($creator, $betAmount, 'match_perte', ['status' => 'en_attente']);
            }

            $challenge = Challenge::create([
                'creator_id' => $creator->id,
                'type'       => $data['type']       ?? '1v1',
                'game'       => $data['game']        ?? 'shadow_fight',
                'bet_amount' => $betAmount,
                'currency'   => $currency,
                'status'     => 'ouvert',
                'rules'      => $data['rules']       ?? [],
                'visibility' => $data['visibility']  ?? 'public',
            ]);

            // Notifier tous les joueurs si le défi est public
            if (($data['visibility'] ?? 'public') === 'public') {
                User::where('id', '!=', $creator->id)->each(
                    fn($u) => $this->notifService->nouveauDefiAbonnement(
                        $u, $challenge->id, $creator->username, $betAmount, $currency
                    )
                );
            }

            return $challenge;
        });
    }

    public function join(User $opponent, Challenge $challenge, string $fighter): GameMatch
    {
        return DB::transaction(function () use ($opponent, $challenge, $fighter) {
            if ($challenge->status !== 'ouvert') {
                throw new \RuntimeException('Ce défi n\'est plus disponible.');
            }

            if ($challenge->creator_id === $opponent->id) {
                throw new \RuntimeException('Tu ne peux pas rejoindre ton propre défi.');
            }

            $currency = $challenge->currency ?? 'rb';

            if ($currency === 'usdt') {
                if (! $this->coinService->hasEnoughUsdt($opponent, $challenge->bet_amount)) {
                    throw new \RuntimeException('Solde USDT insuffisant pour rejoindre ce défi.');
                }
                $this->coinService->debitUsdt($opponent, $challenge->bet_amount, 'match_perte');
            } else {
                if (! $this->coinService->hasEnough($opponent, $challenge->bet_amount)) {
                    throw new \RuntimeException('Solde insuffisant pour rejoindre ce défi.');
                }
                $this->coinService->debit($opponent, $challenge->bet_amount, 'match_perte', ['status' => 'en_attente']);
            }

            $challenge->update(['status' => 'en_cours']);

            $match = GameMatch::create([
                'challenge_id'    => $challenge->id,
                'player1_id'      => $challenge->creator_id,
                'player2_id'      => $opponent->id,
                'status'          => 'en_attente',
                'player1_ready'   => false,
                'player2_ready'   => false,
                'player2_fighter' => $fighter,
            ]);

            $creator = $challenge->creator;
            $this->notifService->defiRejoint($creator, $challenge->id, $opponent->username);
            $this->notifService->matchDemarre($creator, $match->id);
            $this->notifService->matchDemarre($opponent, $match->id);

            return $match;
        });
    }

    public function reactivate(User $user, Challenge $challenge): void
    {
        DB::transaction(function () use ($user, $challenge) {
            if (! $this->coinService->hasEnough($user, $challenge->bet_amount)) {
                throw new \RuntimeException('Solde insuffisant pour réactiver ce défi.');
            }

            $this->coinService->debit($user, $challenge->bet_amount, 'match_perte', ['status' => 'en_attente']);

            $challenge->update(['status' => 'ouvert']);
        });
    }

    public function cancel(User $user, Challenge $challenge): void
    {
        DB::transaction(function () use ($user, $challenge) {
            if ($challenge->creator_id !== $user->id) {
                throw new \RuntimeException('Seul le créateur peut annuler ce défi.');
            }

            if ($challenge->status !== 'ouvert') {
                throw new \RuntimeException('Ce défi ne peut plus être annulé.');
            }

            if (($challenge->currency ?? 'rb') === 'usdt') {
                $this->coinService->creditUsdt($user, $challenge->bet_amount, 'remboursement');
            } else {
                $this->coinService->credit($user, $challenge->bet_amount, 'remboursement');
            }

            $challenge->update(['status' => 'annule']);

            $this->notifService->defiAnnule($user, $challenge->id, $challenge->bet_amount);
        });
    }
}
