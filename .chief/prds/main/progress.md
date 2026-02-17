## Codebase Patterns
- Tailwind v4 with `@tailwindcss/vite` plugin (no tailwind.config.js, use CSS-based config in `resources/css/app.css`)
- Dark mode via `class` strategy: `@variant dark (&:where(.dark, .dark *));` in CSS
- Dark mode composable at `resources/js/Composables/useDarkMode.js` — uses localStorage
- `AppLayout.vue` is the main app layout (mobile-first, dark mode); `AuthenticatedLayout.vue` is Breeze's updated layout
- PWA via `vite-plugin-pwa` configured in `vite.config.js`
- App name is "RReader" (set in `.env` and PWA manifest)
- `@vitejs/plugin-vue` v6 required for Vite 7 compatibility
- Breeze Vue scaffolding provides auth pages under `resources/js/Pages/Auth/`
- Use `slate-950` for backgrounds, `slate-900` for cards/surfaces, `slate-800` for borders, `blue-500` for primary accent

---

## 2026-02-17 - US-001
- What was implemented: Project scaffolding with Laravel 11 + Inertia.js + Vue 3, Tailwind CSS v4 with dark mode (class strategy), PWA manifest and service worker via vite-plugin-pwa, base AppLayout component with mobile-first responsive design and dark mode toggle
- Files changed:
  - `composer.json` / `package.json` — project dependencies
  - `vite.config.js` — Vite config with Laravel, Vue, Tailwind v4, and PWA plugins
  - `resources/css/app.css` — Tailwind v4 CSS config with dark mode variant
  - `resources/js/app.js` — Inertia app setup with service worker registration
  - `resources/views/app.blade.php` — Blade template with PWA meta tags, dark class on html
  - `resources/js/Layouts/AppLayout.vue` — New mobile-first dark mode layout
  - `resources/js/Layouts/AuthenticatedLayout.vue` — Updated Breeze layout for dark mode
  - `resources/js/Layouts/GuestLayout.vue` — Updated Breeze guest layout for dark mode
  - `resources/js/Composables/useDarkMode.js` — Dark mode composable with localStorage persistence
  - `resources/js/Pages/Dashboard.vue` — Updated to use AppLayout
  - `public/icons/` — PWA icons (192x192, 512x512)
  - `.env` / `.env.example` — APP_NAME set to RReader
- **Learnings for future iterations:**
  - Breeze scaffolds Tailwind v3 config even when `@tailwindcss/vite` v4 is in package.json — must delete `tailwind.config.js` and `postcss.config.js` and use CSS-based config
  - `@vitejs/plugin-vue@5` is incompatible with Vite 7, need v6
  - `imagefilledroundedrectangle()` doesn't exist in all PHP GD versions — use `imagefilledrectangle()` instead
  - The `postcss` and `autoprefixer` packages in package.json are not needed with Tailwind v4 vite plugin but were left to avoid breaking anything
---
