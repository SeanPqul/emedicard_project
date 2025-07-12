# 🌱 eMediCard Database Seeding Guide

This guide explains how to seed your eMediCard database with realistic fake data using Faker.js.

## 🚀 Quick Start

1. **Make sure Convex is running:**
   ```bash
   npx convex dev
   ```

2. **Seed the entire database:**
   ```bash
   npm run seed:all
   ```

3. **Check what was created:**
   ```bash
   npm run seed:stats
   ```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run seed:all` | Seeds ALL tables with comprehensive fake data |
| `npm run seed:job-categories` | Seeds only job categories and document requirements |
| `npm run seed:clear` | Clears ALL data from database (except users) |
| `npm run seed:stats` | Shows database statistics and sample data |

## 📊 What Gets Seeded

### 🏷️ Job Categories (3 items)
- **Food Handler** - Yellow card, requires orientation
- **Non-Food Worker** - Green card, no orientation  
- **Skin-to-Skin Contact** - Pink card, no orientation

### 📄 Document Requirements (17 items)
- Basic requirements for all categories
- Additional requirements for specific job types
- Proper field mappings to the requirements table

### 📝 Forms (15 items)
- Realistic job positions by category
- Real Philippine company names
- Various civil status options

### 📎 Requirements (15 items)
- Fake storage IDs for uploaded documents
- Optional documents based on job category

### 💰 Payments (15 items)
- Realistic payment amounts (₱45-65)
- Different payment methods (GCash, Maya, etc.)
- Various payment statuses

### 📋 Application Forms (15 items)
- Different application statuses
- Realistic approval/rejection dates
- Sample remarks for rejected applications

### 🎓 Orientations (5 items)
- Only for food handlers (require orientation)
- Future scheduled dates
- QR codes for attendance tracking

### 🆔 Health Cards (10 items)
- Only for approved applications
- 1-year validity periods
- Unique verification tokens

### 🔔 Notifications (25 items)
- Various notification types
- Realistic messages
- Mixed read/unread status

### 📊 Verification Logs (20 items)
- QR code scan history
- Realistic user agents and IP addresses
- Recent scan timestamps

## 🎯 Realistic Sample Data

The seed script creates realistic data including:

- **Companies**: McDonald's, Jollibee, SM Malls, Ayala, BDO, Security Bank
- **Positions**: Chef, Security Guard, Massage Therapist, Barista, etc.
- **Payment Methods**: GCash, Maya, Barangay Hall, City Hall
- **Statuses**: All possible application and payment statuses
- **Notifications**: Context-appropriate messages for each type

## 🔧 Usage Examples

### First Time Setup
```bash
# Start Convex
npx convex dev

# Seed everything
npm run seed:all

# Verify data was created
npm run seed:stats
```

### Reset and Re-seed
```bash
# Clear all data
npm run seed:clear

# Seed fresh data
npm run seed:all
```

### Check Database State
```bash
# See how many records exist in each table
npm run seed:stats
```

## ⚠️ Important Notes

1. **Development Only**: This is for development/testing only
2. **Fake User IDs**: Since we don't seed users, fake user IDs are generated
3. **Storage IDs**: Document references use fake storage IDs starting with `storage_`
4. **Idempotent**: Running seed scripts multiple times won't create duplicates
5. **Referential Integrity**: All foreign key relationships are maintained

## 🐛 Troubleshooting

### "Function not found" error
Make sure Convex dev server is running:
```bash
npx convex dev
```

### Data not appearing in app
Check if your queries are working and user authentication is set up correctly.

### Want to start fresh
Clear and re-seed:
```bash
npm run seed:clear
npm run seed:all
```

## 📁 File Structure

```
convex/seed/
├── README.md              # Detailed documentation
├── seedAllTables.ts       # Comprehensive seed script  
├── seedData.ts            # Original job categories seed
├── clearDatabase.ts       # Database cleanup script
└── testSeed.ts           # Database statistics query
```

## 🎉 Success Output

When you run `npm run seed:all`, you should see:

```
Starting database seed...
Seeding job categories...
Seeding document requirements...
Seeding forms...
Seeding requirements...
Seeding payments...
Seeding application forms...
Seeding orientations...
Seeding health cards...
Seeding notifications...
Seeding verification logs...
✅ Database seeded successfully!
Created:
- 3 job categories
- 17 document requirements
- 15 forms
- 15 requirements
- 15 payments
- 15 application forms
- 5 orientations
- 10 health cards
- 25 notifications
- 20 verification logs
```

## 🔗 Next Steps

After seeding:
1. Test your app with the fake data
2. Verify dashboard statistics show correctly
3. Test application flows with seeded data
4. Check notification functionality
5. Verify QR code scanning works with health cards

Happy coding! 🚀
