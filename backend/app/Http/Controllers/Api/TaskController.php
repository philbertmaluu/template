<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function index(Request $request): LengthAwarePaginator
    {
        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        return $request->user()->tasks()->latest()->paginate($perPage);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $request->user()->tasks()->create($request->validated());

        return response()->json($task, Response::HTTP_CREATED);
    }

    public function show(Task $task): Task
    {
        Gate::authorize('view', $task);

        return $task;
    }

    public function update(UpdateTaskRequest $request, Task $task): Task
    {
        Gate::authorize('update', $task);

        $task->update($request->validated());

        return $task;
    }

    public function destroy(Task $task): Response
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return response()->noContent();
    }
}
