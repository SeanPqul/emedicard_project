import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

// Query to get applicants who need orientation scheduling
export const getApplicantsForScheduling = query({
  args: {},
  handler: async (ctx) => {
    const foodHandlerCategoryId = "n973hn7hpwzxkkgbbtddez08eh7p85tq" as Id<"jobCategories">; // Hardcoded ID for "Food Handler"

    // Fetch applications with "For Orientation" status for the specific job category
    const applications = await ctx.db
      .query("applications")
      .filter((q) =>
        q.and(
          q.eq(q.field("applicationStatus"), "For Orientation"),
          q.eq(q.field("jobCategoryId"), foodHandlerCategoryId)
        )
      )
      .collect();

    // Join with user data to get applicant details
    const applicantsWithDetails = await Promise.all(
      applications.map(async (application) => {
        const user = await ctx.db.get(application.userId);
        return {
          ...application,
          applicantName: user?.fullname ?? "Unknown Applicant",
          applicantEmail: user?.email ?? "N/A",
        };
      })
    );

    return applicantsWithDetails;
  },
});
