// src/components/MediaManager.tsx
import { useEffect, useState } from "react";
import { getMedia, addMedia, deleteMedia, updateMedia } from "../api/media";
import type{ Media, MediaBase } from "../api/media";
import { CustomNumberInput } from "./numberInput";

interface MediaComponentProps {
  token: string;
}

export function MediaComponent({ token }: MediaComponentProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [formData, setFormData] = useState<MediaBase>({
    name: "",
    category: "book",
    status: "in progress",
    progress: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempEditData, setTempEditData] = useState<Record<number, MediaBase>>({});
  const [categoryFilter, setCategoryFilter] = useState<"all" | Media["category"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Media["status"]>("in progress");
  const [sortOption, setSortOption] = useState<"alphabetical" | "lastEdited" | "progress">("lastEdited");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categoryColors: Record<Media["category"], string> = {
    book: "bg-yellow-100 text-yellow-800 border-yellow-300",
    manga: "bg-pink-100 text-pink-800 border-pink-300",
    anime: "bg-blue-100 text-blue-800 border-blue-300",
    "visual novel": "bg-purple-100 text-purple-800 border-purple-300",
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const data = await getMedia(token);
      setMediaList(data);
    } catch (err) {
      console.error("Failed to load media:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newItem = await addMedia(formData, token);
      setMediaList((prev) => [...prev, newItem]);
      setFormData({
        name: "",
        category: "book",
        status: "in progress",
        progress: 0,
      });
    } catch (err) {
      console.error("Failed to add media:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedia(id, token);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete media:", err);
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
      [field]: value, // overwrite the updated field
    };

    await updateMedia(id, updated, token!);
    const updatedList = mediaList.map((m) =>
      m.id === id ? { ...m, ...updated } : m
    );
    setMediaList(updatedList);
  } catch (error) {
    console.error("Failed to update:", error);
    alert("Failed to update: " + error);
  }
};

  const handleEditSubmit = async (id: number, edited: MediaBase) => {
    try {
      const updated = await updateMedia(id, edited, token);
      setMediaList((prev) =>
        prev.map((m) => (m.id === id ? { ...updated } : m))
      );
      setEditingId(null);
    } catch (err) {
      console.error("Failed to edit media:", err);
    }
  };

const filteredMediaList = mediaList
  .filter((media) => {
    const categoryMatch = categoryFilter === "all" || media.category === categoryFilter;
    const statusMatch = statusFilter === "all" || media.status === statusFilter;
    const nameMatch = media.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && nameMatch;
  })
  .sort((a, b) => {
    switch (sortOption) {
      case "alphabetical":
        return a.name.localeCompare(b.name);
      case "lastEdited":
        return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime();
      case "progress":
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

 return (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Media Manager</h2>

    <div className="mb-4">
      <button
        onClick={() => setShowAddForm((prev) => !prev)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        {showAddForm ? "Hide Add Form" : "➕ Add New Media"}
      </button>
    </div>

    <div
      className={`transition-all overflow-hidden duration-300 ease-in-out ${
        showAddForm ? "max-h-[1000px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
      }`}
    >
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Media
        </button>
      </form>
    </div>

    <div className="flex gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Category
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
          className="border border-gray-300 dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All</option>
          <option value="book">Book</option>
          <option value="manga">Manga</option>
          <option value="anime">Anime</option>
          <option value="visual novel">Visual Novel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-gray-300 dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Sort By
        </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
          className="border border-gray-300 dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="lastEdited">Last Edited</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="progress">Progress</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full border border-gray-300 dark:border-gray-700 p-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>

    <ul className="space-y-2">
      {filteredMediaList.map((media) => {
        const isEditing = editingId === media.id;
        const temp = tempEditData[media.id];

        return (
          <li
            key={media.id}
            className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-sm px-4 py-3 text-sm text-gray-800 dark:text-gray-100 space-y-2"
          >
            {/* Header with name and actions */}
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-1">
              <strong className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {media.name}
              </strong>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => {
                    setEditingId(media.id);
                    setTempEditData((prev) => ({
                      ...prev,
                      [media.id]: {
                        name: media.name,
                        category: media.category,
                        status: media.status,
                        progress: media.progress,
                      },
                    }));
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(media.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Media properties */}
            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={temp.name}
                  onChange={(e) =>
                    setTempEditData((prev) => ({
                      ...prev,
                      [media.id]: { ...prev[media.id], name: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                    <select
                      value={temp.category}
                      onChange={(e) =>
                        setTempEditData((prev) => ({
                          ...prev,
                          [media.id]: { ...prev[media.id], category: e.target.value as Media["category"] },
                        }))
                      }
                      className="border border-gray-300 dark:border-gray-700 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="book">Book</option>
                      <option value="manga">Manga</option>
                      <option value="anime">Anime</option>
                      <option value="visual novel">Visual Novel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <select
                      value={temp.status}
                      onChange={(e) =>
                        setTempEditData((prev) => ({
                          ...prev,
                          [media.id]: { ...prev[media.id], status: e.target.value as Media["status"] },
                        }))
                      }
                      className="border border-gray-300 dark:border-gray-700 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Progress</label>
                    <CustomNumberInput
                      value={temp.progress}
                      onChange={(newVal) =>
                        setTempEditData((prev) => ({
                          ...prev,
                          [media.id]: { ...prev[media.id], progress: newVal },
                        }))
                      }
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditSubmit(media.id, temp)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setTempEditData((prev) => {
                        const newData = { ...prev };
                        delete newData[media.id];
                        return newData;
                      });
                    }}
                    className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-gray-500 dark:text-gray-400 font-medium">Category</span>
                <span
                  className={`inline-block px-2 py-1 text-sm font-semibold border rounded ${categoryColors[media.category]}`}
                >
                  {media.category}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 font-medium">Status</span>
                <select
                  value={media.status}
                  onChange={(e) =>
                    handleInlineUpdate(media.id, "status", e.target.value as Media["status"])
                  }
                  className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 font-medium">Progress</span>
                <CustomNumberInput
                  value={media.progress}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(newVal) => handleInlineUpdate(media.id, "progress", newVal)}
                />
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 font-medium">Last Edited</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(media.last_edited).toLocaleDateString()}
                </span>
              </div>
            </div>
            )}
          </li>
        );
      })}
    </ul>
  </div>
);
}