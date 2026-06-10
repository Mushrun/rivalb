<x-mail::message>
# {{ __('email_message_title') }}

{{ __('email_message_greeting', ['recipient' => $recipient->username]) }}

{{ __('email_message_body', ['sender' => $senderUsername, 'matchId' => $matchId]) }}

<x-mail::panel>
{{ $messageBody }}
</x-mail::panel>

<x-mail::button :url="$chatUrl" color="red">
{{ __('email_message_cta') }}
</x-mail::button>

**{{ __('email_team') }}**
</x-mail::message>
