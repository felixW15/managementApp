// TaskItem.tsx
import type{ Task } from '../api/tasks';

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className="bg-white shadow rounded-xl p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-500 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      {task.description && <p className="text-sm text-gray-600 mt-2">{task.description}</p>}

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{new Date(task.created_at).toLocaleString()}</span>
        <span>User ID: {task.user_id}</span>
      </div>
    </div>
  );
}
