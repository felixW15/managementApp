// components/SortedTaskList.tsx
import {
  DndContext,
  closestCenter,
} from '@dnd-kit/core';
import type{
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type{ Task } from '../api/tasks';

interface Props {
  tasks: Task[];
}

export function SortedTaskList({ tasks }: Props) {
  const [sortedTasks, setSortedTasks] = useState<Task[]>(tasks);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over?.id);
      setSortedTasks(arrayMove(sortedTasks, oldIndex, newIndex));
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📋 Sorted Tasks</h2>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sortedTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {sortedTasks.map((task, index) => (
              <SortableTaskItem key={task.id} task={task} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableTaskItem({ task, index }: { task: Task; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="border border-gray-300 dark:border-gray-700 p-3 rounded shadow flex items-center gap-3 cursor-move bg-white dark:bg-gray-800"
    >
      <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-right">
        {index + 1}.
      </span>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
        )}
      </div>
    </li>
  );
}
