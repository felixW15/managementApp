// src/components/TaskList.tsx
import { useEffect, useState } from "react";
import { getTasks, addTask } from "../api/tasks";
import type { Task } from "../api/tasks";

interface TaskListProps {
  token: string;
  onLogout: () => void;
}

export default function TaskList({ token, onLogout }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

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

  return (
    <div>
      <div className="flex mb-4">
        <input
          className="flex-grow border p-2 rounded-l"
          placeholder="New task..."
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

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="p-2 bg-gray-100 rounded border border-gray-300"
          >
            {task.title}
          </li>
        ))}
      </ul>

      <button
        className="mt-6 text-red-500 underline"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
}
