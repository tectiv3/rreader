import { reactive } from 'vue';

// Module-level state — survives Inertia page navigations within the same
// browser session. Cleared on full page refresh (server provides fresh data).
const readArticles = reactive(new Map());

export function useArticleReadState() {
    function markRead(articleId, feedId) {
        if (!readArticles.has(articleId)) {
            readArticles.set(articleId, feedId);
        }
    }

    /**
     * Patches an article array, marking any articles in the store as read.
     * Returns per-feed deltas for sidebar counter adjustment (only for
     * articles that were actually changed from unread → read).
     */
    function applyReadStates(articles) {
        if (readArticles.size === 0) return {};

        const deltas = {};
        for (let i = 0; i < articles.length; i++) {
            const a = articles[i];
            if (!a.is_read && readArticles.has(a.id)) {
                articles[i] = { ...a, is_read: true };
                const feedId = a.feed?.id || readArticles.get(a.id);
                if (feedId) {
                    deltas[feedId] = (deltas[feedId] || 0) - 1;
                }
            }
        }
        return deltas;
    }

    return { markRead, applyReadStates };
}
