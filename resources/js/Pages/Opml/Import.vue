<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import InputError from '@/Components/InputError.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';

const props = defineProps({
    preview: {
        type: Object,
        default: null,
    },
    totalFeeds: {
        type: Number,
        default: 0,
    },
    duplicateCount: {
        type: Number,
        default: 0,
    },
});

const uploadForm = useForm({
    file: null,
});

const isImporting = ref(false);

// Track selected feeds (by feed_url)
const selectedFeeds = ref([]);

const allNewFeeds = computed(() => {
    if (!props.preview) return [];
    const feeds = [];
    for (const cat of props.preview.categories) {
        for (const feed of cat.feeds) {
            if (!feed.is_duplicate) {
                feeds.push(feed.feed_url);
            }
        }
    }
    for (const feed of props.preview.uncategorized) {
        if (!feed.is_duplicate) {
            feeds.push(feed.feed_url);
        }
    }
    return feeds;
});

// Re-initialize selections whenever preview changes (including on second upload)
watch(() => props.preview, () => {
    selectedFeeds.value = [...allNewFeeds.value];
}, { immediate: true });

const selectedCount = computed(() => selectedFeeds.value.length);

const allSelected = computed(() => {
    return allNewFeeds.value.length > 0 && selectedFeeds.value.length === allNewFeeds.value.length;
});

const toggleAll = () => {
    if (allSelected.value) {
        selectedFeeds.value = [];
    } else {
        selectedFeeds.value = [...allNewFeeds.value];
    }
};

const toggleFeed = (feedUrl) => {
    if (!allNewFeeds.value.includes(feedUrl)) return;
    const index = selectedFeeds.value.indexOf(feedUrl);
    if (index > -1) {
        selectedFeeds.value.splice(index, 1);
    } else {
        selectedFeeds.value.push(feedUrl);
    }
};

const isFeedSelected = (feedUrl) => selectedFeeds.value.includes(feedUrl);

const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadForm.file = file;
    }
};

const uploadFile = () => {
    if (!uploadForm.file) return;

    uploadForm.post(route('opml.preview'), {
        forceFormData: true,
        preserveScroll: true,
    });
};

const importFeeds = () => {
    if (selectedCount.value === 0) return;

    isImporting.value = true;
    router.post(route('opml.import'), {
        selected_feeds: selectedFeeds.value,
    }, {
        onFinish: () => {
            isImporting.value = false;
        },
    });
};

const exportOpml = () => {
    window.location.href = route('opml.export');
};
</script>

<template>
    <AppLayout>
        <template #title>Import / Export</template>

        <Head title="Import / Export" />

        <div class="mx-auto max-w-lg px-4 py-6 space-y-5">
            <!-- Import Section -->
            <div class="rounded-xl bg-slate-900 p-5">
                <h2 class="text-base font-medium text-slate-200 mb-1">Import OPML</h2>
                <p class="text-sm text-slate-400 mb-4">
                    Upload an .opml or .xml file to import feeds from another reader.
                </p>

                <form @submit.prevent="uploadFile">
                    <div>
                        <label
                            class="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-700 bg-slate-800 px-4 py-6 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-300"
                            :class="{ 'border-blue-500 text-blue-400': uploadForm.file }"
                        >
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span v-if="uploadForm.file">{{ uploadForm.file.name }}</span>
                            <span v-else>Choose .opml or .xml file</span>
                            <input
                                type="file"
                                accept=".opml,.xml"
                                class="hidden"
                                @change="onFileChange"
                            />
                        </label>
                        <InputError class="mt-2" :message="uploadForm.errors.file" />
                    </div>

                    <PrimaryButton
                        class="mt-4 w-full"
                        :class="{ 'opacity-25': uploadForm.processing || !uploadForm.file }"
                        :disabled="uploadForm.processing || !uploadForm.file"
                    >
                        <svg v-if="uploadForm.processing" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ uploadForm.processing ? 'Parsing...' : 'Upload & Preview' }}
                    </PrimaryButton>
                </form>
            </div>

            <!-- Preview Section -->
            <div v-if="preview" class="rounded-xl bg-slate-900 p-5">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-base font-medium text-slate-200">
                        Preview
                        <span class="text-sm font-normal text-slate-400">
                            ({{ totalFeeds }} feeds found<span v-if="duplicateCount">, {{ duplicateCount }} already subscribed</span>)
                        </span>
                    </h2>
                </div>

                <!-- Select all toggle -->
                <div class="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                    <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="allSelected"
                            @change="toggleAll"
                            class="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                        />
                        Select all new feeds ({{ allNewFeeds.length }})
                    </label>
                </div>

                <!-- Categories -->
                <div v-for="(category, catIdx) in preview.categories" :key="catIdx" class="mb-4">
                    <h3 class="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        {{ category.name }}
                    </h3>

                    <div class="space-y-1 pl-1">
                        <label
                            v-for="(feed, feedIdx) in category.feeds"
                            :key="feedIdx"
                            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                            :class="feed.is_duplicate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'"
                        >
                            <input
                                type="checkbox"
                                :checked="feed.is_duplicate ? false : isFeedSelected(feed.feed_url)"
                                :disabled="feed.is_duplicate"
                                @change="toggleFeed(feed.feed_url)"
                                class="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:opacity-40"
                            />
                            <img
                                v-if="feed.favicon_url"
                                :src="feed.favicon_url"
                                class="h-4 w-4 rounded"
                                @error="$event.target.style.display = 'none'"
                            />
                            <span class="flex-1 truncate" :class="feed.is_duplicate ? 'text-slate-500 line-through' : 'text-slate-200'">
                                {{ feed.title }}
                            </span>
                            <span v-if="feed.is_duplicate" class="text-xs text-slate-500 shrink-0">subscribed</span>
                        </label>
                    </div>
                </div>

                <!-- Uncategorized -->
                <div v-if="preview.uncategorized.length > 0" class="mb-4">
                    <h3 class="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                        Uncategorized
                    </h3>

                    <div class="space-y-1 pl-1">
                        <label
                            v-for="(feed, feedIdx) in preview.uncategorized"
                            :key="feedIdx"
                            class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition"
                            :class="feed.is_duplicate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'"
                        >
                            <input
                                type="checkbox"
                                :checked="feed.is_duplicate ? false : isFeedSelected(feed.feed_url)"
                                :disabled="feed.is_duplicate"
                                @change="toggleFeed(feed.feed_url)"
                                class="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:opacity-40"
                            />
                            <img
                                v-if="feed.favicon_url"
                                :src="feed.favicon_url"
                                class="h-4 w-4 rounded"
                                @error="$event.target.style.display = 'none'"
                            />
                            <span class="flex-1 truncate" :class="feed.is_duplicate ? 'text-slate-500 line-through' : 'text-slate-200'">
                                {{ feed.title }}
                            </span>
                            <span v-if="feed.is_duplicate" class="text-xs text-slate-500 shrink-0">subscribed</span>
                        </label>
                    </div>
                </div>

                <!-- Import Button -->
                <PrimaryButton
                    class="mt-2 w-full"
                    :class="{ 'opacity-25': isImporting || selectedCount === 0 }"
                    :disabled="isImporting || selectedCount === 0"
                    @click="importFeeds"
                >
                    <svg v-if="isImporting" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ isImporting ? 'Importing...' : `Import ${selectedCount} Feed${selectedCount !== 1 ? 's' : ''}` }}
                </PrimaryButton>
            </div>

            <!-- Export Section -->
            <div class="rounded-xl bg-slate-900 p-5">
                <h2 class="text-base font-medium text-slate-200 mb-1">Export OPML</h2>
                <p class="text-sm text-slate-400 mb-4">
                    Download your subscriptions as an OPML file for backup or migration.
                </p>

                <button
                    @click="exportOpml"
                    class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download OPML File
                </button>
            </div>
        </div>
    </AppLayout>
</template>
