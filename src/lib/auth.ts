import { cookies } from 'next/headers';
import connectDB from './db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { encrypt, getSession } from './session';

export { logout, getSession } from './session';

export async function login(formData: FormData) {
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    await connectDB();

    // 1. Check for Admin via Environment Variables (Fallback/Super Admin)
    if (
        login === process.env.ADMIN_LOGIN &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const session = await encrypt({ user: 'admin', role: 'admin', userId: '000000000000000000000000', expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
        (await cookies()).set('wms_session', session, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        return true;
    }

    // 2. Check Database for Users (Clients & Created Admins)
    const user = await User.findOne({ username: login });
    if (user && await bcrypt.compare(password, user.password)) {
        const session = await encrypt({
            user: user.username,
            role: user.role,
            userId: user._id.toString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        (await cookies()).set('wms_session', session, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true });
        return true;
    }

    return false;
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;

    let userId = session.userId;
    // Fix for legacy session with invalid ObjectId
    if (userId === 'super-admin') {
        userId = '000000000000000000000000';
    }

    return {
        id: userId,
        username: session.user,
        role: session.role
    };
}
