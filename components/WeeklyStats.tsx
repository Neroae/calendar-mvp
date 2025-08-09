import { format, startOfWeek } from 'date-fns';
import { Task } from './Calendar';

interface WeeklyStatsProps {
  tasks: Task[];
}

/**
 * Displays a simple weekly completion bar chart.  For each week of the
 * selected month it shows the percentage of tasks marked as done.
 */
export default function WeeklyStats({ tasks }: WeeklyStatsProps) {
  // Group tasks by week start
  const weekly = tasks.reduce<Record<string, { done: number; total: number }>>(
    (acc, task) => {
      const weekStart = format(startOfWeek(new Date(task.due_at), { weekStartsOn: 0 }), 'yyyy-MM-dd');
      if (!acc[weekStart]) acc[weekStart] = { done: 0, total: 0 };
      acc[weekStart].total += 1;
      if (task.status === 'done') acc[weekStart].done += 1;
      return acc;
    },
    {}
  );
  const entries = Object.entries(weekly).sort(([a], [b]) => (a < b ? -1 : 1));

  return (
    <div className="space-y-2 mt-4">
      {entries.map(([week, { done, total }]) => {
        const percent = total ? Math.round((done / total) * 100) : 0;
        return (
          <div key={week} className="">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Week of {week}</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
