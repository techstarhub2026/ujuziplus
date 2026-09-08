# Failed Migration Recovery Instructions

## What Happened

The migration `20260626000007_complete_mentor_system` failed on Railway because it used PostgreSQL `CREATE TYPE` syntax, which is not compatible with MySQL.

**Error**: `P3009 - migrate found failed migrations in the target database`

## How to Fix

### Option 1: Manual Database Fix (Recommended for Production)

You need to manually mark the failed migrations as resolved in the Railway database, then the new recovery migrations will apply.

**Steps:**

1. **Access Railway Database**:
   - Go to your Railway project
   - Open the MySQL plugin
   - Connect via the terminal or database client

2. **Check Failed Migrations**:
   ```sql
   SELECT * FROM `_prisma_migrations` WHERE `finished_at` IS NULL;
   ```
   You should see migration IDs:
   - `20260626000007_complete_mentor_system`
   - `20260626000008_create_showcase_system`

3. **Mark As Rolled Back**:
   ```sql
   DELETE FROM `_prisma_migrations` WHERE `migration_name` = '20260626000007_complete_mentor_system';
   DELETE FROM `_prisma_migrations` WHERE `migration_name` = '20260626000008_create_showcase_system';
   ```

4. **Verify Cleanup**:
   ```sql
   -- These tables should not exist if the migrations failed completely
   DROP TABLE IF EXISTS `mentor_profiles`;
   DROP TABLE IF EXISTS `mentor_requests`;
   DROP TABLE IF EXISTS `mentor_sessions`;
   DROP TABLE IF EXISTS `mentor_office_hours`;
   DROP TABLE IF EXISTS `mentor_group_sessions`;
   DROP TABLE IF EXISTS `mentor_group_session_attendees`;
   DROP TABLE IF EXISTS `mentor_cohorts`;
   DROP TABLE IF EXISTS `mentor_cohort_members`;
   DROP TABLE IF EXISTS `showcase_projects`;
   DROP TABLE IF EXISTS `showcase_likes`;
   ```

5. **Try Deploy Again**:
   - Make a new commit or redeploy existing
   - Railway will now apply all migrations from scratch
   - The corrected migrations with proper MySQL syntax will create tables successfully
   - Then recovery migrations 20260626000009 & 20260626000010 will apply

### Option 2: Automatic Fix via Prisma Migrate Resolve

If your Railway environment has CLI access:

```bash
# Mark the failed migration as rolled back
npx prisma migrate resolve --rolled-back 20260626000007_complete_mentor_system
npx prisma migrate resolve --rolled-back 20260626000008_create_showcase_system

# Then deploy migrations
npx prisma migrate deploy
```

## What Changed in Latest Commits

- **Commit 2e967f8**: Removed invalid PostgreSQL `CREATE TYPE` syntax from both failed migrations
- **Commit f3b8321**: Added two new recovery migrations:
  - `20260626000009_recover_mentor_system_fix`: Recreates mentor system with MySQL-compatible syntax
  - `20260626000010_recover_showcase_system_fix`: Recreates showcase system with MySQL-compatible syntax

## After Fix is Applied

Once the failed migrations are marked as resolved:

1. The app can be redeployed
2. All migrations will apply in order:
   - 20260530184409 through 20260626000008 (but 007-008 will be skipped)
   - 20260626000009 (recreates mentor system - now working)
   - 20260626000010 (recreates showcase system - now working)
3. Database seed will run successfully
4. App will start normally

## Prevention for Future

- Always test database migrations locally or in staging before production
- Use MySQL-compatible syntax:
  - ✅ `ENUM('value1', 'value2')` inline in column definition
  - ❌ `CREATE TYPE` (PostgreSQL only)
- Verify migration SQL manually before pushing to production

---

**Next Step**: Apply one of the fix options above, then trigger a new Railway deployment.
