// Unified auth config supporting both mobile and webadmin projects
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || process.env.EXPO_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ]
};