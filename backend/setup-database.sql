-- FreshersJob database setup (canonical)
-- Run these migration files in this exact order in Supabase SQL Editor:
--
-- 1) backend/migrations/001_create_core_tables.sql
-- 2) backend/migrations/002_normalize_legacy_schema.sql
-- 3) backend/migrations/003_constraints_indexes.sql
-- 4) backend/migrations/004_enable_rls_and_policies.sql   (run only after JWT auth integration)
--
-- This file is only a runbook/verification sheet.

-- Verify canonical tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('jobs', 'applications', 'saved_jobs', 'UserProfile')
order by table_name;

-- Verify critical columns used by frontend
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'jobs' and column_name in ('created_at', 'applications_count', 'company_name', 'employer_id')) or
    (table_name = 'applications' and column_name in ('candidate_email', 'candidate_phone', 'candidate_name', 'resume_url', 'created_at')) or
    (table_name = 'saved_jobs' and column_name in ('user_email', 'user_id', 'job_id')) or
    (table_name = 'UserProfile' and column_name in ('created_by', 'full_name', 'phone', 'headline'))
  )
order by table_name, column_name;

-- Verify data joins now work for employer application views
select a.id, a.job_id, a.candidate_name, a.candidate_email, a.candidate_phone, a.status, a.created_at
from public.applications a
order by a.created_at desc
limit 20;
