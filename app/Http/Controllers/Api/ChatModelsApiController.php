<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Chat\ChatProviders;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ChatModelsApiController extends Controller
{
    public function index(Request $request, ChatProviders $providers): JsonResponse
    {
        $listed = [];

        foreach ($providers->configured() as $name) {
            $listed[$name] = ['models' => $providers->modelsFor($name)];
        }

        return response()->json([
            'enabled' => $providers->enabled(),
            'providers' => $listed,
        ]);
    }
}
