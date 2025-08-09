import { useState, useEffect } from 'react';
import Head from 'next/head';
import Calendar, { Task } from '../components/Calendar';
import TaskDrawer from '../components/TaskDrawer';
import WeeklyStats from '../components/WeeklyStats';
import { format, addMonths } from 'date-fns';

export default function HomePage() {
  const [month, setMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load tasks from the API
  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      });
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEditingTask(null);
    setDrawerOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setDrawerOpen(true);
  };

  const handleSaveTask = async (data: Partial<Task> & { due_at: string }) => {
    try {
      const res = await fetch('/api/tasks' + (data.id ? '' : ''), {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const saved = await res.json();
      if (data.id) {
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      } else {
        setTasks((prev) => [...prev, saved]);
      }
    } finally {
      setDrawerOpen(false);
      setEditingTask(null);
    }
  };

  const handlePrevMonth = () => setMonth((prev) => addMonths(prev, -1));
  const handleNextMonth = () => setMonth((prev) => addMonths(prev, 1));

  return (
    <>
      <Head>
        <title>Calendar Task Manager</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Calendar Task Manager</h1>
          <div className="space-x-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              ← Prev
            </button>
            <span className="font-medium mx-2">
              {format(month, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next →
            </button>
          </div>
        </header>
        <main className="grid lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <Calendar
              month={month}
              tasks={tasks}
              onDateSelect={handleDateSelect}
              onTaskClick={handleTaskClick}
            />
          </section>
          <aside>
            <h2 className="text-lg font-semibold mb-2">Weekly Completion</h2>
            <WeeklyStats tasks={tasks} />
            <button
              onClick={() => {
                setEditingTask(null);
                setDrawerOpen(true);
              }}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Task
            </button>
          </aside>
        </main>
        <TaskDrawer
          open={drawerOpen}
          task={editingTask}
          onClose={() => setDrawerOpen(false)}
          onSave={handleSaveTask}
        />
      </div>
    </>
  );
}
