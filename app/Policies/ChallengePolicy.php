<?php

namespace App\Policies;

use App\Models\Challenge;
use App\Models\User;

class ChallengePolicy
{
    public function join(User $user, Challenge $challenge): bool
    {
        return $challenge->status === 'ouvert'
            && $challenge->creator_id !== $user->id
            && $user->balance_rb >= $challenge->bet_amount;
    }

    public function cancel(User $user, Challenge $challenge): bool
    {
        return $challenge->creator_id === $user->id
            && $challenge->status === 'ouvert';
    }
}
