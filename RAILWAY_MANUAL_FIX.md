# Railway Database Manual Fix - Required Before Redeployment

## Current Status

The migrations have been fixed in the code repository with proper MySQL syntax. However, Railway's database still has a record of the failed migrations that need to be cleaned up.

**Latest commit**: c75f075 - Has corrected migrations with MySQL-compatible syntax

## What You Must Do Now

You need to manually clean up the failed migration records from the Railway MySQL database. Follow these steps:

### Step 1: Access Railway Dashboard
1. Go to https://railway.app
2. Open your project
3. Click on the **MySQL** plugin
4. Click **Database** tab
5. Look for the **Connect** button - you'll use this connection info

### Step 2: Connect to Database
You have two options:

#### Option A: Using Railway's Web UI (Easiest)
1. In MySQL plugin, click **"Canvas"** or **"Database"** tab
2. Look for a "Query" or "Connect" button
3. Open a SQL query editor

#### Option B: Using Terminal/MySQL Client
```bash
mysql -h mysql.railway.internal -u root -p railway
# Password is shown in Railway MySQL plugin variables
```

### Step 3: Execute Cleanup SQL

Run this SQL to clean up the failed migrations:

```sql
-- Check what failed migrations exist
SELECT migration_name, started_at, finished_at FROM `_prisma_migrations` 
WHERE migration_name LIKE '%20260626000007%' OR migration_name LIKE '%20260626000008%';

-- Delete the failed migration records
DELETE FROM `_prisma_migrations` 
WHERE migration_name = '20260626000007_complete_mentor_system' 
   OR migration_name = '20260626000008_create_showcase_system';

-- Drop any partially created tables
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

-- Verify cleanup was successful
SELECT COUNT(*) as unfinished_migrations FROM `_prisma_migrations` 
WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL;
-- Should return 0
```

### Step 4: Redeploy on Railway

After cleanup:
1. Go back to Railway dashboard
2. Go to **Deployments** tab
3. Click the **Deploy** button to trigger a new deployment
4. Watch the logs - you should see:
   ```
   26 migrations found in prisma/migrations
   Applying migration 20260626000007_complete_mentor_system
   Applying migration 20260626000008_create_showcase_system
   ✓ Applying migration 20260626000007_complete_mentor_system
   ✓ Applying migration 20260626000008_create_showcase_system
   🌱 Seeding database...
   ```

## What Changed in Code

✅ Removed broken PostgreSQL-style migrations
✅ Replaced with MySQL-compatible migrations  
✅ Both mentor and showcase systems will be created correctly
✅ All enum values use inline MySQL syntax

## Expected Result After Fix

- ✅ All 26 migrations apply successfully
- ✅ Database schema fully created
- ✅ Seed data populates tables
- ✅ App starts on Next.js server
- ✅ No more P3009 errors

---

**Status**: Ready to deploy once database cleanup is complete

**Next step**: Execute the SQL cleanup above, then trigger Railway redeployment
