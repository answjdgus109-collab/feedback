create table public.votes (
  id bigint generated always as identity primary key,
  rating text not null check (rating in ('satisfied', 'neutral', 'dissatisfied')),
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;

revoke all on public.votes from anon, authenticated;
grant insert on public.votes to anon;
grant select, insert, delete on public.votes to authenticated;

create policy "anon can insert" on public.votes for insert to anon with check (true);
create policy "admin can select" on public.votes for select to authenticated using (true);
create policy "admin can insert" on public.votes for insert to authenticated with check (true);
create policy "admin can delete" on public.votes for delete to authenticated using (true);
