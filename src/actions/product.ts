'use server';

import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function getProducts(categoryId?: string, warehouseId?: string) {
    await connectDB();

    const query: any = {};

    if (categoryId) {
        query.category = categoryId;
    }

    if (warehouseId && warehouseId !== 'all') {
        query.warehouse = warehouseId;
    }

    const products = await Product.find(query)
        .populate('category', 'name')
        .populate('warehouse', 'name')
        .sort({ createdAt: -1 })
        .lean();

    return products.map((p) => ({
        id: (p._id as any).toString(),
        name: p.name,
        article: p.article,
        code: p.code,
        quantity: p.quantity,
        price: p.price,
        photos: p.photos || [],
        categoryId: (p.category as any)?._id?.toString() || (p.category as any)?.toString(), // Handle populated or unpopulated
        categoryName: (p.category as any)?.name || 'Unknown',
        warehouseName: (p.warehouse as any)?.name || 'Unknown',
    }));
}


import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (auto-reads from CLOUDINARY_URL)
cloudinary.config({
    secure: true,
});

export async function createProduct(prevState: any, formData: FormData) {
    // Parsing FormData manually because of complex fields/files
    try {
        await connectDB();

        // 1. Handle Images
        const photos: string[] = [];
        const files = formData.getAll('photos') as File[];

        for (const file of files) {
            if (file.size > 0 && file.type.startsWith('image/')) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Upload to Cloudinary
                const result = await new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'wms-products' }, // Optional folder
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(buffer);
                });

                photos.push(result.secure_url);
            }
        }

        // 2. Parse other fields
        const characteristicsStr = formData.get('characteristics') as string;
        const barcodesStr = formData.get('barcodes') as string;

        let characteristics = {};
        if (characteristicsStr) {
            try { characteristics = JSON.parse(characteristicsStr); } catch { }
        }

        let barcodes = [];
        if (barcodesStr) {
            try { barcodes = JSON.parse(barcodesStr); } catch { }
        }

        const doc = {
            warehouse: formData.get('warehouse'),
            category: formData.get('category'),
            name: formData.get('name'),
            photos: photos,
            description: formData.get('description'),
            article: formData.get('article'),
            code: formData.get('code'),
            externalCode: formData.get('externalCode'),
            price: Number(formData.get('price')),
            discountPrice: formData.get('discountPrice') ? Number(formData.get('discountPrice')) : undefined,
            isDiscountActive: formData.get('isDiscountActive') === 'true',
            country: formData.get('country'),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            minQuantity: Number(formData.get('minQuantity')),
            characteristics,
            barcodes,
        };

        const product = new Product(doc);
        await product.save();
        return { success: true, id: product._id.toString() };

    } catch (e: any) {
        console.error('Create Product Error:', e);
        return { error: e.message || 'Failed to create product' };
    }
}

export async function deleteProduct(id: string) {
    try {
        await connectDB();
        await Product.findByIdAndDelete(id);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to delete product' };
    }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    try {
        await connectDB();

        // 1. Handle Images (New Uploads)
        const photos: string[] = [];
        const files = formData.getAll('photos') as File[];

        for (const file of files) {
            if (file.size > 0 && file.type.startsWith('image/')) {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const result = await new Promise<any>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'wms-products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(buffer);
                });

                photos.push(result.secure_url);
            }
        }

        // 2. Parse other fields
        const characteristicsStr = formData.get('characteristics') as string;
        const barcodesStr = formData.get('barcodes') as string;

        let characteristics = {};
        if (characteristicsStr) {
            try { characteristics = JSON.parse(characteristicsStr); } catch { }
        }

        let barcodes = [];
        if (barcodesStr) {
            try { barcodes = JSON.parse(barcodesStr); } catch { }
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) throw new Error("Product not found");

        const updatedPhotos = [...(existingProduct.photos || []), ...photos];

        const doc = {
            warehouse: formData.get('warehouse'),
            category: formData.get('category'),
            name: formData.get('name'),
            photos: updatedPhotos,
            description: formData.get('description'),
            article: formData.get('article'),
            code: formData.get('code'),
            externalCode: formData.get('externalCode'),
            price: Number(formData.get('price')),
            discountPrice: formData.get('discountPrice') ? Number(formData.get('discountPrice')) : undefined,
            isDiscountActive: formData.get('isDiscountActive') === 'true',
            country: formData.get('country'),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            minQuantity: Number(formData.get('minQuantity')),
            characteristics,
            barcodes,
        };

        await Product.findByIdAndUpdate(id, doc);
        return { success: true, id };

    } catch (e: any) {
        console.error('Update Product Error:', e);
        return { error: e.message || 'Failed to update product' };
    }
}
