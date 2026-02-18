<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed } from 'vue';
import { router, useForm } from '@inertiajs/vue3';

const props = defineProps({
    categories: Array,
    uncategorizedFeeds: Array,
});

// Local copies for optimistic UI
const localCategories = ref(JSON.parse(JSON.stringify(props.categories)));
const localUncategorizedFeeds = ref(JSON.parse(JSON.stringify(props.uncategorizedFeeds)));

// All categories for "move feed" dropdown
const allCategories = computed(() => localCategories.value);

// --- New Category ---
const newCategoryName = ref('');
const creatingCategory = false;

function createCategory() {
    if (!newCategoryName.value.trim()) return;
    router.post(route('categories.store'), {
        name: newCategoryName.value.trim(),
    }, {
        preserveScroll: true,
        onSuccess: () => {
            newCategoryName.value = '';
        },
    });
}

// --- Rename Category ---
const editingCategoryId = ref(null);
const editingCategoryName = ref('');

function startEditCategory(category) {
    editingCategoryId.value = category.id;
    editingCategoryName.value = category.name;
}

function saveCategory(category) {
    if (!editingCategoryName.value.trim()) return;
    router.put(route('categories.update', category.id), {
        name: editingCategoryName.value.trim(),
    }, {
        preserveScroll: true,
        onSuccess: () => {
            editingCategoryId.value = null;
        },
    });
}

function cancelEditCategory() {
    editingCategoryId.value = null;
}

// --- Delete Category ---
const deletingCategoryId = ref(null);
const deleteMoveTarget = ref(null);

function startDeleteCategory(category) {
    deletingCategoryId.value = category.id;
    deleteMoveTarget.value = null;
}

function confirmDeleteCategory(category) {
    router.delete(route('categories.destroy', category.id), {
        data: { move_to_category_id: deleteMoveTarget.value },
        preserveScroll: true,
        onSuccess: () => {
            deletingCategoryId.value = null;
        },
    });
}

function cancelDeleteCategory() {
    deletingCategoryId.value = null;
}

// --- Reorder Categories ---
function moveCategoryUp(index) {
    if (index === 0) return;
    const cats = [...localCategories.value];
    [cats[index - 1], cats[index]] = [cats[index], cats[index - 1]];
    localCategories.value = cats;
    saveOrder(cats);
}

function moveCategoryDown(index) {
    if (index === localCategories.value.length - 1) return;
    const cats = [...localCategories.value];
    [cats[index], cats[index + 1]] = [cats[index + 1], cats[index]];
    localCategories.value = cats;
    saveOrder(cats);
}

function saveOrder(cats) {
    router.post(route('categories.reorder'), {
        order: cats.map(c => c.id),
    }, {
        preserveScroll: true,
    });
}

// --- Rename Feed ---
const editingFeedId = ref(null);
const editingFeedTitle = ref('');

function startEditFeed(feed) {
    editingFeedId.value = feed.id;
    editingFeedTitle.value = feed.title;
}

function saveFeed(feed, currentCategoryId) {
    if (!editingFeedTitle.value.trim()) return;
    router.put(route('feeds.update', feed.id), {
        title: editingFeedTitle.value.trim(),
        category_id: currentCategoryId,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            editingFeedId.value = null;
        },
    });
}

function cancelEditFeed() {
    editingFeedId.value = null;
}

// --- Move Feed ---
const movingFeedId = ref(null);
const movingFeedCategoryId = ref(null);

function startMoveFeed(feed, currentCategoryId) {
    movingFeedId.value = feed.id;
    movingFeedCategoryId.value = currentCategoryId;
}

function confirmMoveFeed(feed) {
    router.put(route('feeds.update', feed.id), {
        title: feed.title,
        category_id: movingFeedCategoryId.value || null,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            movingFeedId.value = null;
        },
    });
}

function cancelMoveFeed() {
    movingFeedId.value = null;
}

// --- Unsubscribe Feed ---
const unsubscribingFeedId = ref(null);

function startUnsubscribe(feed) {
    unsubscribingFeedId.value = feed.id;
}

function confirmUnsubscribe(feed) {
    router.delete(route('feeds.destroy', feed.id), {
        preserveScroll: true,
        onSuccess: () => {
            unsubscribingFeedId.value = null;
        },
    });
}

function cancelUnsubscribe() {
    unsubscribingFeedId.value = null;
}

function goBack() {
    router.visit(route('articles.index'));
}

function reenableFeed(feed) {
    router.post(route('feeds.reenable', feed.id), {}, {
        preserveScroll: true,
    });
}
</script>

<template>
    <AppLayout>
        <template #header-left>
            <button
                @click="goBack"
                class="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Back to articles"
                aria-label="Back to articles"
            >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
        </template>
        <template #title>Manage Feeds</template>

        <div class="mx-auto max-w-2xl px-4 py-6 space-y-8">

            <!-- Create Category -->
            <section>
                <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-3">New Category</h2>
                <form @submit.prevent="createCategory" class="flex gap-2">
                    <input
                        v-model="newCategoryName"
                        type="text"
                        placeholder="Category name"
                        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                        type="submit"
                        :disabled="!newCategoryName.trim()"
                        class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </form>
            </section>

            <!-- Categories -->
            <section v-for="(category, catIndex) in localCategories" :key="category.id">
                <div class="flex items-center gap-2 mb-3">
                    <!-- Reorder buttons -->
                    <div class="flex flex-col">
                        <button
                            @click="moveCategoryUp(catIndex)"
                            :disabled="catIndex === 0"
                            class="p-0.5 text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move category up"
                            aria-label="Move category up"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                        </button>
                        <button
                            @click="moveCategoryDown(catIndex)"
                            :disabled="catIndex === localCategories.length - 1"
                            class="p-0.5 text-slate-600 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move category down"
                            aria-label="Move category down"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>

                    <!-- Category name / edit -->
                    <div class="flex-1 min-w-0">
                        <template v-if="editingCategoryId === category.id">
                            <form @submit.prevent="saveCategory(category)" class="flex gap-2">
                                <input
                                    v-model="editingCategoryName"
                                    type="text"
                                    class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    @keydown.escape="cancelEditCategory"
                                    ref="categoryInput"
                                />
                                <button type="submit" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">Save</button>
                                <button type="button" @click="cancelEditCategory" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                            </form>
                        </template>
                        <template v-else>
                            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">{{ category.name }}</h2>
                        </template>
                    </div>

                    <!-- Category actions -->
                    <div v-if="editingCategoryId !== category.id && deletingCategoryId !== category.id" class="flex gap-1">
                        <button
                            @click="startEditCategory(category)"
                            class="rounded-lg p-1.5 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                            title="Rename category"
                            aria-label="Rename category"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </button>
                        <button
                            @click="startDeleteCategory(category)"
                            class="rounded-lg p-1.5 text-slate-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                            title="Delete category"
                            aria-label="Delete category"
                        >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Delete confirmation -->
                <div v-if="deletingCategoryId === category.id" class="mb-3 rounded-lg border border-red-800/50 bg-red-950/50 p-4">
                    <p class="text-sm text-red-300 mb-3">
                        Delete "{{ category.name }}"?
                        <span v-if="category.feeds.length > 0">
                            {{ category.feeds.length }} feed{{ category.feeds.length > 1 ? 's' : '' }} will be moved.
                        </span>
                    </p>
                    <div v-if="category.feeds.length > 0" class="mb-3">
                        <label class="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Move feeds to:</label>
                        <select
                            v-model="deleteMoveTarget"
                            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <option :value="null">No category (uncategorized)</option>
                            <option
                                v-for="cat in localCategories.filter(c => c.id !== category.id)"
                                :key="cat.id"
                                :value="cat.id"
                            >
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <button
                            @click="confirmDeleteCategory(category)"
                            class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                        <button
                            @click="cancelDeleteCategory"
                            class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <!-- Feeds in category -->
                <div class="space-y-1">
                    <div
                        v-for="feed in category.feeds"
                        :key="feed.id"
                        class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3"
                    >
                        <!-- Feed row -->
                        <div class="flex items-center gap-3">
                            <img
                                v-if="feed.favicon_url"
                                :src="feed.favicon_url"
                                class="h-5 w-5 shrink-0 rounded-sm"
                                alt=""
                            />
                            <div v-else class="h-5 w-5 shrink-0 rounded-sm bg-slate-300 dark:bg-slate-700" />

                            <div v-if="editingFeedId === feed.id" class="flex-1 min-w-0">
                                <form @submit.prevent="saveFeed(feed, category.id)" class="flex gap-2">
                                    <input
                                        v-model="editingFeedTitle"
                                        type="text"
                                        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        @keydown.escape="cancelEditFeed"
                                    />
                                    <button type="submit" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">Save</button>
                                    <button type="button" @click="cancelEditFeed" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                                </form>
                            </div>
                            <div v-else-if="movingFeedId === feed.id" class="flex-1 min-w-0">
                                <div class="flex gap-2 items-center">
                                    <select
                                        v-model="movingFeedCategoryId"
                                        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    >
                                        <option :value="null">Uncategorized</option>
                                        <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                    </select>
                                    <button @click="confirmMoveFeed(feed)" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">Move</button>
                                    <button @click="cancelMoveFeed" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                                </div>
                            </div>
                            <template v-else>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <p class="text-sm text-slate-800 dark:text-slate-200 truncate">{{ feed.title }}</p>
                                        <svg v-if="feed.disabled_at" class="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-label="Feed disabled">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <p class="text-xs text-slate-600 dark:text-slate-500 truncate">{{ feed.feed_url }}</p>
                                    <p v-if="feed.disabled_at && feed.last_error" class="text-xs text-amber-600 dark:text-amber-500 mt-0.5 truncate">{{ feed.last_error }}</p>
                                </div>
                                <div class="flex shrink-0 gap-1">
                                    <button
                                        v-if="feed.disabled_at"
                                        @click="reenableFeed(feed)"
                                        class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 border border-amber-500/50 hover:bg-amber-500/10 transition-colors"
                                        title="Retry feed"
                                        aria-label="Retry feed"
                                    >
                                        Retry
                                    </button>
                                    <button
                                        @click="startEditFeed(feed)"
                                        class="rounded-lg p-1.5 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                        title="Rename feed"
                                        aria-label="Rename feed"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="startMoveFeed(feed, category.id)"
                                        class="rounded-lg p-1.5 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                        title="Move feed"
                                        aria-label="Move feed"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="startUnsubscribe(feed)"
                                        class="rounded-lg p-1.5 text-slate-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                                        title="Unsubscribe"
                                        aria-label="Unsubscribe"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </template>
                        </div>

                        <!-- Unsubscribe confirmation -->
                        <div v-if="unsubscribingFeedId === feed.id" class="mt-3 rounded-lg border border-red-800/50 bg-red-950/50 p-3">
                            <p class="text-sm text-red-300 mb-2">Unsubscribe from "{{ feed.title }}"? All articles will be removed.</p>
                            <div class="flex gap-2">
                                <button
                                    @click="confirmUnsubscribe(feed)"
                                    class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Unsubscribe
                                </button>
                                <button
                                    @click="cancelUnsubscribe"
                                    class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    <p v-if="category.feeds.length === 0" class="px-4 py-2 text-sm text-slate-600 dark:text-slate-500 italic">No feeds in this category</p>
                </div>
            </section>

            <!-- Uncategorized Feeds -->
            <section v-if="localUncategorizedFeeds.length > 0">
                <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-3">Uncategorized</h2>
                <div class="space-y-1">
                    <div
                        v-for="feed in localUncategorizedFeeds"
                        :key="feed.id"
                        class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3"
                    >
                        <div class="flex items-center gap-3">
                            <img
                                v-if="feed.favicon_url"
                                :src="feed.favicon_url"
                                class="h-5 w-5 shrink-0 rounded-sm"
                                alt=""
                            />
                            <div v-else class="h-5 w-5 shrink-0 rounded-sm bg-slate-300 dark:bg-slate-700" />

                            <div v-if="editingFeedId === feed.id" class="flex-1 min-w-0">
                                <form @submit.prevent="saveFeed(feed, null)" class="flex gap-2">
                                    <input
                                        v-model="editingFeedTitle"
                                        type="text"
                                        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-base text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                        @keydown.escape="cancelEditFeed"
                                    />
                                    <button type="submit" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">Save</button>
                                    <button type="button" @click="cancelEditFeed" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                                </form>
                            </div>
                            <div v-else-if="movingFeedId === feed.id" class="flex-1 min-w-0">
                                <div class="flex gap-2 items-center">
                                    <select
                                        v-model="movingFeedCategoryId"
                                        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                    >
                                        <option :value="null">Uncategorized</option>
                                        <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                                    </select>
                                    <button @click="confirmMoveFeed(feed)" class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">Move</button>
                                    <button @click="cancelMoveFeed" class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                                </div>
                            </div>
                            <template v-else>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <p class="text-sm text-slate-800 dark:text-slate-200 truncate">{{ feed.title }}</p>
                                        <svg v-if="feed.disabled_at" class="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-label="Feed disabled">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <p class="text-xs text-slate-600 dark:text-slate-500 truncate">{{ feed.feed_url }}</p>
                                    <p v-if="feed.disabled_at && feed.last_error" class="text-xs text-amber-600 dark:text-amber-500 mt-0.5 truncate">{{ feed.last_error }}</p>
                                </div>
                                <div class="flex shrink-0 gap-1">
                                    <button
                                        v-if="feed.disabled_at"
                                        @click="reenableFeed(feed)"
                                        class="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-500 border border-amber-500/50 hover:bg-amber-500/10 transition-colors"
                                        title="Retry feed"
                                        aria-label="Retry feed"
                                    >
                                        Retry
                                    </button>
                                    <button
                                        @click="startEditFeed(feed)"
                                        class="rounded-lg p-1.5 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                        title="Rename feed"
                                        aria-label="Rename feed"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="startMoveFeed(feed, null)"
                                        class="rounded-lg p-1.5 text-slate-600 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                        title="Move feed"
                                        aria-label="Move feed"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="startUnsubscribe(feed)"
                                        class="rounded-lg p-1.5 text-slate-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                                        title="Unsubscribe"
                                        aria-label="Unsubscribe"
                                    >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </template>
                        </div>

                        <!-- Unsubscribe confirmation -->
                        <div v-if="unsubscribingFeedId === feed.id" class="mt-3 rounded-lg border border-red-800/50 bg-red-950/50 p-3">
                            <p class="text-sm text-red-300 mb-2">Unsubscribe from "{{ feed.title }}"? All articles will be removed.</p>
                            <div class="flex gap-2">
                                <button
                                    @click="confirmUnsubscribe(feed)"
                                    class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                >
                                    Unsubscribe
                                </button>
                                <button
                                    @click="cancelUnsubscribe"
                                    class="rounded-lg px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Empty state -->
            <div v-if="localCategories.length === 0 && localUncategorizedFeeds.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <p class="mt-3 text-slate-600 dark:text-slate-500">No feeds yet. Add your first feed to get started.</p>
            </div>
        </div>
    </AppLayout>
</template>
