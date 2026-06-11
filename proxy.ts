import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
export { auth as proxy };
export default auth;

export const config = {
  // Guard all pages except API routes, static files, images, etc.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
};
