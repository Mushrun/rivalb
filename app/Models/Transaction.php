<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id', 'type', 'amount_rb', 'amount_crypto',
        'wallet_address', 'tx_hash', 'status',
    ];

    protected function casts(): array
    {
        return [
            'amount_rb'     => 'integer',
            'amount_crypto' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
