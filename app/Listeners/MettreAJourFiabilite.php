<?php

namespace App\Listeners;

use App\Events\MatchTermine;

class MettreAJourFiabilite
{
    public function handle(MatchTermine $event): void
    {
        $this->updateScore($event->winner, won: true);
        $this->updateScore($event->loser,  won: false);
    }

    private function updateScore(\App\Models\User $user, bool $won): void
    {
        $delta = $won ? 2 : -3;
        $user->reliability_score = max(0, min(100, ($user->reliability_score ?? 100) + $delta));
        $user->save();
    }
}
