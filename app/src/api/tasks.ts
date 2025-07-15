// src/api/tasks.ts
import { apiFetch } from "./client";

export type Task = {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  user_id: number;
};

let onUnauthorizedCallback: () => void = () => {};

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

export async function getTasks(token: string): Promise<Task[]> {
  return apiFetch<Task[]>("/tasks/", { onUnauthorized: onUnauthorizedCallback }, token);
}

export async function addTask(title: string, token: string): Promise<Task> {
  return apiFetch<Task>(
    "/tasks/",
    {
      method: "POST",
      body: JSON.stringify({ title }),
      onUnauthorized: onUnauthorizedCallback,
    },
    token
  );
}

export async function deleteTask(id: number, token: string): Promise<void> {
  await apiFetch(`/tasks/${id}`, { method: "DELETE", onUnauthorized: onUnauthorizedCallback }, token);
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
      onUnauthorized: onUnauthorizedCallback,
    },
    token
  );
}
