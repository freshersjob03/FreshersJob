-- 004_enable_rls_and_policies.sql
-- SECURITY MIGRATION
-- Requires Supabase to receive authenticated JWTs that include `email` claim.
-- For Clerk, create a JWT template for Supabase and send it from frontend.
-- Safe to run multiple times.

begin;

alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public."UserProfile" enable row level security;

-- Optional hardening (keeps table owners unrestricted, enforces policies for API users).
alter table public.jobs force row level security;
alter table public.applications force row level security;
alter table public.saved_jobs force row level security;
alter table public."UserProfile" force row level security;

-- JOBS
drop policy if exists jobs_public_read on public.jobs;
create policy jobs_public_read
  on public.jobs
  for select
  using (true);

drop policy if exists jobs_employer_insert on public.jobs;
create policy jobs_employer_insert
  on public.jobs
  for insert
  with check (
    coalesce(auth.jwt() ->> 'email', '') <> ''
    and employer_id = auth.jwt() ->> 'email'
  );

drop policy if exists jobs_employer_update on public.jobs;
create policy jobs_employer_update
  on public.jobs
  for update
  using (
    employer_id = auth.jwt() ->> 'email'
  )
  with check (
    employer_id = auth.jwt() ->> 'email'
  );

drop policy if exists jobs_employer_delete on public.jobs;
create policy jobs_employer_delete
  on public.jobs
  for delete
  using (
    employer_id = auth.jwt() ->> 'email'
  );

-- USER PROFILE
drop policy if exists profile_owner_read on public."UserProfile";
create policy profile_owner_read
  on public."UserProfile"
  for select
  using (
    created_by = auth.jwt() ->> 'email'
  );

drop policy if exists profile_owner_insert on public."UserProfile";
create policy profile_owner_insert
  on public."UserProfile"
  for insert
  with check (
    created_by = auth.jwt() ->> 'email'
  );

drop policy if exists profile_owner_update on public."UserProfile";
create policy profile_owner_update
  on public."UserProfile"
  for update
  using (
    created_by = auth.jwt() ->> 'email'
  )
  with check (
    created_by = auth.jwt() ->> 'email'
  );

drop policy if exists profile_owner_delete on public."UserProfile";
create policy profile_owner_delete
  on public."UserProfile"
  for delete
  using (
    created_by = auth.jwt() ->> 'email'
  );

-- APPLICATIONS
drop policy if exists applications_candidate_insert on public.applications;
create policy applications_candidate_insert
  on public.applications
  for insert
  with check (
    candidate_email = auth.jwt() ->> 'email'
  );

drop policy if exists applications_candidate_read on public.applications;
create policy applications_candidate_read
  on public.applications
  for select
  using (
    candidate_email = auth.jwt() ->> 'email'
  );

drop policy if exists applications_employer_read on public.applications;
create policy applications_employer_read
  on public.applications
  for select
  using (
    employer_id = auth.jwt() ->> 'email'
  );

drop policy if exists applications_employer_update on public.applications;
create policy applications_employer_update
  on public.applications
  for update
  using (
    employer_id = auth.jwt() ->> 'email'
  )
  with check (
    employer_id = auth.jwt() ->> 'email'
  );

-- SAVED JOBS
drop policy if exists saved_jobs_owner_read on public.saved_jobs;
create policy saved_jobs_owner_read
  on public.saved_jobs
  for select
  using (
    user_email = auth.jwt() ->> 'email'
  );

drop policy if exists saved_jobs_owner_insert on public.saved_jobs;
create policy saved_jobs_owner_insert
  on public.saved_jobs
  for insert
  with check (
    user_email = auth.jwt() ->> 'email'
  );

drop policy if exists saved_jobs_owner_delete on public.saved_jobs;
create policy saved_jobs_owner_delete
  on public.saved_jobs
  for delete
  using (
    user_email = auth.jwt() ->> 'email'
  );

commit;
