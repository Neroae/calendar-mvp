import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  format,
} from 'date-fns';

export interface Task {
  id: string;
  title: string;
  due_at: string;
  status: 'todo' | 'in_progress' | 'done';
}

interface CalendarProps {
  month: Date;
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  onTaskClick: (task: Task) => void;
}

/**
 * A simple month view calendar that displays tasks on their due dates.
 */
export default function Calendar({ month, tasks, onDateSelect, onTaskClick }: CalendarProps) {
  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [month]);

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
      {/* Header row */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
        <div
          key={d}
          className="p-2 text-center font-semibold text-xs bg-gray-50 text-gray-600"
        >
          {d}
        </div>
      ))}
      {weeks.map((week, wi) =>
        week.map((day, di) => {
          const dayTasks = tasks.filter((task) =>
            isSameDay(new Date(task.due_at), day)
          );
          const isCurrentMonth = month.getMonth() === day.getMonth();
          return (
            <div
              key={`${wi}-${di}`}
              className={`border-t border-l p-1 hover:bg-blue-50 cursor-pointer ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
              }`}
              onClick={() => onDateSelect(day)}
            >
              <div className="text-xs font-medium mb-1">{day.getDate()}</div>
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  className={`mb-1 px-1 py-0.5 rounded text-xs truncate ${
                    task.status === 'done'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {task.title}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
