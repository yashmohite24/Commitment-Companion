-- Landing page waitlist emails (viewable in Supabase Table Editor)

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_unique unique (email),
  constraint waitlist_signups_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index waitlist_signups_created_at_idx on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

comment on table public.waitlist_signups is 'HeroArc landing page waitlist — view in Supabase Table Editor';
