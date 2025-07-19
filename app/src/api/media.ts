// src/api/media.ts
import { apiFetch } from "./client";

export type Media = {
  id: number;
  name: string;
  category: "book" | "manga" | "anime" | "visual novel";
  status: "in progress" | "completed" | "dropped";
  progress: number;
  last_edited: string;
  user_id: number;
};

export type MediaBase = Omit<Media, "id" | "last_edited" | "user_id">;

let onUnauthorizedCallback: () => void = () => {};

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

export async function getMedia(token: string): Promise<Media[]> {
  return apiFetch<Media[]>("/media/", { onUnauthorized: onUnauthorizedCallback }, token);
}

export async function addMedia(media: MediaBase, token: string): Promise<Media> {
  return apiFetch<Media>(
    "/media/",
    {
      method: "POST",
      body: JSON.stringify(media),
      onUnauthorized: onUnauthorizedCallback,
    },
    token
  );
}

export async function deleteMedia(id: number, token: string): Promise<void> {
  await apiFetch(`/media/${id}`, {
    method: "DELETE",
    onUnauthorized: onUnauthorizedCallback,
  }, token);
}
