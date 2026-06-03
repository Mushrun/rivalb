<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['reviewer_id', 'reviewed_id', 'match_id', 'sentiment', 'comment'];

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewed()
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }

    public function gameMatch()
    {
        return $this->belongsTo(GameMatch::class, 'match_id');
    }
}
