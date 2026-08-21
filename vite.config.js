import fs from 'fs'
import os from 'os'
import path from 'path'
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function localHttps() {
    const certDir = path.join(os.homedir(), '.local/share/mkcert')
    const key = path.join(certDir, 'rreader.test-key.pem')
    const cert = path.join(certDir, 'rreader.test.pem')
    if (fs.existsSync(key) && fs.existsSync(cert)) {
        return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) }
    }
    return false
}

// Laravel serves compiled assets from public/build; laravel-vite-plugin uses the
// same prefix for asset URLs.
const BUILD_BASE = '/build/'

export default defineConfig({
    server: {
        https: localHttps(),
        hmr: { host: 'rreader.test' },
    },
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        tailwindcss(),
        VitePWA({
            // app.js registers /sw.js by hand — don't emit or inject registerSW.js,
            // which would otherwise register /build/sw.js with a /build/ scope.
            injectRegister: null,
            includeAssets: [
                'favicon.ico',
                'favicon.svg',
                'apple-touch-icon.png',
                'icons/apple-touch-icon-dark.png',
                'robots.txt',
            ],
            manifest: {
                name: 'RReader',
                short_name: 'RReader',
                description: 'A self-hosted RSS reader',
                theme_color: '#171717',
                background_color: '#171717',
                display: 'standalone',
                orientation: 'portrait-primary',
                scope: '/',
                start_url: '/articles',
                share_target: {
                    action: '/_share-target',
                    method: 'GET',
                    params: {
                        url: 'url',
                        title: 'title',
                        text: 'text',
                    },
                },
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                    {
                        src: '/favicon.svg',
                        sizes: 'any',
                        type: 'image/svg+xml',
                    },
                ],
            },
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                // The SW is served from / (see the /sw.js route) so its scope covers the
                // whole origin, but Vite emits it into public/build. Inline the Workbox
                // runtime instead of importing it relatively — `./workbox-*.js` would
                // resolve against /sw.js and 404, which aborts installation entirely.
                inlineWorkboxRuntime: true,
                // Same reason: precache entries are emitted relative to the build dir and
                // would resolve to /assets/*. Prefix them with the real public path.
                manifestTransforms: [
                    manifest => ({
                        manifest: manifest.map(entry => ({
                            ...entry,
                            // Only prefix build-relative entries. Anything already
                            // rooted is left alone, so the transform stays correct
                            // if the plugin ever routes absolute URLs through here.
                            url: entry.url.startsWith('/')
                                ? entry.url
                                : `${BUILD_BASE}${entry.url}`,
                        })),
                    }),
                ],
                // Navigations are handled by sw-navigation.js, which falls back to a
                // cached app shell so deep links keep working offline.
                navigateFallback: null,
                importScripts: [
                    '/sw-reading-state.js',
                    '/sw-share-target.js',
                    '/sw-navigation.js',
                ],
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/fonts\.(bunny\.net|googleapis\.com)\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        // Cache API responses for offline viewing. Article lists and
                        // article bodies are deliberately excluded: the store owns those
                        // in IndexedDB, where the offline copy stays in step with reads
                        // and read-later toggles. A second, stale copy here would win
                        // offline and silently undo them.
                        urlPattern: ({ url }) =>
                            /\/api\//.test(url.pathname) &&
                            !/^\/api\/articles(\/\d+)?$/.test(url.pathname),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24, // 1 day
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            networkTimeoutSeconds: 5,
                        },
                    },
                    {
                        // Cache article images for offline viewing
                        urlPattern: /\.(?:jpg|jpeg|gif|png|webp|avif|svg)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'article-images-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                // No 0: an opaque cross-origin response covers 404s and
                                // hotlink blocks alike, and WebKit bills each one at
                                // ~7MB of quota regardless of size — enough of them
                                // evicts IndexedDB and takes offline mode with it.
                                statuses: [200],
                            },
                        },
                    },
                    {
                        // Cache external article images (cross-origin)
                        urlPattern:
                            /^https?:\/\/.*\.(?:jpg|jpeg|gif|png|webp|avif|svg)(?:\?.*)?$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'external-images-cache',
                            expiration: {
                                maxEntries: 300,
                                maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days
                            },
                            cacheableResponse: {
                                // No 0: an opaque cross-origin response covers 404s and
                                // hotlink blocks alike, and WebKit bills each one at
                                // ~7MB of quota regardless of size — enough of them
                                // evicts IndexedDB and takes offline mode with it.
                                statuses: [200],
                            },
                        },
                    },
                    {
                        // Cache favicon images
                        urlPattern: /favicon/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'favicon-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                // No 0: an opaque cross-origin response covers 404s and
                                // hotlink blocks alike, and WebKit bills each one at
                                // ~7MB of quota regardless of size — enough of them
                                // evicts IndexedDB and takes offline mode with it.
                                statuses: [200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
})
