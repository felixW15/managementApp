// src/api/tasks.ts
import { apiFetch } from "./client";

export interface Task {
  id: number;
  title: string;
  owner_id: number;
}

export async function getTasks(token: string): Promise<Task[]> {
  return apiFetch<Task[]>("/tasks/", {}, token);
}

export async function addTask(title: string, token: string): Promise<Task> {
  return apiFetch<Task>(
    "/tasks/",
    {
      method: "POST",
      body: JSON.stringify({ title }),
    },
    token
  );
}
