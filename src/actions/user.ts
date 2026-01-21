'use server';

import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createUser(prevState: any, formData: FormData) {
    const currentUser = await getCurrentUser();

    // Only Admin can create users
    if (!currentUser || currentUser.role !== 'admin') {
        return { error: 'Unauthorized. Only admins can create users.' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string || 'client';

    if (!username || !password) {
        return { error: 'Username and password are required.' };
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return { error: 'Username already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashedPassword,
            role
        });

        revalidatePath('/users');
        return { success: true };
    } catch (e: any) {
        console.error('Create User Error:', e);
        return { error: 'Failed to create user.' };
    }
}

export async function getUsers() {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return [];

    try {
        await connectDB();
        const users = await User.find({}).sort({ createdAt: -1 });
        return users.map(u => ({
            id: u._id.toString(),
            username: u.username,
            role: u.role,
            createdAt: u.createdAt
        }));
    } catch (e) {
        console.error('Get Users Error:', e);
        return [];
    }
}
