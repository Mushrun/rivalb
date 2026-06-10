<x-mail::message>
# {{ __('email_ready_title', ['opponent' => $opponentUsername]) }}

{{ __('email_ready_greeting', ['creator' => $creator->username]) }}

{{ __('email_ready_body', ['opponent' => $opponentUsername, 'matchId' => $matchId]) }}

{{ __('email_ready_hint') }}

<x-mail::button :url="$chatUrl" color="red">
{{ __('email_ready_cta', ['matchId' => $matchId]) }}
</x-mail::button>

{{ __('email_ready_wish') }}

**{{ __('email_team') }}**
</x-mail::message>
