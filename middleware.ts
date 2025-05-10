import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Protect dashboard and other authenticated routes
  if (!token && (
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/profile') || 
    url.pathname.startsWith('/friends') || 
    url.pathname.startsWith('/contests') || 
    url.pathname.startsWith('/leaderboard')
  )) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login/signup pages
  if (token && (
    url.pathname.startsWith('/signup') || 
    url.pathname.startsWith('/login') || 
    url.pathname === '/'
  )) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/',
    '/dashboard/:path*',
    '/profile/:path*',
    '/friends/:path*',
    '/contests/:path*',
    '/leaderboard/:path*',
  ]
}