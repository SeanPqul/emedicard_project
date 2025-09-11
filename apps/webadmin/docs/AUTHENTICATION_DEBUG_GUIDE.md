# 🔧 Authentication System Debug Guide

## System Overview

Your eMediCard admin system uses this authentication flow:

```
User Login → Clerk Authentication → Webhook → Convex Database → Dashboard Access
```

## Current Issues Analysis

### Issue 1: User exists in Clerk but not in Convex
- **Problem**: User can authenticate with Clerk but webhook didn't create user record
- **Solution**: Manual user creation or webhook debugging

### Issue 2: User exists in Convex but not in Admins table
- **Problem**: User is authenticated but doesn't have admin privileges
- **Solution**: Add user to admins table

### Issue 3: Webhook not firing or failing
- **Problem**: New users aren't being synced from Clerk to Convex
- **Solution**: Fix webhook configuration

## Debugging Steps

### Step 1: Check Current Data State
1. Check Clerk dashboard for user existence
2. Check Convex `users` table
3. Check Convex `admins` table
4. Verify webhook logs

### Step 2: Manual User Creation (If needed)
1. Create user in Convex users table
2. Add user to admins table
3. Test login

### Step 3: Fix Webhook (If needed)
1. Verify webhook URL configuration
2. Check webhook secret
3. Test webhook manually
4. Debug webhook code

### Step 4: Test Complete Flow
1. Create new test user
2. Verify webhook creates user
3. Manually promote to admin
4. Test admin login

## Quick Fixes Available

1. **Immediate Fix**: Manual admin creation
2. **Proper Fix**: Webhook debugging and repair
3. **Prevention**: Automated admin seeding script
