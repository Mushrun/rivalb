<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id', 'type', 'currency', 'amount_rb', 'amount_usdt', 'amount_crypto',
        'wallet_address', 'tx_hash', 'status', 'reject_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount_rb'     => 'integer',
            'amount_usdt'   => 'float',
            'amount_crypto' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
