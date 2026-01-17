'use server';

import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function getCategories() {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return categories.map((c) => ({
        id: (c._id as any).toString(),
        name: c.name,
        parent: c.parent ? (c.parent as any).toString() : null,
    }));
}

export async function createCategory(name: string, parentId: string | null) {
    await connectDB();
    const category = new Category({
        name,
        parent: parentId || null,
    });
    await category.save();
    return { success: true };
}
