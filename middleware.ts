import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests - authentication is handled client-side
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
