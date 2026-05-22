import { useEffect, useMemo, useRef, useState } from "react";
import type { Media, MediaBase } from "@api/media.ts";
import { getMedia, addMedia, importMediaCsv } from "@api/media.ts";
import { AddMediaForm } from "./AddMediaForm";
import { MediaFilters } from "./MediaFilters";
import { MediaList } from "./MediaList";

interface MediaManagerProps {
  token: string;
}

export function MediaManager({ token }: MediaManagerProps) {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<Media["category"][]>([]);
  const [statusFilter, setStatusFilter] = useState<Media["status"][]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"alphabetical" | "lastEdited" | "progress" | "rating">("lastEdited");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryColors: Record<Media["category"], string> = {
    book: "bg-yellow-100 text-yellow-800 border-yellow-300",
    manga: "bg-pink-100 text-pink-800 border-pink-300",
    anime: "bg-blue-100 text-blue-800 border-blue-300",
    movie: "bg-red-100 text-red-800 border-red-300",
    webtoon: "bg-teal-100 text-teal-800 border-teal-300",
    "visual novel": "bg-purple-100 text-purple-800 border-purple-300",
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importMediaCsv(file, token);
      alert(`Imported ${result.imported} entries.`);
      await fetchMedia();
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed. Check the console for details.");
    }
    e.target.value = "";
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

  const handleAddMedia = async (newMedia: MediaBase) => {
    try {
      const created = await addMedia(newMedia, token);
      setMediaList((prev) => [...prev, created]);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add media:", err);
    }
  };

  const availableTags = useMemo(() => {
    const seen = new Map<string, number>();
    mediaList.forEach((m) => m.tags.forEach((t) => seen.set(t.name, t.id)));
    return Array.from(seen.entries())
      .map(([name, id]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mediaList]);

  const filteredMediaList = useMemo(() => {
    return mediaList
      .filter((media) => {
        const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(media.category);
        const statusMatch = statusFilter.length === 0 || statusFilter.includes(media.status);
        const tagMatch = tagFilter.length === 0 || tagFilter.some((t) => media.tags.some((mt) => mt.name === t));
        const nameMatch = media.name.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && statusMatch && tagMatch && nameMatch;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "alphabetical": return a.name.localeCompare(b.name);
          case "lastEdited": return new Date(b.last_edited).getTime() - new Date(a.last_edited).getTime();
          case "progress": return b.progress - a.progress;
          case "rating": return b.rating - a.rating;
          default: return 0;
        }
      });
  }, [mediaList, categoryFilter, statusFilter, tagFilter, sortOption, searchQuery]);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Media Manager
      </h2>

      {/* Add Media / Import controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {showAddForm ? "Hide Add Form" : "Add New Media"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      {showAddForm && (
        <div className="mb-6">
          <AddMediaForm onSubmit={handleAddMedia} />
        </div>
      )}

      <MediaFilters
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        tagFilter={tagFilter}
        onTagChange={setTagFilter}
        availableTags={availableTags}
        sortOption={sortOption}
        onSortChange={setSortOption}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={mediaList.length}
        filteredCount={filteredMediaList.length}
      />

      <MediaList
        mediaList={filteredMediaList}
        setMediaList={setMediaList}
        token={token}
        categoryColors={categoryColors}
      />
    </div>
  );
}
