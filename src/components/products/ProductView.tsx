'use client';

import { useState } from 'react';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/products/ProductList';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductViewProps {
    products: any[];
}

export function ProductView({ products }: ProductViewProps) {
    const [view, setView] = useState<'list' | 'grid'>('list');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-sm font-normal text-muted-foreground">{products.length} items</h2>
                <div className="flex items-center border rounded-md p-1 bg-muted/20">
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setView('list')}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setView('grid')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {view === 'list' ? (
                    <ProductList products={products} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {products.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No products found.
                            </div>
                        ) : (
                            products.map(p => <ProductCard key={p.id} product={p} />)
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
