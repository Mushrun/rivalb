<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    protected $fillable = [
        'match_id', 'opened_by', 'status',
        'decision_player_id', 'admin_note', 'video_path', 'resolved_at',
    ];

    protected function casts(): array
    {
        return ['resolved_at' => 'datetime'];
    }

    public function gameMatch()
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }

    public function opener()
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'decision_player_id');
    }
}
