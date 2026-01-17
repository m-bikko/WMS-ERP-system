'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Box, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { deleteProduct } from '@/actions/product';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: any;
}

export function ProductCard({ product }: ProductCardProps) {
    const router = useRouter();

    const onDelete = async () => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(product.id);
            router.refresh();
        }
    };

    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full bg-muted flex items-center justify-center">
                {product.photos && product.photos.length > 0 ? (
                    <Image
                        src={product.photos[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <Box className="h-12 w-12 text-muted-foreground" />
                )}
                {product.quantity <= 0 && (
                    <div className="absolute top-2 right-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                )}
            </div>
            <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-base line-clamp-1" title={product.name}>
                            {product.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{product.article || 'No Article'}</p>
                    </div>
                    <span className="font-bold text-lg">{product.price.toLocaleString()}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium text-foreground">{product.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Warehouse:</span>
                        <span className="font-medium text-foreground">{product.warehouseName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className={product.quantity > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                            {product.quantity}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/products/${product.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
