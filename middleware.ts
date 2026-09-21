import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "dev-only-change-me-min-32-chars-long-secret",
});

export const config = {
  matcher: ["/app/:path*", "/onboarding"],
};
