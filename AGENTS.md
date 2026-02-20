# RReader - Agent Instructions

## First Steps

**Activate the Serena project before doing anything else.** Call `activate_project` with project name `rreader` as the first action in every conversation. 
Onboarding is complete.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.2+, SQLite
- **Frontend**: Vue 3 (Composition API), Pinia 3, Vue Router 4, Tailwind CSS v4
- **Architecture**: Hybrid Inertia + SPA — auth pages use Inertia, main app is a Vue Router SPA inside `AppShell.vue`
- **PWA**: vite-plugin-pwa with Workbox

## Commands

- `npm run build` — production build
- `npm run dev` — vite dev server only
- `npm run format` — format the whole js codebase
- `./vendor/bin/pint` — PHP code formatting (Laravel Pint)
- `prettier --write <files>` — JS/Vue/CSS formatting (use global prettier, not npx)

## Code Conventions

- Vue 3 Composition API with `<script setup>` — no Options API
- No TypeScript — plain JS throughout
- Pinia stores in `resources/js/Stores/`
- Composables in `resources/js/Composables/` — module-level singletons for shared state
- Vue Router views in `resources/js/Views/`, Inertia pages in `resources/js/Pages/`
- Optimistic mutations with rollback on API failure
- `node` cannot check `.vue` files — do not use node for Vue file validation

## Git

- No git worktrees — always work directly in the main repo
- Main branch: `main`
