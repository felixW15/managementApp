import { useEffect, useState } from "react";
import type { Media, MediaBase } from "@api/media.ts";
import { getMedia, addMedia } from "@api/media.ts";
import { AddMediaForm } from "./AddMediaForm";
import { MediaFilters } from "./MediaFilters";
import { MediaList } from "./MediaList";

interface MediaManagerProps {
  token: string;
}

export function MediaManager({ token }: MediaManagerProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | Media["category"]
  >("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Media["status"]>(
    "all"
  );
  const [sortOption, setSortOption] = useState<
    "alphabetical" | "lastEdited" | "progress"
  >("lastEdited");
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
      console.log(data);
      setMediaList(data);
    } catch (err) {
      console.error("Failed to load media:", err);
    }
  };

  const handleAddMedia = async (newMedia: MediaBase) => {
    try {
      const created = await addMedia(newMedia, token);
      console.log(created);
      setMediaList((prev) => [...prev, created]);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add media:", err);
    }
  };

  const filteredMediaList = mediaList
    .filter((media) => {
      const categoryMatch =
        categoryFilter === "all" || media.category === categoryFilter;
      const statusMatch =
        statusFilter === "all" || media.status === statusFilter;
      const nameMatch = media.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return categoryMatch && statusMatch && nameMatch;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "lastEdited":
          return (
            new Date(b.last_edited).getTime() -
            new Date(a.last_edited).getTime()
          );
        case "progress":
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        📚 Media Manager
      </h2>

      {/* Add Media Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showAddForm ? "Hide Add Form" : "➕ Add New Media"}
        </button>
      </div>

      {/* Add Media Form */}
      {showAddForm && (
        <div className="mb-6">
          <AddMediaForm onSubmit={handleAddMedia} />
        </div>
      )}

      {/* Filters */}
      <MediaFilters
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Media List */}
      <MediaList
        mediaList={filteredMediaList}
        setMediaList={setMediaList}
        token={token}
        categoryColors={categoryColors}
      />
    </div>
  );
}
