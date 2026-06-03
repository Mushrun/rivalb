<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = [
        'creator_id', 'type', 'game', 'bet_amount', 'currency',
        'status', 'rules', 'visibility',
    ];

    protected function casts(): array
    {
        return ['rules' => 'array'];
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'ouvert');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function fighters()
    {
        return $this->belongsToMany(Fighter::class, 'challenge_fighters')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function gameMatch()
    {
        return $this->hasOne(GameMatch::class);
    }
}
