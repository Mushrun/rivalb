<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameMatch extends Model
{
    protected $table = 'matches';

    protected $fillable = [
        'challenge_id', 'player1_id', 'player2_id', 'status',
        'room_link', 'winner_id', 'player1_ready', 'player2_ready',
        'player2_fighter', 'started_at', 'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'player1_ready' => 'boolean',
            'player2_ready' => 'boolean',
            'started_at'    => 'datetime',
            'ended_at'      => 'datetime',
        ];
    }

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function player1()
    {
        return $this->belongsTo(User::class, 'player1_id');
    }

    public function player2()
    {
        return $this->belongsTo(User::class, 'player2_id');
    }

    public function winner()
    {
        return $this->belongsTo(User::class, 'winner_id');
    }

    public function results()
    {
        return $this->hasMany(MatchResult::class, 'match_id');
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class, 'match_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'match_id');
    }
}
