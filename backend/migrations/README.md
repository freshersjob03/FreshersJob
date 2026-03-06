# FreshersJob DB Migrations

Run in Supabase SQL Editor in this order:

1. `001_create_core_tables.sql`
2. `002_normalize_legacy_schema.sql`
3. `003_constraints_indexes.sql`
4. `004_enable_rls_and_policies.sql` (after JWT auth integration is ready)

## Why this set

- Defines one canonical schema for `jobs`, `applications`, `saved_jobs`, and `UserProfile`.
- Normalizes old schema drift (`userprofile`, missing columns, legacy `created_date`, etc.).
- Adds indexes, unique constraints, and FK constraints for stability and performance.

## Production note

After `001-003`, frontend can use canonical table/column names only.

`004` is a security hardening migration and should be applied only after Supabase receives authenticated JWTs (for example via Clerk Supabase JWT template). If you run `004` before that, write operations will be blocked by RLS.
