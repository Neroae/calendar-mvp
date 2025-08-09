import { useState, useEffect } from 'react';
import { Task } from './Calendar';

interface TaskDrawerProps {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (data: Partial<Task> & { due_at: string }) => void;
}

/**
 * A simple sliding drawer for creating or editing a task.  It only captures
 * the title and due date/time to keep the MVP focused.  Role assignment
 * and description fields can be added later.
 */
export default function TaskDrawer({ open, task, onClose, onSave }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      // Convert ISO string to local datetime-local value
      const date = new Date(task.due_at);
      const isoLocal = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDueAt(isoLocal);
    } else {
      setTitle('');
      setDueAt('');
    }
  }, [task]);

  const handleSubmit = () => {
    if (!title || !dueAt) return;
    onSave({
      ...(task ? { id: task.id } : {}),
      title,
      due_at: new Date(dueAt).toISOString(),
    });
  };

  return (
    <div
      className={`fixed inset-0 z-40 bg-black bg-opacity-20 transition-opacity duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due date &amp; time
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {task ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}
