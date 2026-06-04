<x-mail::message>
# 💬 Tu as un nouveau message !

Bonjour **{{ $recipient->username }}**,

**{{ $senderUsername }}** t'a envoyé un message dans le **Match #{{ $matchId }}** :

<x-mail::panel>
{{ $messageBody }}
</x-mail::panel>

<x-mail::button :url="$chatUrl" color="red">
Répondre dans le chat
</x-mail::button>

**L'équipe RIVALBET**
</x-mail::message>
