<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchResult extends Model
{
    protected $fillable = ['match_id', 'player_id', 'claimed_result', 'screenshot_path', 'confirmed_at'];

    protected function casts(): array
    {
        return ['confirmed_at' => 'datetime'];
    }

    public function gameMatch()
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }

    public function player()
    {
        return $this->belongsTo(User::class, 'player_id');
    }
}
