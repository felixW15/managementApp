// src/components/TaskList.tsx
import { useEffect, useState } from "react";
import { getTasks, addTask, deleteTask, updateTask} from "../api/tasks";
import type { Task } from "../api/tasks";

interface TaskListProps {
  token: string;
  onLogout: () => void;
}

export default function TaskList({ token, onLogout }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    getTasks(token)
      .then(setTasks)
      .catch((err) => console.error("Failed to fetch tasks:", err));
  }, [token]);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    try {
      const task = await addTask(newTask, token);
      setTasks((prev) => [...prev, task]);
      setNewTask("");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id, token);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const updated = await updateTask(editingId, { title: editTitle, description: editDesc }, token);
    setTasks((prev) =>
      prev.map((task) => (task.id === editingId ? updated : task))
    );
    cancelEdit();
  };

   return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex mb-6">
        <input
          className="flex-grow border p-2 rounded-l"
          placeholder="New task title..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-r"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      <ul className="space-y-4">
        {tasks.map((task) =>
          editingId === task.id ? (
            <li
              key={task.id}
              className="p-4 border border-gray-300 rounded bg-yellow-50"
            >
              <input
                className="w-full mb-2 p-2 border rounded"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                className="w-full mb-2 p-2 border rounded"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description"
              />
              <div className="flex justify-end space-x-2">
                <button className="text-gray-500" onClick={cancelEdit}>
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={submitEdit}
                >
                  Save
                </button>
              </div>
            </li>
          ) : (
            <li
              key={task.id}
              className="p-4 border border-gray-200 rounded shadow-sm bg-white"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-700 text-sm mt-1">
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="space-x-2 text-sm">
                  <button
                    className="text-blue-500"
                    onClick={() => startEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          )
        )}
      </ul>

      <button className="mt-8 text-red-500 underline" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}