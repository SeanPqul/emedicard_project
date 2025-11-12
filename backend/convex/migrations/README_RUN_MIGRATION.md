# How to Run the Application Status Migration

## Problem
Existing applications in the database have the old status "Locked - Max Attempts" which needs to be updated to the professional "Under Administrative Review" status.

## Solution
Run the migration script to update all affected applications.

## Steps to Run Migration

### Option 1: Via Convex Dashboard (Recommended)

1. Open your Convex dashboard: https://dashboard.convex.dev
2. Navigate to your project
3. Go to **Functions** tab
4. Find the function: `migrations:updateLockedApplicationStatus`
5. Click **Run** button
6. The migration will execute and show results

### Option 2: Via CLI

```bash
# From the backend directory
cd C:\Em\backend

# Run the migration using npx convex
npx convex run migrations:updateLockedApplicationStatus
```

### Option 3: Via Code (for development/testing)

You can call this mutation from your admin panel or web admin:

```typescript
import { useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";

// In your component
const runMigration = useMutation(api.migrations.updateLockedApplicationStatus);

// Call it
const result = await runMigration({});
console.log(result);
```

## Expected Output

```
🔄 Starting migration: Update locked application status...
📋 Found 1 applications with old status
✅ Updated application k123abc456def789
✅ Migration complete! Updated 1 applications
```

## What Gets Updated

For each application with status "Locked - Max Attempts":

1. **applicationStatus**: Changed to `"Under Administrative Review"`
2. **adminRemarks**: Updated to replace old terminology with professional text
3. **updatedAt**: Set to current timestamp

## Safety

- ✅ **Safe to run multiple times** - Only updates applications with old status
- ✅ **No data loss** - Only updates status fields
- ✅ **Reversible** - Can manually revert if needed (though not recommended)

## After Migration

1. Refresh your mobile app to see updated status
2. Check that:
   - Application card shows "Under Administrative Review" 
   - Checklist shows payment as current (blocked)
   - Orientation and document verification show as upcoming (blocked)
   - No progression beyond payment step

## Verification

Run a query to check if any applications still have old status:

```sql
-- In Convex dashboard Data tab
applications
  .filter(app => app.applicationStatus === "Locked - Max Attempts")
```

Should return **0 results** after migration.
