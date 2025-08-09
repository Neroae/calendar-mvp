import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Use the service role key on the server for full privileges.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Fetch tasks with assignments via the tasks_view.  In a real app you would
    // filter by team and user based on auth; here we return all tasks.
    const { data, error } = await supabase.from('tasks_view').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const { title, due_at } = req.body;
    if (!title || !due_at) {
      return res.status(400).json({ error: 'Missing title or due_at' });
    }
    try {
      const { data, error } = await supabase.from('tasks').insert({
        title,
        due_at,
        team_id: null, // TODO: set team based on authenticated user
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === 'PUT') {
    const { id, title, due_at, status } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ title, due_at, status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.status(405).setHeader('Allow', ['GET', 'POST', 'PUT']).end();
}
