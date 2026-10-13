// Copy the built service worker and web manifest to the public root.
//
// They must be served as static files: routed through Laravel they carried
// session cookies and `Vary: X-Inertia`, never returned 304, and defeated
// Safari's service-worker update byte-comparison — which caused a
// reinstall/reload loop on deploy. VitePWA emits them into public/build (its
// glob base), so this step lifts them to where the web server serves them.
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

for (const file of ['sw.js', 'manifest.webmanifest']) {
    const source = join(root, 'public', 'build', file)

    if (!existsSync(source)) {
        console.error(`pwa-root-assets: missing ${source}`)
        process.exitCode = 1
        continue
    }

    copyFileSync(source, join(root, 'public', file))
    console.log(`pwa-root-assets: public/${file}`)
}
