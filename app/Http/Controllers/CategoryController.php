<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $maxOrder = $request->user()->categories()->max('sort_order') ?? 0;

        $request->user()->categories()->create([
            'name' => $validated['name'],
            'sort_order' => $maxOrder + 1,
        ]);

        return back();
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $category->update(['name' => $validated['name']]);

        return back();
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(404);
        }

        $targetCategoryId = $request->input('move_to_category_id');

        // Move feeds to target category (or uncategorize if null)
        $category->feeds()->update(['category_id' => $targetCategoryId]);

        $category->delete();

        return back();
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:categories,id'],
        ]);

        $user = $request->user();
        $userCategoryIds = $user->categories()->pluck('id')->toArray();

        foreach ($validated['order'] as $index => $categoryId) {
            if (in_array($categoryId, $userCategoryIds)) {
                Category::where('id', $categoryId)->update(['sort_order' => $index]);
            }
        }

        return back();
    }
}
