// src/components/MediaManager.tsx
import { useEffect, useState } from "react";
import { getMedia, addMedia, deleteMedia } from "../api/media";
import type{ Media, MediaBase } from "../api/media";

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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📚 Media Manager</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-2 rounded"
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
          className="w-full border p-2 rounded"
        >
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>

        <input
          name="progress"
          type="number"
          value={formData.progress}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          min={0}
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Media
        </button>
      </form>

      <ul className="space-y-2">
        {mediaList.map((media) => (
          <li
            key={media.id}
            className="border p-3 rounded bg-gray-50 flex justify-between items-center"
          >
            <div>
              <strong>{media.name}</strong> ({media.category}) - {media.status} ({media.progress})  
              <br />
              <small className="text-gray-500">Last edited: {new Date(media.last_edited).toLocaleString()}</small>
            </div>
            <button
              onClick={() => handleDelete(media.id)}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
