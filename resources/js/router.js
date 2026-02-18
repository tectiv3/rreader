import { createRouter, createWebHistory } from 'vue-router'

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
    // Catch-all: redirect to articles
    {
        path: '/:pathMatch(.*)*',
        redirect: '/articles',
    },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
