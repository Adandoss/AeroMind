import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as "STUDENT" | "ADMIN";
        session.user.id = token.id as string;
      }
      return session;
    },
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
        const destination = auth.user?.role === "ADMIN" ? "/admin/courses" : "/dashboard";
        return Response.redirect(new URL(destination, nextUrl));
      }
      return true;
    },
  },
  providers: [], // Populated with providers in auth.ts
} satisfies NextAuthConfig;
