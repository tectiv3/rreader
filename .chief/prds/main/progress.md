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
- Use `text-base` on form inputs for mobile (prevents iOS auto-zoom on focus)
- Use `focus:ring-offset-slate-900` on dark backgrounds for proper focus ring visibility
- Breeze components default to light theme — always replace gray/indigo with slate/blue palette

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

## 2026-02-17 - US-002
- What was implemented: Dark-themed, mobile-first authentication pages (Login, Register, Forgot Password, Verify Email, Confirm Password). Updated all Breeze UI components (TextInput, PrimaryButton, InputLabel, InputError, Checkbox) for dark theme with proper slate/blue color scheme. Replaced default Laravel Welcome page with minimal RReader landing page. All auth flows work with proper dark styling, large touch targets, and full-width buttons.
- Files changed:
  - `resources/js/Components/TextInput.vue` — Dark bg/border/text colors (slate-800/700/100), blue focus ring
  - `resources/js/Components/PrimaryButton.vue` — Blue-600 bg, py-3 for larger touch target, justify-center
  - `resources/js/Components/InputLabel.vue` — text-slate-300 for dark readability
  - `resources/js/Components/InputError.vue` — text-red-400 for dark contrast
  - `resources/js/Components/Checkbox.vue` — Dark bg/border, blue-500 check color
  - `resources/js/Pages/Auth/Login.vue` — Full-width button, dark link colors, "Create an account" link, text-base inputs
  - `resources/js/Pages/Auth/Register.vue` — Full-width button, dark link colors, centered "Already registered?" link
  - `resources/js/Pages/Auth/ForgotPassword.vue` — Dark text colors (slate-400, green-400)
  - `resources/js/Pages/Auth/ConfirmPassword.vue` — Dark text colors
  - `resources/js/Pages/Auth/VerifyEmail.vue` — Dark text/link colors, blue focus rings
  - `resources/js/Pages/Welcome.vue` — Replaced Laravel default with minimal RReader landing (logo, login/register buttons)
  - `routes/web.php` — Removed unused Application import and version props
- **Learnings for future iterations:**
  - Breeze components use light-theme colors by default (gray-300, gray-600, gray-700, indigo-500) — must replace all with dark palette (slate-700, slate-400, slate-300, blue-500)
  - Use `text-base` on inputs for mobile to prevent iOS auto-zoom on focus (16px minimum)
  - Use `focus:ring-offset-slate-900` on dark backgrounds so focus rings look correct
  - GuestLayout was already dark-themed from US-001, so auth pages just needed component and page-level color fixes
---
