# FreshersJob DB Migrations

Run in Supabase SQL Editor in this order:

1. `001_create_core_tables.sql`
2. `002_normalize_legacy_schema.sql`
3. `003_constraints_indexes.sql`

## Why this set

- Defines one canonical schema for `jobs`, `applications`, `saved_jobs`, and `UserProfile`.
- Normalizes old schema drift (`userprofile`, missing columns, legacy `created_date`, etc.).
- Adds indexes, unique constraints, and FK constraints for stability and performance.

## Production note

After these migrations are applied successfully, frontend code should stop using runtime table/column fallbacks and use canonical names only.
