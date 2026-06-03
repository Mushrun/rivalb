<?php

namespace App\Models;

use App\Notifications\PasswordResetNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'wallet_address',
        'auth_nonce',
        'bio',
        'avatar_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'auth_nonce',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'balance_rb'        => 'integer',
            'reliability_score' => 'integer',
        ];
    }

    public function challenges()
    {
        return $this->hasMany(Challenge::class, 'creator_id');
    }

    public function matchesAsPlayer1()
    {
        return $this->hasMany(\App\Models\GameMatch::class, 'player1_id');
    }

    public function matchesAsPlayer2()
    {
        return $this->hasMany(\App\Models\GameMatch::class, 'player2_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new PasswordResetNotification($token));
    }

    public function isBanned(): bool
    {
        return $this->status === 'banni';
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspendu';
    }

    public function updateReliabilityScore(bool $won): void
    {
        $delta = $won ? 2 : -5;
        $this->reliability_score = max(0, min(100, ($this->reliability_score ?? 100) + $delta));
        $this->saveQuietly();
    }
}
