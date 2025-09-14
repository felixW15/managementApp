import type { Media } from "@api/media";

interface MediaFiltersProps {
  categoryFilter: "all" | Media["category"];
  statusFilter: "all" | Media["status"];
  sortOption: "alphabetical" | "lastEdited" | "progress";
  searchQuery: string;
  onCategoryChange: (value: "all" | Media["category"]) => void;
  onStatusChange: (value: "all" | Media["status"]) => void;
  onSortChange: (value: "alphabetical" | "lastEdited" | "progress") => void;
  onSearchChange: (value: string) => void;
}

export function MediaFilters({
  categoryFilter,
  statusFilter,
  sortOption,
  searchQuery,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onSearchChange,
}: MediaFiltersProps) {
  return (
    <div className="flex gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium">Category</label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value as any)}
          className="border p-1 rounded"
        >
          <option value="all">All</option>
          <option value="book">Book</option>
          <option value="manga">Manga</option>
          <option value="anime">Anime</option>
          <option value="visual novel">Visual Novel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as any)}
          className="border p-1 rounded"
        >
          <option value="all">All</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Sort By</label>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="border p-1 rounded"
        >
          <option value="lastEdited">Last Edited</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="progress">Progress</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name..."
          className="w-full border p-1 rounded"
        />
      </div>
    </div>
  );
}
