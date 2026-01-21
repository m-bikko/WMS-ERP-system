'use server';

import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Stock from '@/models/Stock';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/auth';

// Configure Cloudinary
cloudinary.config({
    secure: true,
});

export async function getProducts(categoryId?: string, warehouseId?: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    await connectDB();

    const query: any = { owner: user.id };

    if (categoryId) {
        query.category = categoryId;
    }

    // Fetch Products (Global Definition)
    const products = await Product.find(query)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Fetch Stocks for the requested warehouse (or return 0 if 'all' or specific)
    // If warehouseId is 'all', we might sum up stocks or show global? 
    // For now, if 'all', we show 0 or maybe sum? The prompt implies "when i go to warehouse #2, i see it, but with amount 0".
    // So distinct view per warehouse.

    let stocks: any[] = [];
    if (warehouseId && warehouseId !== 'all') {
        stocks = await Stock.find({
            owner: user.id,
            warehouse: warehouseId,
            product: { $in: products.map(p => p._id) }
        }).lean();
    }

    // Map stocks to products
    const stockMap = new Map(stocks.map(s => [s.product.toString(), s]));

    return products.map((p) => {
        const pId = (p._id as any).toString();
        const stock = stockMap.get(pId);

        return {
            id: pId,
            name: p.name,
            article: p.article,
            code: p.code,
            quantity: stock ? stock.quantity : 0, // Show warehouse stock or 0
            price: p.price,
            photos: p.photos || [],
            categoryId: (p.category as any)?._id?.toString() || (p.category as any)?.toString(),
            categoryName: (p.category as any)?.name || 'Unknown',
            warehouseName: 'Global', // Product is global now
        };
    });
}

export async function createProduct(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        await connectDB();

        // 1. Handle Images
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

        // 2. Parse Data
        const characteristicsStr = formData.get('characteristics') as string;
        const barcodesStr = formData.get('barcodes') as string;
        const warehouseId = formData.get('warehouse') as string;
        const initialQuantity = Number(formData.get('quantity'));
        const initialMinQuantity = Number(formData.get('minQuantity'));

        let characteristics = {};
        if (characteristicsStr) { try { characteristics = JSON.parse(characteristicsStr); } catch { } }

        let barcodes = [];
        if (barcodesStr) { try { barcodes = JSON.parse(barcodesStr); } catch { } }

        // 3. Create Product (Global)
        const productDoc = {
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
            unit: formData.get('unit'),
            characteristics,
            barcodes,
            owner: user.id,
        };

        const product = new Product(productDoc);
        await product.save();

        // 4. Create Initial Stock (if warehouse selected)
        if (warehouseId && warehouseId !== 'all') {
            await Stock.create({
                product: product._id,
                warehouse: warehouseId,
                owner: user.id,
                quantity: initialQuantity || 0,
                minQuantity: initialMinQuantity || 0
            });
        }

        return { success: true, id: product._id.toString() };

    } catch (e: any) {
        console.error('Create Product Error:', e);
        return { error: e.message || 'Failed to create product' };
    }
}

export async function deleteProduct(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        await connectDB();

        // Delete Product
        const result = await Product.findOneAndDelete({ _id: id, owner: user.id });
        if (!result) return { error: 'Product not found or unauthorized' };

        // Delete associated Stocks
        await Stock.deleteMany({ product: id, owner: user.id });

        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Failed to delete product' };
    }
}

export async function updateProduct(id: string, prevState: any, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        await connectDB();

        // 1. Handle Images
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

        const characteristicsStr = formData.get('characteristics') as string;
        const barcodesStr = formData.get('barcodes') as string;

        let characteristics = {};
        if (characteristicsStr) { try { characteristics = JSON.parse(characteristicsStr); } catch { } }

        let barcodes = [];
        if (barcodesStr) { try { barcodes = JSON.parse(barcodesStr); } catch { } }

        const existingProduct = await Product.findOne({ _id: id, owner: user.id });
        if (!existingProduct) throw new Error("Product not found or unauthorized");

        const updatedPhotos = [...(existingProduct.photos || []), ...photos];

        // Update Product Metadata ONLY
        const doc = {
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
            unit: formData.get('unit'),
            characteristics,
            barcodes,
        };

        await Product.findByIdAndUpdate(id, doc);

        // Note: We deliberately do NOT update Stock (quantity) here during a "Product Edit".
        // Stock adjustments should be a separate action (e.g. Receive/Shipment or direct stock edit).
        // However, standard expectation might be to update stock if visible?
        // For now, we stick to the plan: Product = Definition. Stock = Separate.

        return { success: true, id };

    } catch (e: any) {
        console.error('Update Product Error:', e);
        return { error: e.message || 'Failed to update product' };
    }
}
