// src/api/tasks.ts
import { apiFetch } from "./client";
import { getGlobalOnUnauthorized } from "./authHandler";

export type Task = {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  user_id: number;
};


export async function validateToken(token: string): Promise<boolean> {
  try {
    await apiFetch("/me", { onUnauthorized: getGlobalOnUnauthorized() }, token);
    return true;
  } catch (err) {
    return false;
  }
}

export async function getTasks(token: string): Promise<Task[]> {
  return apiFetch<Task[]>("/tasks/", { onUnauthorized: getGlobalOnUnauthorized() }, token);
}

export async function addTask(title: string, token: string): Promise<Task> {
  return apiFetch<Task>(
    "/tasks/",
    {
      method: "POST",
      body: JSON.stringify({ title }),
      onUnauthorized: getGlobalOnUnauthorized(),
    },
    token
  );
}

export async function deleteTask(id: number, token: string): Promise<void> {
  await apiFetch(`/tasks/${id}`, { method: "DELETE", onUnauthorized: getGlobalOnUnauthorized() }, token);
}

export async function updateTask(
  id: number,
  data: { title: string; description?: string },
  token: string
): Promise<Task> {
  return apiFetch<Task>(
    `/tasks/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      onUnauthorized: getGlobalOnUnauthorized(),
    },
    token
  );
}
