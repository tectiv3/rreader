<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#171717" id="theme-color-meta">
        <script>
            (function() {
                var t = localStorage.getItem('rreader-theme');
                if (!t || !['dark','light','system'].includes(t)) {
                    var old = localStorage.getItem('rreader-dark-mode');
                    t = old !== null ? (old === 'true' ? 'dark' : 'light') : 'dark';
                }
                var dark = t === 'system'
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    : t === 'dark';
                if (dark) document.documentElement.classList.add('dark');
                document.getElementById('theme-color-meta').content = dark ? '#171717' : '#ffffff';
            })();
        </script>
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="RReader">

        <title inertia>{{ config('app.name', 'RReader') }}</title>

        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-dark.png" media="(prefers-color-scheme: dark)">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/js/app.js', "resources/js/Pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        @inertia
    </body>
</html>
