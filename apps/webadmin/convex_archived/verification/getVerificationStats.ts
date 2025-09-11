import { query } from "../_generated/server";
import { v } from "convex/values";

export const getVerificationStatsQuery = query({
  args: { healthCardId: v.id("healthCards") },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("verificationLogs")
      .withIndex("by_health_card", (q) => q.eq("healthCardId", args.healthCardId))
      .collect();

    const totalScans = logs.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = logs.filter(log => log.scannedAt >= today.getTime()).length;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);
    const weekScans = logs.filter(log => log.scannedAt >= lastWeek.getTime()).length;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setHours(0, 0, 0, 0);
    const monthScans = logs.filter(log => log.scannedAt >= lastMonth.getTime()).length;

    return {
      totalScans,
      todayScans,
      weekScans,
      monthScans,
      lastScanned: totalScans > 0 ? Math.max(...logs.map(log => log.scannedAt)) : null,
    };
  },
});


// @deprecated - Use getVerificationStatsQuery instead. This alias will be removed in a future release.
export const getVerificationStats = getVerificationStatsQuery;
