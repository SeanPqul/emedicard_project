# Automated Orientation Schedule Creation 🤖

This feature automatically creates orientation schedules for the upcoming week every Sunday night.

## 🎯 How It Works

1. **Trigger**: Every Sunday at 11:00 PM UTC
2. **Creates**: Schedules for next Monday through Friday
3. **Time Slots**: 
   - Morning: 9:00 AM - 11:00 AM
   - Afternoon: 2:00 PM - 4:00 PM
4. **Total**: 10 schedules per week (5 days × 2 time slots)

## ⚙️ Configuration

### Customize Default Settings

Edit the `DEFAULT_CONFIG` object in `autoCreateSchedulesHandler.ts`:

```typescript
const DEFAULT_CONFIG = {
  timeSlots: [
    "9:00 AM - 11:00 AM",
    "2:00 PM - 4:00 PM",
    // Add more time slots as needed
  ],
  
  venue: {
    name: "City Health Office",
    address: "123 Health St., Downtown, Metro Manila",
    capacity: 30,
  },
  
  totalSlots: 25,
  
  instructor: {
    name: "Dr. Maria Santos",
    designation: "Health Inspector",
  },
  
  notes: "Please bring valid ID and application reference number.",
};
```

### Adjust Schedule Time

Edit the cron job settings in `crons.ts`:

```typescript
crons.weekly(
  "auto-create-weekly-orientation-schedules",
  { 
    hourUTC: 23,           // Change this (0-23)
    minuteUTC: 0,          // Change this (0-59)
    dayOfWeek: "sunday"    // Or: monday, tuesday, etc.
  },
  internal.orientationSchedules.autoCreateSchedulesHandler.createNextWeekSchedules
);
```

## 🧪 Testing

### Option 1: Test via Convex Dashboard

1. Open your Convex Dashboard
2. Go to **Functions**
3. Find `orientationSchedules/autoCreateSchedulesHandler:testAutoCreate`
4. Click **Run** (no arguments needed)
5. Check the **Logs** tab for results

### Option 2: Manual Trigger from Code

In Convex Dashboard, run:

```javascript
api.internal.orientationSchedules.autoCreateSchedulesHandler.createNextWeekSchedules({})
```

## 📊 Features

✅ **Smart Duplicate Detection**: Skips dates that already have schedules  
✅ **Weekday Only**: Only creates Monday-Friday schedules  
✅ **Detailed Logging**: See exactly what was created/skipped  
✅ **Safe**: Won't overwrite existing schedules  
✅ **Flexible**: Easy to customize time slots and venues  

## 🔍 Monitoring

### Check Scheduled Jobs Status

In Convex Dashboard → **Schedules** tab, you'll see:
- Job name: `auto-create-weekly-orientation-schedules`
- Next run time
- Last run status
- Execution logs

### View Logs

After each execution, check the **Logs** tab for:
```
Creating schedules starting from: Mon Oct 27 2025
✅ Created 10 new schedules
⏭️  Skipped 0 existing schedules
```

## 🛠️ Troubleshooting

### Schedules Not Being Created

1. **Check Cron Job Status**: Dashboard → Schedules
2. **Verify Timezone**: Adjust `hourUTC` for your local time
3. **Check Logs**: Look for errors in Convex Dashboard
4. **Test Manually**: Run `testAutoCreate` function

### Wrong Time Slots

1. Edit `DEFAULT_CONFIG.timeSlots` in `autoCreateSchedulesHandler.ts`
2. Deploy changes: `npx convex dev` or `npx convex deploy`

### Wrong Venue

1. Edit `DEFAULT_CONFIG.venue` in `autoCreateSchedulesHandler.ts`
2. Deploy changes

## 📅 Example Schedule

If today is **Sunday, October 20, 2025**, the cron job will create:

| Date | Day | Time Slot |
|------|-----|-----------|
| Oct 27 | Monday | 9:00 AM - 11:00 AM |
| Oct 27 | Monday | 2:00 PM - 4:00 PM |
| Oct 28 | Tuesday | 9:00 AM - 11:00 AM |
| Oct 28 | Tuesday | 2:00 PM - 4:00 PM |
| Oct 29 | Wednesday | 9:00 AM - 11:00 AM |
| Oct 29 | Wednesday | 2:00 PM - 4:00 PM |
| Oct 30 | Thursday | 9:00 AM - 11:00 AM |
| Oct 30 | Thursday | 2:00 PM - 4:00 PM |
| Oct 31 | Friday | 9:00 AM - 11:00 AM |
| Oct 31 | Friday | 2:00 PM - 4:00 PM |

## 🚀 Future Enhancements

Possible improvements:
- [ ] Store configuration in database instead of code
- [ ] Multiple venue support
- [ ] Holiday detection (skip holidays)
- [ ] Capacity adjustment based on demand
- [ ] Email notifications when schedules are created
- [ ] UI for managing cron job settings

## 💡 Tips

1. **First Time Setup**: Run `testAutoCreate` manually to create your first batch
2. **Timezone**: Philippines is UTC+8, so set `hourUTC: 15` for 11 PM Manila time
3. **Adjustments**: Always test with `testAutoCreate` before relying on automatic creation
4. **Monitoring**: Check the Schedules tab weekly to ensure it's running

## 📞 Support

If you encounter issues:
1. Check Convex Dashboard logs
2. Verify cron job is active in Schedules tab
3. Test manually with `testAutoCreate`
4. Review configuration in `autoCreateSchedulesHandler.ts`
