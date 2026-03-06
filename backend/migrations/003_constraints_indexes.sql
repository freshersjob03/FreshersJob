-- 003_constraints_indexes.sql
-- Add constraints and indexes after legacy normalization.
-- Safe to run multiple times.

begin;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_job_id_fkey'
  ) then
    alter table public.applications
      add constraint applications_job_id_fkey
      foreign key (job_id) references public.jobs(id) on delete cascade;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'saved_jobs_job_id_fkey'
  ) then
    alter table public.saved_jobs
      add constraint saved_jobs_job_id_fkey
      foreign key (job_id) references public.jobs(id) on delete cascade;
  end if;
end
$$;

create unique index if not exists uq_userprofile_created_by
  on public."UserProfile"(created_by);

create unique index if not exists uq_saved_jobs_user_email_job
  on public.saved_jobs(user_email, job_id)
  where user_email is not null;

create unique index if not exists uq_saved_jobs_user_id_job
  on public.saved_jobs(user_id, job_id)
  where user_id is not null;

create index if not exists idx_jobs_created_at
  on public.jobs(created_at desc);

create index if not exists idx_jobs_employer_id
  on public.jobs(employer_id);

create index if not exists idx_jobs_status
  on public.jobs(status);

create index if not exists idx_jobs_title
  on public.jobs(title);

create index if not exists idx_applications_job_id
  on public.applications(job_id);

create index if not exists idx_applications_employer_id
  on public.applications(employer_id);

create index if not exists idx_applications_candidate_email
  on public.applications(candidate_email);

create index if not exists idx_applications_candidate_id
  on public.applications(candidate_id);

create index if not exists idx_applications_status
  on public.applications(status);

create index if not exists idx_applications_created_at
  on public.applications(created_at desc);

create index if not exists idx_saved_jobs_user_email
  on public.saved_jobs(user_email);

create index if not exists idx_saved_jobs_user_id
  on public.saved_jobs(user_id);

create index if not exists idx_saved_jobs_job_id
  on public.saved_jobs(job_id);

create index if not exists idx_saved_jobs_created_at
  on public.saved_jobs(created_at desc);

-- Validate status values without breaking old rows.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'jobs_status_chk'
  ) then
    alter table public.jobs
      add constraint jobs_status_chk
      check (status in ('active', 'closed', 'draft'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_status_chk'
  ) then
    alter table public.applications
      add constraint applications_status_chk
      check (status in ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired'));
  end if;
end
$$;

commit;
