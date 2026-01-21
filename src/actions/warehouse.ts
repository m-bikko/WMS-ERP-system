'use server';

import connectDB from '@/lib/db';
import Warehouse from '@/models/Warehouse';

import { getCurrentUser } from '@/lib/auth';

export async function getWarehouses() {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectDB();
    const warehouses = await Warehouse.find({ owner: user.id }).sort({ name: 1 }).lean();
    return warehouses.map((w) => ({
        id: (w._id as any).toString(),
        name: w.name,
        code: w.code,
        address: w.address,
    }));
}

export async function createWarehouse(data: any) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    await connectDB();
    const newWarehouse = new Warehouse({ ...data, owner: user.id });
    await newWarehouse.save();
    return { success: true };
}
