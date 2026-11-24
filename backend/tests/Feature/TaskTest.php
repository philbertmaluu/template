<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_only_sees_own_tasks(): void
    {
        $user = User::factory()->create();
        Task::factory(3)->for($user)->create();
        Task::factory(2)->create();

        Sanctum::actingAs($user);

        $this->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_user_can_create_task(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/tasks', ['title' => 'Write tests'])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Write tests')
            ->assertJsonPath('data.completed', false);
    }

    public function test_task_requires_title(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/tasks', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_user_can_update_and_delete_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['completed' => false]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/tasks/{$task->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonPath('data.completed', true);

        $this->deleteJson("/api/tasks/{$task->id}")->assertNoContent();

        $this->assertModelMissing($task);
    }

    public function test_user_cannot_access_another_users_task(): void
    {
        $task = Task::factory()->create();

        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/tasks/{$task->id}")->assertForbidden();
        $this->patchJson("/api/tasks/{$task->id}", ['title' => 'Hacked'])->assertForbidden();
        $this->deleteJson("/api/tasks/{$task->id}")->assertForbidden();
    }
}
