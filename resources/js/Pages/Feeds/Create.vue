<script setup>
import AppLayout from '@/Layouts/AppLayout.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    categories: {
        type: Array,
        default: () => [],
    },
    preview: {
        type: Object,
        default: null,
    },
});

const searchForm = useForm({
    url: '',
});

const subscribeForm = useForm({
    feed_url: '',
    title: '',
    category_id: '',
    new_category: '',
});

const showNewCategory = ref(false);

const isSearching = ref(false);

const discoverFeed = () => {
    isSearching.value = true;
    searchForm.post(route('feeds.preview'), {
        preserveScroll: true,
        onFinish: () => {
            isSearching.value = false;
        },
    });
};

const subscribe = () => {
    if (props.preview) {
        subscribeForm.feed_url = props.preview.feed_url;
        if (!subscribeForm.title) {
            subscribeForm.title = props.preview.title;
        }
    }
    subscribeForm.post(route('feeds.store'));
};

const toggleNewCategory = () => {
    showNewCategory.value = !showNewCategory.value;
    if (showNewCategory.value) {
        subscribeForm.category_id = '';
    } else {
        subscribeForm.new_category = '';
    }
};
</script>

<template>
    <AppLayout>
        <template #title>Add Feed</template>

        <Head title="Add Feed" />

        <div class="mx-auto max-w-lg px-4 py-6">
            <!-- Step 1: Enter URL -->
            <div class="rounded-xl bg-slate-50 dark:bg-slate-900 p-5">
                <h2 class="text-base font-medium text-slate-800 dark:text-slate-200 mb-4">Feed URL</h2>

                <form @submit.prevent="discoverFeed">
                    <div>
                        <TextInput
                            id="url"
                            type="url"
                            class="block w-full text-base"
                            v-model="searchForm.url"
                            placeholder="https://example.com or feed URL"
                            required
                            autofocus
                        />
                        <p class="mt-1.5 text-xs text-slate-600 dark:text-slate-500">
                            Enter a website URL or direct RSS/Atom feed URL
                        </p>
                        <InputError class="mt-2" :message="searchForm.errors.url" />
                    </div>

                    <PrimaryButton
                        class="mt-4 w-full"
                        :class="{ 'opacity-25': isSearching }"
                        :disabled="isSearching"
                    >
                        <svg v-if="isSearching" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ isSearching ? 'Searching...' : 'Find Feed' }}
                    </PrimaryButton>
                </form>
            </div>

            <!-- Step 2: Preview & Subscribe -->
            <div v-if="preview" class="mt-5 rounded-xl bg-slate-50 dark:bg-slate-900 p-5">
                <div class="flex items-start gap-3 mb-4">
                    <img
                        v-if="preview.favicon_url"
                        :src="preview.favicon_url"
                        class="mt-0.5 h-6 w-6 rounded"
                        @error="$event.target.style.display = 'none'"
                    />
                    <div class="min-w-0 flex-1">
                        <h3 class="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
                            {{ preview.title || 'Untitled Feed' }}
                        </h3>
                        <p v-if="preview.description" class="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {{ preview.description }}
                        </p>
                        <p class="mt-1 text-xs text-slate-600 dark:text-slate-500">
                            {{ preview.article_count }} articles found
                        </p>
                    </div>
                </div>

                <form @submit.prevent="subscribe">
                    <!-- Custom title -->
                    <div class="mb-4">
                        <InputLabel for="title" value="Title (optional)" />
                        <TextInput
                            id="title"
                            type="text"
                            class="mt-1 block w-full text-base"
                            v-model="subscribeForm.title"
                            :placeholder="preview.title || 'Feed title'"
                        />
                    </div>

                    <!-- Category selection -->
                    <div class="mb-4">
                        <InputLabel for="category" value="Category (optional)" />

                        <div v-if="!showNewCategory">
                            <select
                                id="category"
                                v-model="subscribeForm.category_id"
                                class="mt-1 block w-full rounded-lg border-slate-300 bg-white text-base text-slate-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                            >
                                <option value="">No category</option>
                                <option
                                    v-for="category in categories"
                                    :key="category.id"
                                    :value="category.id"
                                >
                                    {{ category.name }}
                                </option>
                            </select>
                        </div>

                        <div v-else>
                            <TextInput
                                id="new_category"
                                type="text"
                                class="mt-1 block w-full text-base"
                                v-model="subscribeForm.new_category"
                                placeholder="New category name"
                            />
                        </div>

                        <button
                            type="button"
                            @click="toggleNewCategory"
                            class="mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                            {{ showNewCategory ? 'Choose existing category' : '+ Create new category' }}
                        </button>

                        <InputError class="mt-2" :message="subscribeForm.errors.category_id" />
                        <InputError class="mt-2" :message="subscribeForm.errors.new_category" />
                    </div>

                    <InputError class="mb-3" :message="subscribeForm.errors.feed_url" />

                    <PrimaryButton
                        class="w-full"
                        :class="{ 'opacity-25': subscribeForm.processing }"
                        :disabled="subscribeForm.processing"
                    >
                        <svg v-if="subscribeForm.processing" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {{ subscribeForm.processing ? 'Subscribing...' : 'Subscribe' }}
                    </PrimaryButton>
                </form>
            </div>
        </div>
    </AppLayout>
</template>
