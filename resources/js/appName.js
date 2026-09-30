/**
 * Application name, sourced from Laravel's `config('app.name')` via the
 * server-rendered meta tag — one source of truth, and it does not depend on
 * Vite's dotenv expansion. The previous VITE_APP_NAME copy in .env relied on
 * `${APP_NAME}` substitution that a shell environment exporting an unexpanded
 * VITE_APP_NAME silently defeated, leaking the literal into page titles.
 */
export const appName =
    (typeof document !== 'undefined' &&
        document.querySelector('meta[name="app-name"]')?.content?.trim()) ||
    'RReader'
