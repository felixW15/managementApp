import type { Media } from "@api/media";

const CATEGORIES: Media["category"][] = ["anime", "manga", "webtoon", "movie", "book", "visual novel"];
const STATUSES: Media["status"][] = ["in progress", "plan to watch", "completed", "dropped"];

interface Tag {
  id: number;
  name: string;
}

interface MediaFiltersProps {
  categoryFilter: Media["category"][];
  onCategoryChange: React.Dispatch<React.SetStateAction<Media["category"][]>>;
  statusFilter: Media["status"][];
  onStatusChange: React.Dispatch<React.SetStateAction<Media["status"][]>>;
  tagFilter: string[];
  onTagChange: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags: Tag[];
  sortOption: "alphabetical" | "lastEdited" | "progress" | "rating";
  onSortChange: React.Dispatch<React.SetStateAction<"alphabetical" | "lastEdited" | "progress" | "rating">>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function MediaFilters({
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  tagFilter,
  onTagChange,
  availableTags,
  sortOption,
  onSortChange,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
}: MediaFiltersProps) {
  return (
    <div className="mb-4 space-y-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">

      {/* Search + Sort row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as typeof sortOption)}
          className="border border-gray-300 dark:border-gray-600 p-1.5 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="lastEdited">Last Edited</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="progress">Progress</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      {/* Category chips */}
      <div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {CATEGORIES.map((cat) => {
            const active = categoryFilter.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange((prev) => toggleItem(prev, cat))}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors capitalize
                  ${active
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                  }`}
              >
                {cat}
              </button>
            );
          })}
          {categoryFilter.length > 0 && (
            <button
              onClick={() => onCategoryChange([])}
              className="px-2 py-0.5 rounded-full text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Status chips */}
      <div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {STATUSES.map((status) => {
            const active = statusFilter.includes(status);
            return (
              <button
                key={status}
                onClick={() => onStatusChange((prev) => toggleItem(prev, status))}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors capitalize
                  ${active
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                  }`}
              >
                {status}
              </button>
            );
          })}
          {statusFilter.length > 0 && (
            <button
              onClick={() => onStatusChange([])}
              className="px-2 py-0.5 rounded-full text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Tag chips */}
      {availableTags.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tags</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {availableTags.map((tag) => {
              const active = tagFilter.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  onClick={() => onTagChange((prev) => toggleItem(prev, tag.name))}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors
                    ${active
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }`}
                >
                  {tag.name}
                </button>
              );
            })}
            {tagFilter.length > 0 && (
              <button
                onClick={() => onTagChange([])}
                className="px-2 py-0.5 rounded-full text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {filteredCount === totalCount
          ? `${totalCount} entries`
          : `${filteredCount} of ${totalCount} entries`}
      </p>
    </div>
  );
}
