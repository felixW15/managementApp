// src/api/media.ts
import { apiFetch } from "./client";
import { getGlobalOnUnauthorized } from "./authHandler";

export type Tag = {
  id: number;
  name: string;
};

export type Media = {
  id: number;
  name: string;
  category: "book" | "manga" | "anime" | "visual novel" | "movie";
  status: "in progress" | "completed" | "dropped" | "plan to watch";
  progress: number;
  total_episodes: number | null;
  rating: number; // stored as integer (0–20)
  tags: Tag[];
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
  data: MediaBase,
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

export async function importMediaCsv(file: File, token: string): Promise<{ imported: number }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ imported: number }>(
    "/media/import",
    {
      method: "POST",
      body: formData,
      onUnauthorized: getGlobalOnUnauthorized(),
    },
    token
  );
}
