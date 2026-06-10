<?php

namespace App\Events;

use App\Models\GameMatch;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchTermine
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly GameMatch $match,
        public readonly User      $winner,
        public readonly User      $loser,
        public readonly int       $prize,
        public readonly string    $currency = 'rb',
    ) {}
}
