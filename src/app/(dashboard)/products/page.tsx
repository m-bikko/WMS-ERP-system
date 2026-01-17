import { Suspense } from 'react';
import { getCategories } from '@/actions/category';
import { getProducts } from '@/actions/product';
import { CategoryTree } from '@/components/products/CategoryTree';
import { ProductView } from '@/components/products/ProductView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const resolvedParams = await searchParams;
    const categoryId = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
    const warehouseId = typeof resolvedParams.warehouse === 'string' ? resolvedParams.warehouse : undefined;

    // Parallel fetch
    const [categories, allProducts, filteredProducts] = await Promise.all([
        getCategories(),
        getProducts(undefined, warehouseId), // For Tree
        getProducts(categoryId, warehouseId), // For Table
    ]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            <Card className="w-full lg:w-1/4 h-full overflow-hidden flex flex-col">
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pl-2">
                    <Suspense fallback={<div>Loading tree...</div>}>
                        <CategoryTree categories={categories} products={allProducts} />
                    </Suspense>
                </CardContent>
            </Card>

            <Card className="w-full lg:w-3/4 h-full flex flex-col">
                <CardContent className="h-full p-4 flex flex-col pt-0">
                    <div className="pt-4 flex-1 min-h-0">
                        <ProductView products={filteredProducts} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
