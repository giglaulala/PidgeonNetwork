# 🕶️ Cursor Rules — Anonymous Social Media App

> Minimalist · Black & White · Fully Anonymous · Supabase Backend

---

## Project Overview

You are building a **fully anonymous social media platform**. There are no accounts, no emails, no real identities. Users are identified only by a randomly generated `anonId` (UUID v4) created on first visit. The UI is **brutally minimal** — pure black and white, razor-sharp typography, no decoration. Every design decision must be intentional and stripped of noise.

---

## ⚙️ Tech Stack (Follow Exactly)

| Layer         | Choice                                              | Notes                                                                     |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| Framework     | **Next.js 14 (App Router)**                         | Use `app/` directory, server components by default                        |
| Language      | **TypeScript** — strict mode                        | `"strict": true` in tsconfig, no `any`                                    |
| Styling       | **Tailwind CSS**                                    | Custom B&W token system defined below                                     |
| Components    | **shadcn/ui**                                       | Unstyled base — override all colors to B&W                                |
| Animations    | **Framer Motion**                                   | Subtle only: fade-ins, slide-ups, no bounce                               |
| State         | **Zustand**                                         | For anonId, feed state, modals                                            |
| Database      | **Supabase**                                        | Postgres, Realtime, Storage all via Supabase                              |
| ORM / Queries | **Supabase JS Client v2** (`@supabase/supabase-js`) | Use typed client with generated types                                     |
| Auth          | **None — anonymous only**                           | UUID v4 anonId in `localStorage` + `httpOnly` cookie                      |
| Real-time     | **Supabase Realtime**                               | Subscribe to new posts/votes live                                         |
| Rate Limiting | **Upstash Redis**                                   | Protect post/vote endpoints by anonId + IP                                |
| Deployment    | **Vercel**                                          | Use `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars |

---

## 🗄️ Supabase Setup Rules

### Client Initialization

Always initialize like this. Never reinitialize per component.

```ts
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
```

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );
}
```

### Database Schema (Supabase SQL)

```sql
-- Posts table
create table posts (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,                        -- hashed UUID, never raw
  content text not null check (char_length(content) <= 500),
  parent_id uuid references posts(id),          -- null = top-level post
  upvotes int default 0,
  downvotes int default 0,
  created_at timestamptz default now()
);

-- Votes table (prevent double-voting per anonId)
create table votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  anon_id text not null,
  vote_type text check (vote_type in ('up', 'down')),
  created_at timestamptz default now(),
  unique(post_id, anon_id)
);

-- Enable Realtime on posts
alter publication supabase_realtime add table posts;
```

### Row Level Security (Always Enable)

```sql
-- Posts: anyone can read, insert only with valid anon_id
alter table posts enable row level security;
create policy "Public read" on posts for select using (true);
create policy "Anon insert" on posts for insert with check (anon_id is not null);

-- Votes: anyone can read, insert once per anon_id enforced by unique constraint
alter table votes enable row level security;
create policy "Public read" on votes for select using (true);
create policy "Anon insert" on votes for insert with check (anon_id is not null);
```

### Type Generation

Always generate types and commit them:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

---

## 🆔 Anonymity System

```ts
// lib/identity.ts
import { v4 as uuidv4 } from "uuid";

const KEY = "anon_id";

export function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Never store raw UUID in DB — always hash it
export async function getHashedAnonId(): Promise<string> {
  const id = getAnonId();
  const encoder = new TextEncoder();
  const data = encoder.encode(id);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

**Rules:**

- Raw UUID stays in `localStorage` only — never sent to server, never stored in DB
- DB only ever receives the SHA-256 hash of the UUID
- Generate a random display handle from the hash (e.g. `ghost_4f2a`) for UI only
- No cookies, no server sessions — stateless identity

---

## 🎨 Design System — Black & White Minimalism

### Philosophy

- **Zero color.** No gradients. No brand colors. No accents whatsoever.
- Depth comes from **font weight contrast, whitespace, and thin 1px borders** — never color.
- Dark mode is the default. Light mode is optional.
- Every element must justify its existence. If it doesn't carry information, cut it.

### Color Tokens (Tailwind Config)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        "ink-soft": "#111111",
        "ink-muted": "#1c1c1c",
        dim: "#555555",
        muted: "#888888",
        border: "#2a2a2a",
        "border-soft": "#3a3a3a",
        surface: "#0d0d0d",
        "surface-2": "#161616",
        "surface-3": "#1f1f1f",
        fog: "#cccccc",
        paper: "#f2f2f2",
        white: "#ffffff",
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"], // Headlines
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"], // Handles, timestamps
        body: ['"Inter"', "system-ui", "sans-serif"], // Body text only
      },
      fontSize: {
        "display-xl": [
          "3.5rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "2.25rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
      },
    },
  },
} satisfies Config;
```

### Typography Rules

- **Post content:** `font-body text-white text-[15px] leading-relaxed`
- **Anon handles:** `font-mono text-muted text-xs tracking-widest uppercase`
- **Timestamps:** `font-mono text-dim text-[11px]`
- **Section headers:** `font-display text-white` with large size contrast
- Line lengths capped at `max-w-[65ch]` for readability
- Never use font sizes between 13px and 15px — too ambiguous

### Spacing System

- Base unit: `4px` (Tailwind default)
- Component padding: `p-4` or `p-6` only
- Between posts: `gap-px` (1px divider line, no margin)
- Page max width: `max-w-2xl mx-auto`
- Never use arbitrary spacing values — stick to Tailwind scale

### Component Patterns

**Post Card:**

```tsx
<article className="border-b border-border px-4 py-5 hover:bg-surface-2 transition-colors duration-150">
  <div className="flex items-center gap-3 mb-3">
    <span className="font-mono text-muted text-xs tracking-widest">
      ghost_4f2a
    </span>
    <span className="text-border">·</span>
    <time className="font-mono text-dim text-[11px]">2m ago</time>
  </div>
  <p className="text-white text-[15px] leading-relaxed max-w-[65ch]">
    {content}
  </p>
  <div className="flex items-center gap-6 mt-4">
    <VoteButton type="up" count={upvotes} />
    <VoteButton type="down" count={downvotes} />
    <ReplyButton count={replies} />
  </div>
</article>
```

**Input / Compose:**

```tsx
<textarea
  className="w-full bg-transparent text-white text-[15px] leading-relaxed
             border border-border focus:border-white outline-none resize-none
             p-4 placeholder:text-dim transition-colors duration-200"
  placeholder="say something. no one knows it's you.(yeah and dont forget the #)"
  maxLength={500}
/>
```

**Buttons:**

```tsx
// Primary
<button className="px-5 py-2 bg-white text-ink text-sm font-medium
                   hover:bg-fog transition-colors duration-150">
  Post
</button>

// Ghost
<button className="px-5 py-2 border border-border text-muted text-sm
                   hover:border-white hover:text-white transition-colors duration-150">
  Cancel
</button>
```

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, anonId init
│   ├── page.tsx            # Feed (server component)
│   ├── post/[id]/
│   │   └── page.tsx        # Thread view
│   └── api/
│       ├── posts/route.ts  # POST: create post
│       └── vote/route.ts   # POST: cast vote
├── components/
│   ├── feed/
│   │   ├── Feed.tsx        # Realtime feed container
│   │   ├── PostCard.tsx    # Individual post
│   │   └── ComposeBox.tsx  # Anonymous post input
│   ├── vote/
│   │   └── VoteButton.tsx
│   └── ui/                 # shadcn components (all B&W overridden)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── identity.ts         # anonId + hashing
├── store/
│   └── useAppStore.ts      # Zustand global state
├── types/
│   └── supabase.ts         # Generated Supabase types
└── hooks/
    ├── useFeed.ts          # Realtime subscription
    └── useVote.ts          # Optimistic vote updates
```

---

## ⚡ Realtime Feed (Supabase)

```ts
// hooks/useFeed.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function useFeed(initialPosts: Post[]) {
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: "parent_id=is.null",
        },
        (payload) => {
          setPosts((prev) => [payload.new as Post, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return posts;
}
```

---

## 🔒 Security Rules

- Never expose raw `anonId` to the server or database — always SHA-256 hash it first
- Never log IP addresses or any identifying metadata
- Rate limit all write endpoints: max **5 posts / 10 min** and **30 votes / 10 min** per hashed anonId + IP combo via Upstash Redis
- All Supabase tables must have **RLS enabled** — no exceptions
- `SUPABASE_SERVICE_ROLE_KEY` only used server-side, never in client bundle
- Sanitize all post content server-side before DB insert (strip HTML, limit length)
- Never render user content with `dangerouslySetInnerHTML`

---

## 🚫 Banned Patterns

- No `useEffect` for data fetching — use server components + Supabase SSR
- No inline styles — Tailwind only
- No color outside the defined token system
- No border-radius above `rounded` (4px) — keep it sharp
- No shadows — use borders for depth
- No emojis in UI chrome — text and symbols only
- No `any` in TypeScript
- No loading spinners — use skeleton screens with `animate-pulse bg-surface-2`
- No toast libraries — use inline status text

---

## ✅ Component Checklist

Before marking any component done:

- [ ] Uses only B&W color tokens — no other colors
- [ ] Dark background (`bg-surface` or `bg-ink-soft`) by default
- [ ] Typography follows font family rules (display/mono/body)
- [ ] Hover/focus states defined with `transition-colors duration-150`
- [ ] Fully typed with TypeScript — no `any`
- [ ] Mobile-first responsive (works at 320px+)
- [ ] anonId never exposed in network requests — only hash
- [ ] Accessible: keyboard navigable, aria labels on icon buttons

---

## 🧱 Core Features to Build (In Order)

1. **Anonymous identity init** — generate + persist anonId on app load
2. **Feed page** — server-rendered list of posts, newest first
3. **Realtime updates** — new posts appear without refresh via Supabase Realtime
4. **Compose box** — post up to 500 characters anonymously
5. **Voting** — upvote/downvote with optimistic UI, persisted to Supabase
6. **Thread view** — click post to see replies in nested format
7. **Reply** — post a reply under any post (same anonymous flow)
8. **Rate limiting** — Upstash Redis guards on all write routes
