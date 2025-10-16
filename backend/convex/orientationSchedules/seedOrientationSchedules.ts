import { mutation } from "../_generated/server";

/**
 * Seed orientation schedules with test data
 * Run this manually in Convex dashboard or via CLI to populate test data
 * 
 * Usage: 
 * 1. Go to Convex Dashboard -> Functions
 * 2. Run: orientationSchedules.seedOrientationSchedules()
 */
export const seedOrientationSchedules = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    // Check if schedules already exist
    const existing = await ctx.db
      .query("orientationSchedules")
      .take(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: "Schedules already exist. Delete them first if you want to reseed.",
        count: 0,
      };
    }

    // Create sample schedules for the next 4 weeks
    const schedules = [
      // Week 1 - Multiple sessions
      {
        date: now + (3 * oneDay), // 3 days from now
        time: "9:00 AM - 11:00 AM",
        venue: {
          name: "City Health Office",
          address: "123 Health St., Downtown, Metro Manila",
          capacity: 30,
        },
        availableSlots: 12,
        totalSlots: 30,
        isAvailable: true,
        instructor: {
          name: "Dr. Maria Santos",
          designation: "Health Inspector",
        },
        notes: "Please bring valid ID and application reference number",
        createdAt: now,
      },
      {
        date: now + (5 * oneDay), // 5 days from now
        time: "2:00 PM - 4:00 PM",
        venue: {
          name: "Barangay Hall Community Center",
          address: "456 Community Ave., Barangay Center",
          capacity: 25,
        },
        availableSlots: 8,
        totalSlots: 25,
        isAvailable: true,
        instructor: {
          name: "Mr. Juan Cruz",
          designation: "Senior Health Officer",
        },
        notes: "Afternoon session - cooler venue",
        createdAt: now,
      },
      
      // Week 2 - Various slots
      {
        date: now + oneWeek + oneDay, // 8 days from now
        time: "10:00 AM - 12:00 PM",
        venue: {
          name: "Main City Hall",
          address: "789 Government Complex, City Center",
          capacity: 50,
        },
        availableSlots: 35,
        totalSlots: 50,
        isAvailable: true,
        instructor: {
          name: "Ms. Ana Reyes",
          designation: "Health Program Coordinator",
        },
        createdAt: now,
      },
      {
        date: now + oneWeek + (2 * oneDay), // 9 days from now
        time: "1:00 PM - 3:00 PM",
        venue: {
          name: "District Health Center",
          address: "321 Medical Plaza, District 2",
          capacity: 20,
        },
        availableSlots: 2,
        totalSlots: 20,
        isAvailable: true,
        notes: "Limited slots - book early!",
        createdAt: now,
      },
      
      // Week 3
      {
        date: now + (2 * oneWeek), // 14 days from now
        time: "9:30 AM - 11:30 AM",
        venue: {
          name: "City Health Office",
          address: "123 Health St., Downtown, Metro Manila",
          capacity: 30,
        },
        availableSlots: 18,
        totalSlots: 30,
        isAvailable: true,
        instructor: {
          name: "Dr. Maria Santos",
          designation: "Health Inspector",
        },
        createdAt: now,
      },
      {
        date: now + (2 * oneWeek) + (3 * oneDay), // 17 days from now
        time: "3:00 PM - 5:00 PM",
        venue: {
          name: "Barangay Hall Community Center",
          address: "456 Community Ave., Barangay Center",
          capacity: 25,
        },
        availableSlots: 15,
        totalSlots: 25,
        isAvailable: true,
        createdAt: now,
      },
      
      // Week 4 - Full and partially full
      {
        date: now + (3 * oneWeek), // 21 days from now
        time: "8:00 AM - 10:00 AM",
        venue: {
          name: "Main City Hall",
          address: "789 Government Complex, City Center",
          capacity: 40,
        },
        availableSlots: 0,
        totalSlots: 40,
        isAvailable: false,
        instructor: {
          name: "Ms. Ana Reyes",
          designation: "Health Program Coordinator",
        },
        notes: "FULLY BOOKED - This session is for testing full capacity",
        createdAt: now,
      },
      {
        date: now + (3 * oneWeek) + (2 * oneDay), // 23 days from now
        time: "11:00 AM - 1:00 PM",
        venue: {
          name: "District Health Center",
          address: "321 Medical Plaza, District 2",
          capacity: 30,
        },
        availableSlots: 22,
        totalSlots: 30,
        isAvailable: true,
        createdAt: now,
      },
    ];

    // Insert all schedules
    const insertedIds = [];
    for (const schedule of schedules) {
      const id = await ctx.db.insert("orientationSchedules", schedule);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: `Successfully created ${schedules.length} orientation schedules`,
      count: schedules.length,
      scheduleIds: insertedIds,
    };
  },
});

/**
 * Clear all orientation schedules (for testing)
 * Use with caution!
 */
export const clearAllSchedules = mutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db
      .query("orientationSchedules")
      .collect();

    for (const schedule of schedules) {
      await ctx.db.delete(schedule._id);
    }

    return {
      success: true,
      message: `Deleted ${schedules.length} schedules`,
      count: schedules.length,
    };
  },
});
