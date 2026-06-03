<?php

use App\Models\GameMatch;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{matchId}', function ($user, $matchId) {
    $match = GameMatch::find($matchId);
    return $match && ($match->player1_id === $user->id || $match->player2_id === $user->id);
});
