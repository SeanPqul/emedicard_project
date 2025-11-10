/**
 * VENUE CONFIGURATION
 * 
 * Default venue and schedule configuration for eMediaCard Orientation Schedules
 * Currently configured for Davao City office - the primary application venue
 * 
 * @since 2025-11-10
 */

export const DEFAULT_VENUE = {
  name: "Magsaysay Complex - Door 7",
  address: "Door 7, Magsaysay Complex, Magsaysay Park, Davao City",
  capacity: 50, // Room's maximum safe capacity
  defaultSlots: 30, // Conservative booking limit for comfortable spacing
};

export const DEFAULT_SCHEDULE_NOTES = 
  "Please bring valid ID and application reference number. Arrive 15 minutes early.";

export const CAPACITY_GUIDANCE = {
  maxCapacity: 50,
  recommendedLimit: 30,
  guidanceMessage: "Room capacity: ~50 people. Recommended booking limit: 30 slots to allow comfortable spacing and accommodate walk-ins.",
};

/**
 * Future-proofing for multi-venue support
 * Add new venues here as business expands
 */
export const VENUES = {
  davao: DEFAULT_VENUE,
  // Example for future expansion:
  // manila: {
  //   name: "Manila Health Office",
  //   address: "123 Health St., Manila",
  //   capacity: 40,
  //   defaultSlots: 25,
  // },
};
