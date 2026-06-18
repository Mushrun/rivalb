<?php

namespace App\Mail;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NouveauDefiMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User      $recipient,
        public readonly string    $creatorUsername,
        public readonly int       $challengeId,
        public readonly int|float $betAmount,
        public readonly string    $currency,
        public readonly string    $game,
    ) {}

    public function envelope(): Envelope
    {
        $amount = $this->currency === 'usdt'
            ? "\${$this->betAmount} USDT"
            : "{$this->betAmount} RB";

        return new Envelope(
            subject: "⚔️ New challenge — {$amount} at stake on RivalBet!"
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.nouveau-defi');
    }
}
