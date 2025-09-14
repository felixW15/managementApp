import { useState } from "react";
import type { Media, MediaBase } from "@api/media";
import { updateMedia } from "@api/media";
import { CustomNumberInput } from "../numberInput";
import { StarRating } from "../starRating";

interface Tag {
  id: number;
  name: string;
}

interface MediaEditFormProps {
  media: Media;
  token: string;
  onSave: (updatedMedia: Media) => void;
  onCancel: () => void;
  availableTags?: Tag[]; // Optional: for tag autocomplete/suggestions
}

export function MediaEditForm({
  media,
  token,
  onSave,
  onCancel,
  availableTags = [],
}: MediaEditFormProps) {
  const [editData, setEditData] = useState<MediaBase>({
    name: media.name,
    category: media.category,
    status: media.status,
    progress: media.progress,
    rating: media.rating,
    tags: [...media.tags], // Create a copy of tags array
  });

  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedMedia = await updateMedia(media.id, editData, token);
      onSave(updatedMedia);
    } catch (err) {
      console.error("Failed to edit media:", err);
      alert("Failed to update: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    // Check if tag already exists
    if (
      editData.tags.some(
        (tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert("Tag already exists");
      return;
    }

    // Create new tag with temporary ID (backend will assign real ID)
    const newTag: Tag = {
      id: Date.now(), // Temporary ID
      name: trimmedName,
    };

    setEditData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setNewTagName("");
  };

  const removeTag = (tagId: number) => {
    setEditData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.id !== tagId),
    }));
  };

  const addExistingTag = (tag: Tag) => {
    // Check if tag already exists
    if (editData.tags.some((existingTag) => existingTag.id === tag.id)) {
      return;
    }

    setEditData((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Name
        </label>
        <input
          value={editData.name}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          disabled={isLoading}
        />
      </div>

      {/* Main Fields Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Category
          </label>
          <select
            value={editData.category}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                category: e.target.value as Media["category"],
              }))
            }
            className="border border-gray-300 dark:border-gray-700 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          >
            <option value="book">Book</option>
            <option value="manga">Manga</option>
            <option value="anime">Anime</option>
            <option value="visual novel">Visual Novel</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Status
          </label>
          <select
            value={editData.status}
            onChange={(e) =>
              setEditData((prev) => ({
                ...prev,
                status: e.target.value as Media["status"],
              }))
            }
            className="border border-gray-300 dark:border-gray-700 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          >
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>

        {/* Progress */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Progress
          </label>
          <CustomNumberInput
            value={editData.progress}
            onChange={(newVal) =>
              setEditData((prev) => ({ ...prev, progress: newVal }))
            }
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Rating
          </label>
          <StarRating
            value={editData.rating}
            onChange={(newVal) =>
              setEditData((prev) => ({ ...prev, rating: newVal }))
            }
            disabled={isLoading}
            size="md"
            showValue={true}
          />
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Tags
        </label>

        {/* Current Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {editData.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                disabled={isLoading}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Add New Tag */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new tag..."
            className="flex-1 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || !newTagName.trim()}
          >
            Add
          </button>
        </div>

        {/* Available Tags (if provided) */}
        {availableTags.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Available tags (click to add):
            </span>
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter(
                  (tag) =>
                    !editData.tags.some(
                      (existingTag) => existingTag.id === tag.id
                    )
                )
                .slice(0, 10) // Limit displayed tags
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addExistingTag(tag)}
                    className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
