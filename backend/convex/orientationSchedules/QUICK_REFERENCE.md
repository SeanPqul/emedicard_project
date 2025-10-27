# Orientation Schedules - Structured Time Quick Reference

## 🚀 Quick Start

### Deploy Changes
```bash
cd C:\Em\backend
npx convex deploy
```

### Run Migration
```bash
# Preview (safe, read-only)
npx convex run orientationSchedules/migrateTimeFields:dryRunMigration

# Execute migration
npx convex run orientationSchedules/migrateTimeFields:migrateExistingSchedules
```

## 📊 Schema Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `startMinutes` | `number` | Minutes since midnight (0-1439) | `540` (9:00 AM) |
| `endMinutes` | `number` | Minutes since midnight (0-1439) | `660` (11:00 AM) |
| `durationMinutes` | `number` | Auto-calculated duration | `120` (2 hours) |
| `time` | `string` | Auto-generated display string | `"9:00 AM - 11:00 AM"` |

## ⏰ Time Conversion

### Common Times to Minutes

```typescript
// Morning
6:00 AM  = 360
7:00 AM  = 420
8:00 AM  = 480
9:00 AM  = 540
10:00 AM = 600
11:00 AM = 660

// Afternoon
12:00 PM = 720
1:00 PM  = 780
2:00 PM  = 840
3:00 PM  = 900
4:00 PM  = 960
5:00 PM  = 1020
```

### Convert Manually

**Time to Minutes:**
```typescript
const minutes = hours * 60 + mins;
// 2:30 PM = 14 * 60 + 30 = 870
```

**Minutes to Time:**
```typescript
const hours = Math.floor(minutes / 60);
const mins = minutes % 60;
// 870 = 14 hours 30 minutes = 2:30 PM
```

## ✅ Validation Rules

- ✅ `0 <= startMinutes < 1440`
- ✅ `0 <= endMinutes < 1440`
- ✅ `startMinutes < endMinutes`
- ✅ `duration >= 30` (min)
- ✅ `duration <= 480` (max 8 hours)

## 🛠️ Common Tasks

### Create Schedule (Web Admin)
- Two time inputs automatically handle conversion
- Validation and preview work out of the box
- No code changes needed

### Create Schedule (Backend)
```typescript
await createSchedule({
  date: timestamp,
  startMinutes: 540,   // 9:00 AM
  endMinutes: 660,     // 11:00 AM
  venue: { ... },
  totalSlots: 25,
  // time, durationMinutes auto-generated
});
```

### Configure Auto-Create
Edit `autoCreateSchedulesHandler.ts`:

```typescript
const DEFAULT_CONFIG = {
  timeSlots: [
    { startMinutes: 540, endMinutes: 660 },   // 9-11 AM
    { startMinutes: 840, endMinutes: 960 },   // 2-4 PM
  ],
  // ...
};
```

## 🐛 Troubleshooting

### Migration Errors
```bash
# Check which schedules would fail
npx convex run orientationSchedules/migrateTimeFields:dryRunMigration
```

### Check Existing Data
```bash
# View tables in Convex dashboard
https://dashboard.convex.dev
# Navigate to: Data > orientationSchedules
```

### Reset Migration (if needed)
The migration script is idempotent - just re-run it:
```bash
npx convex run orientationSchedules/migrateTimeFields:migrateExistingSchedules
```

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema definition |
| `mutations.ts` | Create/update/delete schedules |
| `timeUtils.ts` | Time conversion helpers |
| `migrateTimeFields.ts` | Migration script |
| `autoCreateSchedulesHandler.ts` | Auto-schedule creation |
| `MIGRATION_GUIDE.md` | Full migration guide |

## 🎯 Next Steps

1. ✅ Deploy schema changes
2. ✅ Run dry run migration
3. ✅ Run actual migration
4. ✅ Test in web admin
5. ✅ Test in mobile app
6. ⏳ Make fields required (future)

## 💡 Tips

- **Always run dry run first** to preview changes
- **Migration is idempotent** - safe to re-run
- **Fields are optional** - old code still works
- **Time string auto-generated** - consistent format
- **Mobile app unchanged** - uses generated string
- **Web admin unchanged** - already compatible

## 🔗 Related Docs

- Full guide: `MIGRATION_GUIDE.md`
- Summary: `C:\Em\STRUCTURED_TIME_MIGRATION_SUMMARY.md`
- Time utilities: `timeUtils.ts`
