# Database Seeding Guide

This guide explains how to seed the eMediCard database with test data using Faker.js.

## Available Commands

### Seed All Data
```bash
npm run seed:all
```
This command will:
1. Create job categories (Food Handler, Non-Food Worker, Skin-to-Skin Contact)
2. Create document requirements for each job category
3. Create 10 test users with fake data
4. Create application forms for each user
5. Skip requirements creation (storage IDs require client-side file uploads)
6. Create payment records
7. Create application form statuses
8. Create orientations for food handlers
9. Create health cards for approved applications
10. Create notifications
11. Create verification logs

### Clear All Data
```bash
npm run seed:clear
```
This command will:
- Clear all test data from the database (default: only fake data)
- Only removes test users (with clerkId starting with "test_" or email containing "@example.com")
- Removes all related data (forms, payments, etc.)
- Preserves job categories and document requirements as reference data

To clear ALL data including real user data:
```bash
npx convex run seed:clear --onlyFakeData false
```

## Schema Overview

The seeding process follows the database schema:

- **users**: Test users with fake personal information
- **jobCategory**: Three types of health cards (Yellow, Green, Pink)
- **documentRequirements**: Required documents for each job category
- **forms**: Application forms linked to users and job categories
- **requirements**: Skipped (requires actual file uploads through client)
- **payments**: Payment records for applications
- **applicationForms**: Status tracking for applications
- **orientations**: Scheduled orientations for food handlers
- **healthCards**: Issued health cards for approved applications
- **notifications**: Various notification types for users
- **verificationLogs**: QR scan logs for health cards

## Notes

- **Requirements table limitation**: Cannot be seeded because Convex storage requires client-side file uploads. Storage IDs cannot be created directly in server-side seed scripts.
- Test users have clerkId starting with "test_" to distinguish them from real users
- All dates and timestamps are generated randomly within reasonable ranges
- Health cards are only created for approved applications
- Orientations are only created for Food Handler category

## Customization

To modify the seeding data, edit the `convex/seed.ts` file. You can adjust:
- Number of users created
- Types of organizations and positions
- Payment amounts and methods
- Notification messages
- Date ranges for various timestamps
