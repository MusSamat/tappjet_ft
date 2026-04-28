import { type NextRequest, NextResponse } from "next/server";

const VALID_LOCALES = new Set(["ru", "kg"]);

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get("tappjet_locale")?.value;

  if (!cookieLocale || !VALID_LOCALES.has(cookieLocale)) {
    const response = NextResponse.next();
    response.cookies.set("tappjet_locale", "ru", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
