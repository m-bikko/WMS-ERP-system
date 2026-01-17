import { getCategories } from '@/actions/category';
import { getWarehouses } from '@/actions/warehouse';
import { ProductForm } from '@/components/products/ProductForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewProductPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
    const resolvedParams = await searchParams;
    const categoryId = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;

    const [categories, warehouses] = await Promise.all([
        getCategories(),
        getWarehouses(),
    ]);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Product</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm
                        categories={categories}
                        warehouses={warehouses}
                        defaultCategoryId={categoryId}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
