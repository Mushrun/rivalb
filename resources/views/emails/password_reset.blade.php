<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('email_reset_subject') }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: #0D0D0D;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #FFFFFF;
            padding: 40px 16px;
        }

        .wrapper {
            max-width: 480px;
            margin: 0 auto;
        }

        /* Logo */
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo span {
            font-size: 22px;
            font-weight: 900;
            color: #FF3B30;
            letter-spacing: 4px;
        }

        /* Card */
        .card {
            background: #1A1A1A;
            border-radius: 20px;
            overflow: hidden;
            border: 1px solid #2A2A2A;
        }

        /* Card header */
        .card-header {
            padding: 32px 32px 24px;
            text-align: center;
            border-bottom: 1px solid #2A2A2A;
        }
        .icon-wrap {
            width: 64px;
            height: 64px;
            background: rgba(255, 59, 48, 0.12);
            border: 1px solid rgba(255, 59, 48, 0.3);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }
        .card-header h1 {
            font-size: 20px;
            font-weight: 800;
            color: #FFFFFF;
            margin-bottom: 6px;
        }
        .card-header p {
            font-size: 13px;
            color: #888888;
            line-height: 1.5;
        }

        /* Card body */
        .card-body {
            padding: 28px 32px;
        }

        .greeting {
            font-size: 14px;
            color: #CCCCCC;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .greeting strong {
            color: #FFFFFF;
        }

        /* CTA Button */
        .btn-wrap {
            text-align: center;
            margin: 24px 0;
        }
        .btn {
            display: inline-block;
            background: #FF3B30;
            color: #FFFFFF !important;
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 1.5px;
            padding: 14px 36px;
            border-radius: 12px;
        }

        /* Warning box */
        .warning {
            background: rgba(255, 149, 0, 0.08);
            border: 1px solid rgba(255, 149, 0, 0.2);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .warning-icon {
            flex-shrink: 0;
            margin-top: 1px;
        }
        .warning p {
            font-size: 12px;
            color: #FF9500;
            line-height: 1.5;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #2A2A2A;
            margin: 20px 0;
        }

        /* Fallback URL */
        .fallback {
            font-size: 11px;
            color: #555555;
            line-height: 1.6;
        }
        .fallback a {
            color: #FF3B30;
            word-break: break-all;
            text-decoration: none;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 24px;
            padding: 0 8px;
        }
        .footer p {
            font-size: 11px;
            color: #444444;
            line-height: 1.6;
        }
        .footer a {
            color: #FF3B30;
            text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 520px) {
            .card-body, .card-header { padding-left: 20px; padding-right: 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">

        <!-- Logo -->
        <div class="logo">
            <span>RIVALBET</span>
        </div>

        <!-- Card -->
        <div class="card">

            <!-- Header -->
            <div class="card-header">
                <div class="icon-wrap">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h1>{{ __('email_reset_title') }}</h1>
                <p>{{ __('email_reset_subtitle') }}</p>
            </div>

            <!-- Body -->
            <div class="card-body">

                <p class="greeting">
                    {!! __('email_reset_greeting', ['username' => '<strong>' . e($username) . '</strong>']) !!}<br><br>
                    {!! __('email_reset_body') !!}
                </p>

                <!-- CTA -->
                <div class="btn-wrap">
                    <a href="{{ $url }}" class="btn">{{ __('email_reset_cta') }}</a>
                </div>

                <!-- Warning -->
                <div class="warning">
                    <div class="warning-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2" stroke-linecap="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <p>{{ __('email_reset_warning') }}</p>
                </div>

                <hr class="divider">

                <!-- Fallback -->
                <p class="fallback">
                    {{ __('email_reset_fallback') }}<br>
                    <a href="{{ $url }}">{{ $url }}</a>
                </p>

            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                © {{ date('Y') }} Rivalbet · {{ __('email_reset_footer1') }}<br>
                {{ __('email_reset_footer2') }}
            </p>
        </div>

    </div>
</body>
</html>
