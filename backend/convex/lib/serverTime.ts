import { query } from "../_generated/server";
import { v } from "convex/values";
import { getPhilippineTimeComponents } from "./timezone";

/**
 * Internal helper: Calculate PHT midnight timestamp from a given time
 * This is a pure function that can be reused by multiple queries
 */
function calculatePHTMidnight(timestamp: number): number {
  const phtComponents = getPhilippineTimeComponents(timestamp);

  const phtMidnight = new Date(
    Date.UTC(
      phtComponents.year,
      phtComponents.month,
      phtComponents.day,
      0,
      0,
      0,
      0
    )
  );

  // Adjust for timezone offset (PHT is UTC+8, so subtract 8 hours)
  const phtMidnightUTC = phtMidnight.getTime() - (8 * 60 * 60 * 1000);

  return phtMidnightUTC;
}

export const getCurrentServerTime = query({
  handler: async () => {
    return Date.now();
  },
});

export const getCurrentPHTDate = query({
  handler: async () => {
    const now = Date.now();
    return calculatePHTMidnight(now);
  },
});

export const getCurrentPHTTimeComponents = query({
  handler: async () => {
    const now = Date.now();
    return getPhilippineTimeComponents(now);
  },
});

export const isToday = query({
  args: {
    targetDate: v.float64(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const todayPHT = calculatePHTMidnight(now);

    return args.targetDate === todayPHT;
  },
});
