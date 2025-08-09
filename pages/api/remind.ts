import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Resend API endpoint
const RESEND_API_URL = 'https://api.resend.com/emails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  // Fetch tasks due in the next 24 hours
  const now = new Date();
  const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const { data: tasks, error } = await supabase
    .from('tasks_view')
    .select('id, title, due_at, assignments')
    .gte('due_at', now.toISOString())
    .lte('due_at', soon.toISOString());
  if (error) return res.status(500).json({ error: error.message });
  // Flatten assignments to get unique user_ids
  const userIds = new Set<string>();
  tasks?.forEach((task) => {
    (task as any).assignments?.forEach((a: any) => {
      if (a.user_id) userIds.add(a.user_id);
    });
  });
  // Fetch users
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, email');
  if (userErr) return res.status(500).json({ error: userErr.message });
  const userMap = new Map(users?.map((u) => [u.id, u.email]));
  // Compose and send emails
  const sendPromises: Promise<any>[] = [];
  tasks?.forEach((task) => {
    (task as any).assignments?.forEach((a: any) => {
      const email = userMap.get(a.user_id);
      if (email) {
        const subject = `Reminder: ${task.title}`;
        const dueDate = new Date(task.due_at).toLocaleString();
        const text = `Your task "${task.title}" is due at ${dueDate}. Please ensure it is completed.`;
        sendPromises.push(
          fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM,
              to: email,
              subject,
              html: `<p>${text}</p>`
            }),
          })
        );
      }
    });
  });
  try {
    await Promise.all(sendPromises);
    return res.status(200).json({ status: 'sent', count: sendPromises.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
