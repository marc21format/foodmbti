import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const isEmbedded = requestUrl.searchParams.get("embed") === "1";
  const loginPath = isEmbedded ? "/admin/login?embed=1" : "/admin/login";

  const response = NextResponse.redirect(new URL(loginPath, request.url));
  response.cookies.set("fd_admin", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
