# Calendar‑Driven Task Manager

This project is a **role‑driven calendar** for managing tasks across teams.  It treats the calendar as the source of truth and enforces three guard rails:

1. **Every task has an owner, a role and a due date.**  Ownership is attached to a role (e.g. *"TL – Digital CX"*), not a person, so when people churn the role still owns the work.
2. **Completion is measured weekly** by role and assignee.  Vanity “overall completion” metrics are ignored in favour of actionable KPIs.
3. **Reminders are automatic** – default notifications are sent 24 hours, 2 hours and 30 minutes before a task is due.  If a task breaches its SLA the reminder escalates to the role lead.

The MVP includes:

- A monthly calendar with drag‑to‑reschedule and a drawer for creating/editing tasks.
- Role management (teams, roles and membership).
- Email notifications via [Resend](https://resend.com/) triggered by scheduled cron jobs.
- A weekly completion dashboard and CSV export.

> **Opinionated note:** This repository is deliberately simple.  It uses Next.js and Supabase for speed and pragmatism.  There are no exotic frameworks or over‑engineered abstractions.  To deploy at scale you can layer in Redis (for queueing), NextAuth (for SAML/OIDC), or your own job runner later.

## Getting started

1. **Clone this repository** and install dependencies:

   ```sh
   npm install
   ```

2. **Create a Supabase project** and set up the database schema using `lib/dbSchema.sql`.  Copy the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and service role key into `.env.local` (use `.env.example` as a template).

3. **Configure Resend**.  Sign up at [resend.com](https://resend.com), create an API key and update `RESEND_API_KEY` in `.env.local`.

4. **Run the development server**:

   ```sh
   npm run dev
   ```

5. **Schedule the reminder job.**  Use Vercel Cron (or your own scheduler) to hit the `/api/remind` endpoint every hour.  It will find tasks with due dates in the next 24 hours and send notifications.

## Tech stack

- **Next.js 14** – the React framework for building full‑stack applications.
- **TypeScript** – for type safety across the codebase.
- **Tailwind CSS** – for utility‑first styling.
- **Supabase** – Postgres database, authentication and storage.
- **Resend** – transactional email service for reminders.
- **date‑fns** – modern date utilities.

## Database schema

The Supabase SQL file at `lib/dbSchema.sql` defines the core tables:

- `users` – people who use the app.
- `teams` – groups of users.
- `roles` – named responsibilities within a team.
- `role_members` – many‑to‑many join between roles and users.
- `tasks` – task records with title, description, priority, status, due date and team.
- `task_assignments` – links tasks to roles and optionally to specific users.
- `reminders` – holds per‑task reminder intervals (minutes before due date).
- `activity` – audit log of task changes.

See the SQL file for full definitions and relationships.

## Folder structure

```
calendar_mvp/
├── components/        # Reusable React components (Calendar, TaskDrawer, WeeklyStats)
├── lib/               # Supabase client and database schema
├── pages/             # Next.js pages and API routes
├── public/            # Static assets
├── styles/            # Global CSS and Tailwind imports
├── .env.example       # Example environment variables
├── package.json       # Project metadata and scripts
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind configuration
└── README.md          # This file
```

## License

This project is provided as is, under the MIT license.  Feel free to use, modify and extend it for your own purposes.