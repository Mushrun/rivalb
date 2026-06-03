<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdversairePretMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $creator,
        public string $opponentUsername,
        public int $matchId,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⚔️ {$this->opponentUsername} est prêt — RIVALBET Match #{$this->matchId}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.adversaire-pret',
            with: [
                'creator'          => $this->creator,
                'opponentUsername' => $this->opponentUsername,
                'matchId'          => $this->matchId,
                'chatUrl'          => url("/chat/{$this->matchId}"),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
