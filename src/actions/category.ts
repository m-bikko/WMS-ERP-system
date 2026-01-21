'use server';

import connectDB from '@/lib/db';
import Category from '@/models/Category';

import { getCurrentUser } from '@/lib/auth';

export async function getCategories() {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectDB();
    const categories = await Category.find({ owner: user.id }).sort({ name: 1 }).lean();
    return categories.map((c) => ({
        id: (c._id as any).toString(),
        name: c.name,
        parent: c.parent ? (c.parent as any).toString() : null,
    }));
}

export async function createCategory(name: string, parentId: string | null) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    await connectDB();
    const category = new Category({
        name,
        parent: parentId || null,
        owner: user.id,
    });
    await category.save();
    return { success: true };
}
