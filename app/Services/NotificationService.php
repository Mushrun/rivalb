<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function send(User $user, string $type, string $title, string $body, array $data = []): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'body'    => $body,
            'data'    => $data,
        ]);
    }

    public function defiRecu(User $user, int $challengeId, string $creatorUsername): void
    {
        $this->send($user, 'defi_recu', 'Nouveau défi reçu',
            "{$creatorUsername} te défie. Accepte et montre ce que tu vaux !",
            ['challenge_id' => $challengeId]
        );
    }

    public function defiRejoint(User $user, int $challengeId, string $opponentUsername): void
    {
        $this->send($user, 'defi_rejoint', 'Défi accepté',
            "{$opponentUsername} a accepté ton défi. Le match va commencer.",
            ['challenge_id' => $challengeId]
        );
    }

    public function matchDemarre(User $user, int $matchId): void
    {
        $this->send($user, 'match_demarre', 'Match démarré',
            'Le match a commencé. Bonne chance !',
            ['match_id' => $matchId]
        );
    }

    public function resultatConfirme(User $user, int $matchId, bool $isWinner, int $amount): void
    {
        if ($isWinner) {
            $this->send($user, 'match_gagne', 'Victoire !',
                "Tu as gagné ce match et remporté {$amount} RB.",
                ['match_id' => $matchId, 'amount' => $amount]
            );
        } else {
            $this->send($user, 'match_perdu', 'Défaite',
                "Tu as perdu ce match. Reviens plus fort !",
                ['match_id' => $matchId]
            );
        }
    }

    public function litigeOuvert(User $user, int $disputeId, int $matchId): void
    {
        $this->send($user, 'litige_ouvert', 'Litige ouvert',
            'Un litige a été ouvert sur votre match. Un administrateur va trancher.',
            ['dispute_id' => $disputeId, 'match_id' => $matchId]
        );
    }

    public function litigeResolu(User $user, int $disputeId, bool $isWinner, int $amount): void
    {
        if ($isWinner) {
            $this->send($user, 'litige_gagne', 'Litige résolu en ta faveur',
                "Le litige a été résolu. Tu remportes {$amount} RB.",
                ['dispute_id' => $disputeId, 'amount' => $amount]
            );
        } else {
            $this->send($user, 'litige_perdu', 'Litige résolu',
                'Le litige a été résolu. La décision ne t\'est pas favorable.',
                ['dispute_id' => $disputeId]
            );
        }
    }

    public function depotValide(User $user, int $amountRb, float $amountCrypto = 0): void
    {
        $this->send($user, 'depot_valide', 'Dépôt confirmé',
            "{$amountRb} RB ont été crédités sur ton compte.",
            ['amount_rb' => $amountRb, 'amount_crypto' => $amountCrypto]
        );
    }

    public function depotRefuse(User $user, int $amountRb, ?string $reason = null): void
    {
        $message = "Ton dépôt de {$amountRb} RB a été refusé.";
        if ($reason) $message .= " Raison : {$reason}";

        $this->send($user, 'depot_refuse', 'Dépôt refusé', $message,
            ['amount_rb' => $amountRb]
        );
    }

    public function retraitValide(User $user, int $amountRb, float $amountCrypto): void
    {
        $this->send($user, 'retrait_valide', 'Retrait confirmé',
            "Ton retrait de {$amountRb} RB a été effectué. {$amountCrypto} ETH envoyés.",
            ['amount_rb' => $amountRb, 'amount_crypto' => $amountCrypto]
        );
    }

    public function defiAnnule(User $user, int $challengeId, int $amountRb): void
    {
        $this->send($user, 'defi_annule', 'Défi annulé',
            "Le défi a été annulé. {$amountRb} RB ont été remboursés.",
            ['challenge_id' => $challengeId, 'amount_rb' => $amountRb]
        );
    }

    public function joueurPret(User $user, int $matchId, string $username): void
    {
        $this->send($user, 'joueur_pret', 'Adversaire prêt',
            "{$username} a marqué prêt. À toi de confirmer !",
            ['match_id' => $matchId]
        );
    }

    public function nouveauMessage(User $user, int $matchId, string $senderUsername): void
    {
        $this->send($user, 'nouveau_message', 'Nouveau message',
            "{$senderUsername} t'a envoyé un message.",
            ['match_id' => $matchId]
        );
    }
}
