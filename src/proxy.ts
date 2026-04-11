import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";
import { routes } from "./routes";

export default async function proxy(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const { pathname } = req.nextUrl;
  const isLoggedIn = !!session;

  const isRoot = pathname === "/";
  const isOnDashboard = pathname.startsWith(routes.dashboard.root());
  const isOnAdmin = pathname.startsWith(routes.admin.root());
  const isOnSignin = pathname.startsWith(routes.auth.signIn());
  const isOnGoodbye = pathname.startsWith(routes.auth.goodbye());
  const isOnDeleteAccount = pathname.startsWith(routes.auth.deleteAccount());
  const isOnCheckIn = pathname.startsWith(routes.checkIn());

  const isOnAuthRequiredPages = isOnDashboard || isOnDeleteAccount || isOnAdmin || isOnCheckIn;
  const isOnAuthRestrictedPages = isOnSignin || isOnGoodbye;

  // Root path: redirect to dashboard if logged in, otherwise to sign-in
  if (isRoot) {
    return NextResponse.redirect(
      new URL(isLoggedIn ? routes.dashboard.root() : routes.auth.signIn(), req.nextUrl),
    );
  }

  // Auth-required pages: must be logged in
  if (isOnAuthRequiredPages && !isLoggedIn) {
    const signInUrl = new URL(routes.auth.signIn(), req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // Pages restricted for authenticated users (e.g. sign-in, goodbye)
  if (isOnAuthRestrictedPages && isLoggedIn) {
    return NextResponse.redirect(new URL(routes.dashboard.root(), req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
