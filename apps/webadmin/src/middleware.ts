import { api } from '@/convex/_generated/api'; // Correct path to generated Convex API using alias
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { NextResponse } from 'next/server';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)', // Protect the dashboard and all its sub-pages
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // Await the auth function call
  if (userId && isDashboardRoute(req)) {
    // Check if user exists (for future middleware logic if needed)
    await convex.query(api.superAdmin.queries.getSuperAdminDetails, { clerkId: userId });

    // Removed the automatic redirect - Super Admins can now access the dashboard
    // This allows super admins to oversee all applications and admin activities
    // They can navigate between /super-admin and /dashboard as needed
  }
  // Allow the request to continue
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
