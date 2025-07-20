// src/components/SortUI.tsx
import type{ Task } from "../api/tasks";

type SortUIProps = {
  taskA: Task;
  taskB: Task;
  onChoose: (task: Task) => void;
};

export function SortUI({ taskA, taskB, onChoose }: SortUIProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl text-center max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Which task has higher priority?
        </h2>
        <div className="flex gap-6 justify-center">
          {[taskA, taskB].map((task) => (
            <button
              key={task.id}
              onClick={() => onChoose(task)}
              className="flex-1 border border-gray-300 dark:border-gray-600 p-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{task.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
