<?php

namespace App\Console\Commands;

use App\Services\TelegramService;
use Illuminate\Console\Command;

class TelegramSetupCommand extends Command
{
    protected $signature   = 'telegram:setup';
    protected $description = 'Configure le webhook Telegram et teste la connexion au groupe';

    public function handle(TelegramService $telegram): void
    {
        $this->info('Test de connexion au groupe Telegram...');

        $result = $telegram->sendMessage(
            "✅ <b>Rivalbet</b> est connecté au groupe communautaire.\n" .
            "Les litiges seront soumis au vote ici automatiquement."
        );

        if ($result) {
            $this->info('✓ Message envoyé avec succès dans le groupe !');
            $this->info('  Message ID : ' . $result['message_id']);
        } else {
            $this->error('✗ Impossible d\'envoyer le message. Vérifie TELEGRAM_BOT_TOKEN et TELEGRAM_COMMUNITY_GROUP_ID dans .env');
        }
    }
}
