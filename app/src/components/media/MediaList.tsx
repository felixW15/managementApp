import { useState } from "react";
import type { Media, MediaBase } from "@api/media";
import { updateMedia, deleteMedia } from "@api/media";
import { CustomNumberInput } from "../numberInput";
import { MediaEditForm } from "./MediaEditForm";

interface Tag {
  id: number;
  name: string;
}

interface MediaListProps {
  mediaList: Media[];
  token: string;
  setMediaList: React.Dispatch<React.SetStateAction<Media[]>>;
  categoryColors: Record<Media["category"], string>;
  availableTags?: Tag[]; // Optional: for tag autocomplete/suggestions in edit form
}

export function MediaList({
  mediaList,
  token,
  setMediaList,
  categoryColors,
  availableTags = [],
}: MediaListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await deleteMedia(id, token);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Failed to delete: " + err);
    }
  };

  const handleInlineUpdate = async (
    id: number,
    field: keyof MediaBase,
    value: string | number
  ) => {
    try {
      const existing = mediaList.find((m) => m.id === id);
      if (!existing) return;

      const updated: MediaBase = {
        name: existing.name,
        category: existing.category,
        status: existing.status,
        progress: existing.progress,
        rating: existing.rating,
        tags: existing.tags,
        [field]: value,
      };

      await updateMedia(id, updated, token);
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
      );
    } catch (error) {
      console.error("Failed to update:", error);
      alert("Failed to update: " + error);
    }
  };

  const handleEditSave = (updatedMedia: Media) => {
    setMediaList((prev) =>
      prev.map((m) => (m.id === updatedMedia.id ? updatedMedia : m))
    );
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <ul className="space-y-2">
      {mediaList.map((media) => {
        const isEditing = editingId === media.id;

        return (
          <li
            key={media.id}
            className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm px-4 py-3 text-sm text-gray-800 dark:text-gray-100 space-y-2"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-1">
              <strong className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {media.name}
              </strong>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => setEditingId(media.id)}
                  className="text-blue-600 hover:underline"
                  disabled={isEditing}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(media.id)}
                  className="text-red-600 hover:underline"
                  disabled={isEditing}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Editing Form or Display */}
            {isEditing ? (
              <MediaEditForm
                media={media}
                token={token}
                onSave={handleEditSave}
                onCancel={handleEditCancel}
                availableTags={availableTags}
              />
            ) : (
              /* Display Media Info */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 font-medium">
                    Category
                  </span>
                  <span
                    className={`inline-block px-2 py-1 text-sm font-semibold border rounded ${
                      categoryColors[media.category]
                    }`}
                  >
                    {media.category}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 font-medium">
                    Status
                  </span>
                  <select
                    value={media.status}
                    onChange={(e) =>
                      handleInlineUpdate(
                        media.id,
                        "status",
                        e.target.value as Media["status"]
                      )
                    }
                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                  </select>
                </div>

                {/* Progress */}
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 font-medium">
                    Progress
                  </span>
                  <CustomNumberInput
                    value={media.progress}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(newVal) =>
                      handleInlineUpdate(media.id, "progress", newVal)
                    }
                  />
                </div>

                {/* Last Edited */}
                <div>
                  <span className="block text-gray-500 dark:text-gray-400 font-medium">
                    Last Edited
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(media.last_edited).toLocaleDateString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="col-span-2 flex items-center gap-1">
                  {Array.from({ length: 10 }, (_, i) => {
                    const starValue = (i + 1) * 2; // Full star threshold (2, 4, 6, 8, etc.)
                    const halfStarValue = starValue - 1; // Half star threshold (1, 3, 5, 7, etc.)

                    if (media.rating >= starValue) {
                      // Full star
                      return (
                        <span key={i} className="text-yellow-400">
                          ★
                        </span>
                      );
                    } else if (media.rating >= halfStarValue) {
                      // Half star - using Unicode half star or creating with CSS
                      return (
                        <span key={i} className="relative text-yellow-400">
                          <span className="absolute inset-0 overflow-hidden w-1/2">
                            ★
                          </span>
                          <span className="opacity-30">★</span>
                        </span>
                      );
                    } else {
                      // Empty star
                      return (
                        <span key={i} className="text-yellow-400 opacity-30">
                          ★
                        </span>
                      );
                    }
                  })}
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {(media.rating / 2).toFixed(1)}/10
                  </span>
                </div>

                {/* Tags */}
                {media.tags.length > 0 && (
                  <div className="col-span-2 flex flex-wrap gap-2 mt-1">
                    {media.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
