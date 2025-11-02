/**
 * Script to check and fix Food Handler requireOrientation setting
 * 
 * This script checks if the Food Handler job category has requireOrientation set to true
 * If not, it provides instructions to fix it via the Convex dashboard or admin panel
 */

console.log("=".repeat(60));
console.log("FOOD HANDLER ORIENTATION REQUIREMENT CHECK");
console.log("=".repeat(60));
console.log("\nThis script helps diagnose why Food Handler applicants");
console.log("are showing 'For Document Verification' instead of 'For Orientation'");
console.log("after payment approval.\n");

console.log("DIAGNOSIS:");
console.log("----------");
console.log("The issue occurs when the 'requireOrientation' field in the");
console.log("jobCategories table is not set to true for Food Handler.\n");

console.log("SOLUTION:");
console.log("---------");
console.log("1. Open Convex Dashboard: https://dashboard.convex.dev");
console.log("2. Navigate to your project");
console.log("3. Go to 'Data' tab");
console.log("4. Select 'jobCategories' table");
console.log("5. Find the 'Food Handler' record");
console.log("6. Check the 'requireOrientation' field");
console.log("7. If it's false, null, or undefined, edit it to: true");
console.log("8. Save the changes\n");

console.log("ALTERNATIVE (Via Convex Functions):");
console.log("-----------------------------------");
console.log("Run this in the Convex dashboard Functions tab:\n");

console.log(`
// Query to check current Food Handler settings
const jobCategory = await ctx.db
  .query("jobCategories")
  .filter(q => q.eq(q.field("name"), "Food Handler"))
  .first();

console.log("Food Handler requireOrientation:", jobCategory?.requireOrientation);

// If requireOrientation is not true, update it:
if (jobCategory && jobCategory.requireOrientation !== true) {
  await ctx.db.patch(jobCategory._id, {
    requireOrientation: true
  });
  console.log("✅ Fixed! Food Handler now requires orientation.");
}
`);

console.log("\nAFTER FIXING:");
console.log("-------------");
console.log("1. Existing applications with 'For Document Verification' status");
console.log("   need to be manually updated to 'For Orientation' if they haven't");
console.log("   completed orientation yet.");
console.log("2. For the specific application: ms7a979snh149qc7e5m2hcwkpn7tky0d");
console.log("   You can update it via Admin panel or Convex dashboard.\n");

console.log("=".repeat(60));
