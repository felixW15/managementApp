import { useState } from "react";
import { CustomNumberInput } from "../numberInput";
import type { MediaBase } from "@api/media";
import { StarRating } from "../starRating";

interface AddMediaFormProps {
  onSubmit: (data: MediaBase) => void;
}

export function AddMediaForm({ onSubmit }: AddMediaFormProps) {
  const [formData, setFormData] = useState<MediaBase>({
    name: "",
    category: "book",
    status: "in progress",
    progress: 0,
    rating: 0,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "progress" || name === "rating" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTagName = tagInput.trim();

      if (
        newTagName &&
        !formData.tags.some(
          (t) => t.name.toLowerCase() === newTagName.toLowerCase()
        )
      ) {
        const newTag = {
          id: Date.now(), // temporary unique ID until backend assigns one
          name: newTagName,
        };

        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }

      setTagInput("");
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t.id !== tagId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      category: "book",
      status: "in progress",
      progress: 0,
      rating: 0,
      tags: [],
    });
    setTagInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      />

      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="book">Book</option>
        <option value="manga">Manga</option>
        <option value="anime">Anime</option>
        <option value="visual novel">Visual Novel</option>
      </select>

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="in progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Progress
        </label>
        <CustomNumberInput
          value={formData.progress}
          min={0}
          max={100}
          step={1}
          onChange={(newValue) =>
            setFormData((prev) => ({ ...prev, progress: newValue }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Rating
        </label>
        <StarRating
          value={formData.rating}
          onChange={(newValue) =>
            setFormData((prev) => ({ ...prev, rating: newValue }))
          }
          size="md"
          showValue={true}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type and press Enter..."
          className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Media
      </button>
    </form>
  );
}
