// src/components/TaskList.tsx
// Tasks.tsx
import { useEffect, useState } from 'react';
import { getTasks, addTask, deleteTask, updateTask } from '../api/tasks';
import type{ Task } from '../api/tasks';
import { TaskItem } from './TaskItem';

interface TasksProps {
  token: string;
}

export function Tasks({ token }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    getTasks(token).then(setTasks).catch(console.error);
  }, [token]);

  const handleAdd = async () => {
    if (!newTitle) return;
    const newTask = await addTask(newTitle, token);
    setTasks([...tasks, newTask]);
    setNewTitle('');
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id, token);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleEdit = async (task: Task) => {
    const updatedTitle = prompt("Edit title:", task.title);
    if (!updatedTitle || updatedTitle === task.title) return;

    const updated = await updateTask(task.id, { title: updatedTitle }, token);
    setTasks(tasks.map(t => (t.id === task.id ? updated : t)));
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">🧠 Task List</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="New task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          onClick={handleAdd}
        >
          Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}
    </div>
  );
}
