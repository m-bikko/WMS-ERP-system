'use server';

import connectDB from '@/lib/db';
import Warehouse from '@/models/Warehouse';

export async function getWarehouses() {
    await connectDB();
    const warehouses = await Warehouse.find({}).sort({ name: 1 }).lean();
    return warehouses.map((w) => ({
        id: (w._id as any).toString(),
        name: w.name,
        code: w.code,
        address: w.address,
    }));
}

export async function createWarehouse(data: any) {
    await connectDB();
    const newWarehouse = new Warehouse(data);
    await newWarehouse.save();
    return { success: true };
}
