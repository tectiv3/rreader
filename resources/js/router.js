import { createRouter, createWebHistory } from 'vue-router'
import { appName } from '@/appName.js'

const routeTitles = {
    'articles.index': null, // set dynamically from filterTitle
    'articles.search': 'Search',
    'articles.show': null, // set dynamically from article title
    'feeds.manage': 'Manage Feeds',
    'feeds.create': 'Add Feed',
    'feeds.edit': 'Edit Feed',
    settings: 'Settings',
    'opml.import': 'Import OPML',
    'chat.index': 'Chat',
    'chat.show': null, // set dynamically from the conversation's article title
}

const routes = [
    {
        path: '/articles',
        name: 'articles.index',
        component: () => import('@/Views/ArticleListView.vue'),
    },
    {
        path: '/articles/search',
        name: 'articles.search',
        component: () => import('@/Views/SearchView.vue'),
    },
    {
        path: '/articles/highlights',
        name: 'articles.highlights',
        component: () => import('@/Views/HighlightsView.vue'),
    },
    {
        path: '/articles/:id',
        name: 'articles.show',
        component: () => import('@/Views/ArticleDetailView.vue'),
        props: route => ({ id: Number(route.params.id) }),
    },
    {
        path: '/feeds/manage',
        name: 'feeds.manage',
        component: () => import('@/Views/FeedManageView.vue'),
    },
    {
        path: '/feeds/create',
        name: 'feeds.create',
        component: () => import('@/Views/FeedCreateView.vue'),
    },
    {
        path: '/feeds/:id/edit',
        name: 'feeds.edit',
        component: () => import('@/Views/FeedEditView.vue'),
        props: route => ({ id: Number(route.params.id) }),
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/Views/SettingsView.vue'),
    },
    {
        path: '/opml/import',
        name: 'opml.import',
        component: () => import('@/Views/OpmlImportView.vue'),
    },
    {
        path: '/chat',
        name: 'chat.index',
        component: () => import('@/Views/ChatView.vue'),
    },
    // Conversation ids are UUIDs — kept as strings, unlike the numeric article ids
    {
        path: '/chat/:conversationId',
        name: 'chat.show',
        component: () => import('@/Views/ChatConversationView.vue'),
        props: route => ({ conversationId: route.params.conversationId }),
    },
    {
        path: '/highlights',
        redirect: '/articles/highlights',
    },
    // Catch-all: redirect to articles
    {
        path: '/:pathMatch(.*)*',
        redirect: '/articles',
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.afterEach(to => {
    const title = routeTitles[to.name]
    if (title) {
        document.title = `${title} - ${appName}`
    }
})

export default router

/**
 * Set the document title from views that have dynamic titles
 * (e.g. ArticleListView uses filterTitle, ArticleDetailView uses article title)
 */
export function setTitle(title) {
    document.title = title ? `${title} - ${appName}` : appName
}
