# RReader - Self-Hosted RSS Reader PWA

## Purpose
Self-hosted Feedly-style RSS reader PWA with Laravel backend and Vue/Inertia frontend.

## Tech Stack
- **Backend**: Laravel 12, PHP 8.2+, SQLite
- **Frontend**: Vue 3, Inertia.js v2, Tailwind CSS v4, Vite 7
- **Auth**: Laravel Breeze (Inertia/Vue)
- **PWA**: vite-plugin-pwa
- **Routing**: Ziggy for named routes in JS

## Key Patterns
- Dark mode default, class strategy (`neutral-950` bg, `neutral-900` cards, `blue-500` accent)
- Tailwind v4 with `@tailwindcss/vite` plugin (CSS-based config, no tailwind.config.js)
- Mobile-first responsive design
- `AppLayout.vue` is the main layout; `AuthenticatedLayout.vue` for Breeze pages
- Models: User, Category, Feed, Article, UserArticle (pivot)

## Commands
- `composer dev` — run all dev services (server, queue, logs, vite)
- `npm run build` — production build
- `npm run dev` — vite dev server
- `php artisan test` — run tests
- `./vendor/bin/pint` — PHP code formatting (Laravel Pint)
