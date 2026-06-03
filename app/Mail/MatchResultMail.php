<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MatchResultMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $recipient,
        public readonly int  $matchId,
        public readonly bool $won,
        public readonly int  $prize,
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->won
            ? "Victoire ! Tu as remporté {$this->prize} RB"
            : 'Résultat de ton match Rivalbet';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.match_result');
    }
}
