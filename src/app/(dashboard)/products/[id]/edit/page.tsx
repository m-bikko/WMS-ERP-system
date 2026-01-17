import { getCategories } from '@/actions/category';
import { getWarehouses } from '@/actions/warehouse';
import { ProductForm } from '@/components/products/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Product from '@/models/Product';
import connectDB from '@/lib/db';

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

// Separate function to fetch generic product data (avoiding lean() to simpler serialization if needed, or manual pick)
async function getProductById(id: string) {
    await connectDB();
    const p = await Product.findById(id).lean();
    if (!p) return null;

    // Serializing manually to avoid "Only plain objects can be passed to Client Components"
    return {
        id: (p._id as any).toString(),
        name: p.name,
        article: p.article,
        code: p.code,
        externalCode: p.externalCode,
        quantity: p.quantity,
        minQuantity: p.minQuantity,
        unit: p.unit,
        price: p.price,
        photos: p.photos || [],
        description: p.description,
        characteristics: p.characteristics ? Object.entries(p.characteristics).map(([key, value]) => ({ key, value })) : [],
        barcodes: p.barcodes ? p.barcodes.map((b: any) => ({
            type: b.type,
            value: b.value
        })) : [],
        warehouse: (p.warehouse as any)?.toString(),
        category: (p.category as any)?.toString(),
        country: p.country,
        isDiscountActive: p.isDiscountActive,
        discountPrice: p.discountPrice
    };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return <div>Product not found</div>;
    }

    const [categories, warehouses] = await Promise.all([
        getCategories(),
        getWarehouses(),
    ]);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product: {product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm
                        categories={categories}
                        warehouses={warehouses}
                        initialData={product}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
