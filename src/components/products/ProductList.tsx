'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { deleteProduct } from '@/actions/product';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProductListProps {
    products: any[];
}

export function ProductList({ products }: ProductListProps) {
    const router = useRouter();

    const onDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            router.refresh();
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Article</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Whse</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center h-24">
                                No products found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        products.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    {p.photos && p.photos.length > 0 && (
                                        <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                                            <Image src={p.photos[0]} alt={p.name} fill className="object-cover" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">{p.article || '-'}</TableCell>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell>{p.categoryName}</TableCell>
                                <TableCell>{p.warehouseName}</TableCell>
                                <TableCell className="text-right font-medium">{p.price}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={p.quantity > 0 ? "default" : "destructive"}>
                                        {p.quantity}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${p.id}/edit`)}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(p.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
