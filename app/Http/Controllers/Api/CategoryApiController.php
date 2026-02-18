<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class CategoryApiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $maxOrder = $request->user()->categories()->max('sort_order') ?? 0;

        $category = $request->user()->categories()->create([
            'name' => $validated['name'],
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['id' => $category->id, 'name' => $category->name], 201);
    }

    public function update(Request $request, Category $category): Response
    {
        if ($category->user_id !== $request->user()->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $category->update(['name' => $validated['name']]);

        return response()->noContent();
    }

    public function destroy(Request $request, Category $category): Response
    {
        if ($category->user_id !== $request->user()->id) {
            abort(404);
        }

        $targetCategoryId = $request->input('move_to_category_id');

        $category->feeds()->update(['category_id' => $targetCategoryId]);

        $category->delete();

        return response()->noContent();
    }

    public function reorder(Request $request): Response
    {
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'exists:categories,id'],
        ]);

        $user = $request->user();
        $userCategoryIds = $user->categories()->pluck('id')->toArray();

        foreach ($validated['order'] as $index => $categoryId) {
            if (in_array($categoryId, $userCategoryIds, strict: true)) {
                Category::where('id', $categoryId)->update(['sort_order' => $index]);
            }
        }

        return response()->noContent();
    }
}
