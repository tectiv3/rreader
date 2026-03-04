self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    if (url.pathname !== '/_share-target') return

    event.respondWith(
        (async () => {
            const sharedUrl = url.searchParams.get('url') || url.searchParams.get('text') || ''

            return Response.redirect(
                `/articles?save-url=${encodeURIComponent(sharedUrl)}`,
                303
            )
        })()
    )
})
