import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('wms_session')?.value;

    // Decrypt session
    const payload = session ? await decrypt(session) : null;

    const isLoginPage = request.nextUrl.pathname === '/login';

    if (!payload && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (payload && isLoginPage) {
        return NextResponse.redirect(new URL('/products', request.url));
    }

    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/products', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
