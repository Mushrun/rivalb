<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly User $user) {}

    public function envelope(): Envelope
    {
        app()->setLocale($this->user->locale ?? 'en');
        return new Envelope(subject: __('email_welcome_subject'));
    }

    public function content(): Content
    {
        return new Content(view: 'emails.welcome');
    }
}
