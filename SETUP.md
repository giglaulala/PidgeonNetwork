# PidgeonNetwork — Setup Guide

> Fully anonymous social media. No accounts. No traces.

---

## Step 1 — Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com) and create a free account
2. Click **New project**
3. Choose a name (e.g. `pidgeonnetwork`), set a strong database password, pick a region
4. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the Database Schema

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,
  content text not null check (char_length(content) <= 500),
  parent_id uuid references posts(id),
  upvotes int default 0,
  downvotes int default 0,
  created_at timestamptz default now()
);

-- Votes table
create table votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  anon_id text not null,
  vote_type text check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  unique(post_id, anon_id)
);

-- RLS: Posts
alter table posts enable row level security;
create policy "Public read" on posts for select using (true);
create policy "Anon insert" on posts for insert with check (anon_id is not null);

-- RLS: Votes
alter table votes enable row level security;
create policy "Public read" on votes for select using (true);
create policy "Anon insert" on votes for insert with check (anon_id is not null);
create policy "Anon delete" on votes for delete using (true);
create policy "Anon update" on votes for update using (true);

-- Realtime
alter publication supabase_realtime add table posts;

-- Helper functions for vote counts
create or replace function increment_vote(p_post_id uuid, p_vote_type text)
returns void language sql as $$
  update posts
  set upvotes   = upvotes   + case when p_vote_type = 'up'   then 1 else 0 end,
      downvotes = downvotes + case when p_vote_type = 'down' then 1 else 0 end
  where id = p_post_id;
$$;

create or replace function decrement_vote(p_post_id uuid, p_vote_type text)
returns void language sql as $$
  update posts
  set upvotes   = greatest(0, upvotes   - case when p_vote_type = 'up'   then 1 else 0 end),
      downvotes = greatest(0, downvotes - case when p_vote_type = 'down' then 1 else 0 end)
  where id = p_post_id;
$$;

create or replace function switch_vote(p_post_id uuid, p_old_type text, p_new_type text)
returns void language sql as $$
  update posts
  set upvotes   = upvotes
                  - case when p_old_type = 'up'   then 1 else 0 end
                  + case when p_new_type = 'up'   then 1 else 0 end,
      downvotes = downvotes
                  - case when p_old_type = 'down' then 1 else 0 end
                  + case when p_new_type = 'down' then 1 else 0 end
  where id = p_post_id;
$$;
```

---

## Step 3 — Copy env vars

1. In Supabase dashboard: **Settings → API**
2. Copy **Project URL** and **anon public key**
3. In this project:

```bash
cp .env.local.example .env.local
```

4. Open `.env.local` and fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## Step 4 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5 — Deploy to Vercel

```bash
npx vercel
```

When prompted, add the same env vars from `.env.local` in the Vercel dashboard, or use:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Architecture

```
User → localStorage (raw UUID, never leaves browser)
     → SHA-256 hash → sent to API routes → stored in DB
     
No auth. No sessions. No emails. Fully anonymous.
```

---

## Features Built

- [x] Anonymous identity (UUID v4 → SHA-256 hash → display handle)
- [x] Realtime feed (Supabase Realtime WebSocket)
- [x] Post creation (up to 500 chars)
- [x] Upvote / downvote with optimistic UI
- [x] Thread / reply view
- [x] Black & white minimal design (dark mode)
- [x] Keyboard shortcut: Cmd/Ctrl+Enter to post
- [x] Skeleton loading states
- [x] 404 page
