-- K-FORGE cloud sync schema. Run in the Supabase SQL editor (Dashboard → SQL → New query).
-- Each learner owns exactly one row of progress; row-level security restricts every row to its owner.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "progress: owner can read"   on public.progress;
drop policy if exists "progress: owner can insert" on public.progress;
drop policy if exists "progress: owner can update" on public.progress;
drop policy if exists "progress: owner can delete" on public.progress;

create policy "progress: owner can read"   on public.progress for select using (auth.uid() = user_id);
create policy "progress: owner can insert" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: owner can update" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress: owner can delete" on public.progress for delete using (auth.uid() = user_id);

-- Evidence files (photos, code, logs): private bucket, one folder per user (<user_id>/<evidence_id>/<file name>).
insert into storage.buckets (id, name, public, file_size_limit)
values ('evidence', 'evidence', false, 15728640)
on conflict (id) do nothing;

drop policy if exists "evidence: owner can read"   on storage.objects;
drop policy if exists "evidence: owner can write"  on storage.objects;
drop policy if exists "evidence: owner can update" on storage.objects;
drop policy if exists "evidence: owner can delete" on storage.objects;

create policy "evidence: owner can read"   on storage.objects for select using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence: owner can write"  on storage.objects for insert with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence: owner can update" on storage.objects for update using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "evidence: owner can delete" on storage.objects for delete using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
