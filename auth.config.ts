import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLearn = nextUrl.pathname.startsWith("/learn");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isOnDashboard || isOnLearn || isOnAdmin) {
        if (isLoggedIn) {
          // If trying to access admin routes, verify ADMIN role
          if (isOnAdmin && auth.user?.role !== "ADMIN") {
            // Redirect to dashboard if not admin
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
          return true;
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        // Redirect logged-in users away from auth pages to dashboard
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Populated with providers in auth.ts
} satisfies NextAuthConfig;
