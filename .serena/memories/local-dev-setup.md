Local dev runs via `nix develop` + `overmind start` (Procfile: fpm, queue, vite).

- Reverse proxy: nginx at /etc/nginx/sites/rreader.test.conf, listening 127.0.0.1:443 with mkcert certs.
- TLS certs: mkcert at ~/.local/share/mkcert/rreader.test.pem and rreader.test-key.pem.
- PHP-FPM socket: /tmp/devenv-phpfpm-rreader.sock (fpm.conf).
- Vite auto-detects mkcert certs for HTTPS in vite.config.js.
- DB: SQLite, no external database server.
- URL: https://rreader.test