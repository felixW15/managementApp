// src/api/media.ts
import { apiFetch } from "./client";
import { getGlobalOnUnauthorized } from "./authHandler";

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


export async function getMedia(token: string): Promise<Media[]> {
  return apiFetch<Media[]>("/media/", { onUnauthorized: getGlobalOnUnauthorized() }, token);
}

export async function addMedia(media: MediaBase, token: string): Promise<Media> {
  return apiFetch<Media>(
    "/media/",
    {
      method: "POST",
      body: JSON.stringify(media),
      onUnauthorized: getGlobalOnUnauthorized(),
    },
    token
  );
}

export async function deleteMedia(id: number, token: string): Promise<void> {
  await apiFetch(`/media/${id}`, {
    method: "DELETE",
    onUnauthorized: getGlobalOnUnauthorized(),
  }, token);
}

export async function updateMedia(
  id: number,
  data: Partial<Omit<MediaBase, "user_id">>,
  token: string
): Promise<Media> {
  return apiFetch<Media>(
    `/media/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      onUnauthorized: getGlobalOnUnauthorized(),
    },
    token
  );
}