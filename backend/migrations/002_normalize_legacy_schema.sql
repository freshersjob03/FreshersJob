-- 002_normalize_legacy_schema.sql
-- Bring legacy table/column variants to canonical schema.
-- Safe to run multiple times.

begin;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'userprofile'
  ) and not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'UserProfile'
  ) then
    execute 'alter table public.userprofile rename to "UserProfile"';
  end if;
end
$$;

-- Jobs
alter table public.jobs add column if not exists company_name text;
alter table public.jobs add column if not exists company text;
alter table public.jobs add column if not exists state text;
alter table public.jobs add column if not exists city text;
alter table public.jobs add column if not exists locality text;
alter table public.jobs add column if not exists employer_id text;
alter table public.jobs add column if not exists created_by text;
alter table public.jobs add column if not exists applications_count integer not null default 0;
alter table public.jobs add column if not exists company_logo text;
alter table public.jobs add column if not exists status text not null default 'active';
alter table public.jobs add column if not exists skills text[] not null default '{}';
alter table public.jobs add column if not exists created_at timestamptz not null default now();
alter table public.jobs add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'created_date'
  ) then
    update public.jobs
    set created_at = coalesce(created_at, created_date)
    where created_date is not null;
  end if;
end
$$;

update public.jobs
set company_name = coalesce(company_name, company)
where company_name is null and company is not null;

update public.jobs
set company = coalesce(company, company_name)
where company is null and company_name is not null;

update public.jobs
set location = coalesce(location, concat_ws(', ', city, state))
where (location is null or location = '')
  and (city is not null or state is not null);

-- UserProfile
alter table public."UserProfile" add column if not exists created_by text;
alter table public."UserProfile" add column if not exists role text;
alter table public."UserProfile" add column if not exists full_name text;
alter table public."UserProfile" add column if not exists headline text;
alter table public."UserProfile" add column if not exists phone text;
alter table public."UserProfile" add column if not exists skills text[] not null default '{}';
alter table public."UserProfile" add column if not exists company_name text;
alter table public."UserProfile" add column if not exists created_at timestamptz not null default now();
alter table public."UserProfile" add column if not exists updated_at timestamptz not null default now();

-- Applications
alter table public.applications add column if not exists job_id bigint;
alter table public.applications add column if not exists candidate_id text;
alter table public.applications add column if not exists candidate_email text;
alter table public.applications add column if not exists candidate_name text;
alter table public.applications add column if not exists candidate_phone text;
alter table public.applications add column if not exists candidate_headline text;
alter table public.applications add column if not exists candidate_skills text[] not null default '{}';
alter table public.applications add column if not exists employer_id text;
alter table public.applications add column if not exists job_title text;
alter table public.applications add column if not exists company_name text;
alter table public.applications add column if not exists cover_letter text;
alter table public.applications add column if not exists resume_url text;
alter table public.applications add column if not exists status text not null default 'pending';
alter table public.applications add column if not exists created_at timestamptz not null default now();
alter table public.applications add column if not exists updated_at timestamptz not null default now();

update public.applications a
set candidate_email = a.candidate_id
where (a.candidate_email is null or a.candidate_email = '')
  and a.candidate_id like '%@%';

update public.applications a
set employer_id = j.employer_id
from public.jobs j
where a.job_id = j.id
  and (a.employer_id is null or a.employer_id = '');

update public.applications a
set job_title = j.title
from public.jobs j
where a.job_id = j.id
  and (a.job_title is null or a.job_title = '');

update public.applications a
set company_name = coalesce(j.company_name, j.company)
from public.jobs j
where a.job_id = j.id
  and (a.company_name is null or a.company_name = '');

update public.applications a
set candidate_phone = up.phone
from public."UserProfile" up
where (a.candidate_phone is null or a.candidate_phone = '')
  and (
    (a.candidate_email is not null and a.candidate_email = up.created_by)
    or (a.candidate_id is not null and a.candidate_id = up.created_by)
  )
  and up.phone is not null;

update public.applications a
set candidate_name = up.full_name
from public."UserProfile" up
where (a.candidate_name is null or a.candidate_name = '')
  and (
    (a.candidate_email is not null and a.candidate_email = up.created_by)
    or (a.candidate_id is not null and a.candidate_id = up.created_by)
  )
  and up.full_name is not null;

update public.applications a
set candidate_headline = up.headline
from public."UserProfile" up
where (a.candidate_headline is null or a.candidate_headline = '')
  and (
    (a.candidate_email is not null and a.candidate_email = up.created_by)
    or (a.candidate_id is not null and a.candidate_id = up.created_by)
  )
  and up.headline is not null;

update public.applications a
set candidate_skills = coalesce(up.skills, '{}')
from public."UserProfile" up
where (
    a.candidate_skills is null
    or cardinality(a.candidate_skills) = 0
  )
  and (
    (a.candidate_email is not null and a.candidate_email = up.created_by)
    or (a.candidate_id is not null and a.candidate_id = up.created_by)
  )
  and up.skills is not null;

-- Saved jobs
alter table public.saved_jobs add column if not exists job_id bigint;
alter table public.saved_jobs add column if not exists user_id text;
alter table public.saved_jobs add column if not exists user_email text;
alter table public.saved_jobs add column if not exists created_at timestamptz not null default now();

update public.saved_jobs
set user_email = user_id
where (user_email is null or user_email = '')
  and user_id like '%@%';

commit;
