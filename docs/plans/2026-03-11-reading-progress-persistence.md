# Reading Progress Persistence for Read Later Articles

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist reading progress (0–100%) for read-later articles so position is restored when reopening, across sessions and devices.

**Architecture:** Add `reading_progress` tinyint column to `user_articles` pivot. Save progress on scroll (debounced, only for read-later articles) via existing `PATCH /api/articles/{id}`. Restore by converting percentage back to scroll offset after content renders. Both mobile (`ArticleDetailView`) and desktop inline (`ArticleListView`) are supported.

**Tech Stack:** Laravel (migration, controller, resource), Vue 3 (scroll handler, restore logic), existing Pinia store

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `database/migrations/2026_03_11_000000_add_reading_progress_to_user_articles.php` | Create | Migration: add `reading_progress` tinyint column |
| `app/Models/Article.php` | Modify | Add `reading_progress` to pivot fields |
| `app/Http/Controllers/Api/ArticleApiController.php` | Modify | Accept `reading_progress` in update validation |
| `app/Http/Resources/ArticleResource.php` | Modify | Include `reading_progress` in response |
| `resources/js/Stores/useArticleStore.js` | Modify | Add `saveReadingProgress` action, pass progress in `toggleReadLater` |
| `resources/js/Views/ArticleDetailView.vue` | Modify | Compute and save progress on scroll, restore on load |
| `resources/js/Views/ArticleListView.vue` | Modify | Same for desktop inline reader |

---

### Task 1: Database Migration

**Files:**
- Create: `database/migrations/2026_03_11_000000_add_reading_progress_to_user_articles.php`

- [ ] **Step 1: Create migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_articles', function (Blueprint $table) {
            $table->tinyInteger('reading_progress')->unsigned()->nullable()->after('is_read_later');
        });
    }

    public function down(): void
    {
        Schema::table('user_articles', function (Blueprint $table) {
            $table->dropColumn('reading_progress');
        });
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate`

- [ ] **Step 3: Commit**

```
git add database/migrations/2026_03_11_000000_add_reading_progress_to_user_articles.php
git commit -m "Add reading_progress column to user_articles"
```

---

### Task 2: Backend — Model, Controller, Resource

**Files:**
- Modify: `app/Models/Article.php:43` — add `reading_progress` to `withPivot`
- Modify: `app/Http/Controllers/Api/ArticleApiController.php:117-137` — accept `reading_progress` in update
- Modify: `app/Http/Resources/ArticleResource.php:20-44` — include `reading_progress` in response

- [ ] **Step 1: Update Article model pivot fields**

In `Article::users()`, add `reading_progress` to the `withPivot` call:

```php
return $this->belongsToMany(User::class, 'user_articles')
    ->withPivot('is_read_later', 'read_at', 'reading_progress')
    ->withTimestamps();
```

- [ ] **Step 2: Update ArticleApiController::update validation and pivot**

Add `reading_progress` to the validation rules and pivot array:

```php
$data = $request->validate([
    'is_read' => 'sometimes|boolean',
    'is_read_later' => 'sometimes|boolean',
    'reading_progress' => 'sometimes|integer|min:0|max:100',
]);

// ... existing pivot logic ...

if (array_key_exists('reading_progress', $data)) {
    $pivot['reading_progress'] = $data['reading_progress'];
}
```

- [ ] **Step 3: Update ArticleResource::toArray**

Add `reading_progress` to the base data array (not detail-only — needed in list for read-later view):

```php
'reading_progress' => $article->reading_progress ?? null,
```

- [ ] **Step 4: Update scopeWithUserState select**

Check if `scopeWithUserState` selects specific columns. If it uses `leftJoin` without explicit selects, `reading_progress` will be available automatically via the join. Verify this is the case (it is — the scope just does a `leftJoin` without column restrictions).

- [ ] **Step 5: Commit**

```
git add app/Models/Article.php app/Http/Controllers/Api/ArticleApiController.php app/Http/Resources/ArticleResource.php
git commit -m "Accept and return reading_progress in article API"
```

---

### Task 3: Frontend Store — saveReadingProgress action

**Files:**
- Modify: `resources/js/Stores/useArticleStore.js`

- [ ] **Step 1: Add saveReadingProgress action**

Add a new action that debounces the API call. This is separate from the scroll debounce — the store action itself doesn't debounce, it just fires the PATCH. The caller (view component) is responsible for debouncing.

```js
function saveReadingProgress(id, progress) {
    const article = articles.value.find(a => a.id === id)
    if (article) article.reading_progress = progress
    axios.patch(`/api/articles/${id}`, { reading_progress: progress }).catch(() => {})
}
```

- [ ] **Step 2: Update toggleReadLater to capture current progress**

Modify `toggleReadLater` to accept an optional `currentProgress` parameter. When marking as read-later, save the current progress. When unmarking, don't clear it (the value is irrelevant if not read-later).

```js
function toggleReadLater(id, currentProgress = null) {
    const article = articles.value.find(a => a.id === id)
    if (!article) return
    const was = article.is_read_later
    article.is_read_later = !was
    const sidebar = useSidebarStore()
    sidebar.adjustReadLaterCount(was ? -1 : 1)

    const payload = { is_read_later: !was }
    // Capture scroll position when saving to read later
    if (!was && currentProgress !== null) {
        payload.reading_progress = currentProgress
        article.reading_progress = currentProgress
    }

    axios.patch(`/api/articles/${id}`, payload).catch(() => {
        article.is_read_later = was
        sidebar.adjustReadLaterCount(was ? 1 : -1)
    })
}
```

- [ ] **Step 3: Export saveReadingProgress in the return block**

Add `saveReadingProgress` to the store's return object.

- [ ] **Step 4: Commit**

```
git add resources/js/Stores/useArticleStore.js
git commit -m "Add reading progress tracking to article store"
```

---

### Task 4: Mobile — ArticleDetailView scroll progress

**Files:**
- Modify: `resources/js/Views/ArticleDetailView.vue`

- [ ] **Step 1: Add progress computation helper**

Add a function to compute reading progress as 0–100 integer:

```js
function computeReadingProgress() {
    let scrollTop, scrollHeight, clientHeight
    if (isMobile.value && scrollContainer.value) {
        scrollTop = scrollContainer.value.scrollTop
        scrollHeight = scrollContainer.value.scrollHeight
        clientHeight = scrollContainer.value.clientHeight
    } else {
        scrollTop = window.scrollY
        scrollHeight = document.documentElement.scrollHeight
        clientHeight = window.innerHeight
    }
    const maxScroll = scrollHeight - clientHeight
    if (maxScroll <= 0) return 0
    return Math.min(100, Math.round((scrollTop / maxScroll) * 100))
}
```

- [ ] **Step 2: Modify onArticleScroll to save reading progress**

Update the debounced scroll handler to also save reading progress for read-later articles:

```js
function onArticleScroll() {
    if (!article.value) return
    clearTimeout(scrollSaveTimer)
    scrollSaveTimer = setTimeout(() => {
        const top =
            isMobile.value && scrollContainer.value
                ? scrollContainer.value.scrollTop
                : window.scrollY
        saveReadingState(`/articles/${article.value.id}`, top)

        if (isReadLater.value) {
            articleStore.saveReadingProgress(article.value.id, computeReadingProgress())
        }
    }, 500)
}
```

- [ ] **Step 3: Restore reading progress on article load**

In `loadArticle()`, after content renders, if the article is read-later and has `reading_progress`, scroll to that position instead of (or in addition to) the existing `savedScrollTop` logic:

After the `const content = await articleStore.fetchContent(numId)` block, replace the scroll restoration section:

```js
// Restore reading progress for read-later articles
const progress = content.reading_progress
if (content.is_read_later && progress && progress > 0 && !savedScrollTop) {
    await nextTick()
    setTimeout(() => {
        if (isMobile.value && scrollContainer.value) {
            const maxScroll = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight
            scrollContainer.value.scrollTop = Math.round((progress / 100) * maxScroll)
        } else {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            window.scrollTo(0, Math.round((progress / 100) * maxScroll))
        }
    }, 100)
} else if (savedScrollTop) {
    // Existing pixel-based restore for app-restart scenario
    await nextTick()
    setTimeout(() => {
        if (isMobile.value && scrollContainer.value) {
            scrollContainer.value.scrollTop = savedScrollTop
        } else {
            window.scrollTo(0, savedScrollTop)
        }
    }, 100)
}
```

The `savedScrollTop` (from localStorage reading-state) takes precedence because it's a same-session pixel-exact restore. `reading_progress` is the cross-session percentage fallback.

- [ ] **Step 4: Pass current progress when toggling read-later**

Update `toggleReadLater()` to pass current scroll progress:

```js
function toggleReadLater() {
    if (!article.value) return
    const progress = computeReadingProgress()
    articleStore.toggleReadLater(article.value.id, progress)
    isReadLater.value = !isReadLater.value
    success(isReadLater.value ? 'Article saved' : 'Removed from Read Later')
}
```

- [ ] **Step 5: Commit**

```
git add resources/js/Views/ArticleDetailView.vue
git commit -m "Save and restore reading progress in mobile article view"
```

---

### Task 5: Desktop — ArticleListView inline reader progress

**Files:**
- Modify: `resources/js/Views/ArticleListView.vue`

- [ ] **Step 1: Add progress computation for desktop inline**

The desktop inline reader uses `articleListEl` as its scroll container. Add a progress computation helper:

```js
function computeInlineReadingProgress() {
    const el = articleListEl.value
    if (!el) return 0
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return 0
    return Math.min(100, Math.round((el.scrollTop / maxScroll) * 100))
}
```

- [ ] **Step 2: Modify onDesktopScroll to save reading progress**

Update the existing debounced scroll handler:

```js
function onDesktopScroll() {
    if (!selectedArticleId.value) return
    clearTimeout(scrollSaveTimer)
    scrollSaveTimer = setTimeout(() => {
        const top = articleListEl.value?.scrollTop ?? 0
        saveReadingState(selectedArticleId.value, top)

        if (selectedIsReadLater.value) {
            articleStore.saveReadingProgress(selectedArticleId.value, computeInlineReadingProgress())
        }
    }, 500)
}
```

- [ ] **Step 3: Restore reading progress on inline article load**

In `loadArticleInline()`, after content loads and `scrollExpandedIntoView()` fires, check for reading progress. Modify the function to restore progress for read-later articles:

After the article is loaded (both cached and network paths), add progress restoration:

```js
// After scrollExpandedIntoView(articleId), add:
const progress = content.reading_progress ?? selectedArticle.value?.reading_progress
if ((content.is_read_later || selectedIsReadLater.value) && progress && progress > 0) {
    // Allow scrollExpandedIntoView to complete, then adjust for progress
    setTimeout(() => {
        const el = articleListEl.value
        if (!el) return
        const maxScroll = el.scrollHeight - el.clientHeight
        el.scrollTop = Math.round((progress / 100) * maxScroll)
    }, 300)
}
```

- [ ] **Step 4: Pass current progress when toggling read-later inline**

Update `toggleReadLaterInline()`:

```js
function toggleReadLaterInline() {
    if (!selectedArticle.value) return
    const progress = computeInlineReadingProgress()
    articleStore.toggleReadLater(selectedArticle.value.id, progress)
    selectedIsReadLater.value = !selectedIsReadLater.value
    success(selectedIsReadLater.value ? 'Article saved' : 'Removed from Read Later')
}
```

- [ ] **Step 5: Commit**

```
git add resources/js/Views/ArticleListView.vue
git commit -m "Save and restore reading progress in desktop inline reader"
```

---

### Task 6: Format and Build Verification

- [ ] **Step 1: Format PHP**

Run: `./vendor/bin/pint`

- [ ] **Step 2: Format JS/Vue**

Run: `prettier --write resources/js/Views/ArticleDetailView.vue resources/js/Views/ArticleListView.vue resources/js/Stores/useArticleStore.js`

- [ ] **Step 3: Build**

Run: `yarn build`
Expected: Clean build, no errors.

- [ ] **Step 4: Commit any formatting changes**

```
git add -A
git commit -m "Format code"
```

---

## Footnote: Semantic Anchors (Future Enhancement)

Percentage-based scroll restoration can be imprecise if images load late or viewport size changes significantly between save and restore. A more robust approach would be to identify the nearest DOM element in the viewport (e.g., a heading or paragraph) and store a CSS selector or text fingerprint alongside the percentage. On restore, find that element and `scrollIntoView()`.

This adds meaningful complexity (DOM traversal on scroll, selector generation, fuzzy matching on restore) and is deferred unless percentage-based restore proves insufficient in practice. Article content rarely changes, and "close enough" positioning is acceptable for the initial implementation.
