fpm: rm -f /tmp/devenv-phpfpm-rreader.sock; exec php-fpm --nodaemonize --fpm-config fpm.conf
queue: php artisan queue:work --tries=1 --timeout=60
vite: pnpm run dev
