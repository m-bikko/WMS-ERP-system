'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface WarehouseSelectorProps {
    warehouses: { id: string; name: string }[];
}

export function WarehouseSelector({ warehouses }: WarehouseSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentWarehouse = searchParams.get('warehouse') || 'all';

    const onValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') {
            params.delete('warehouse');
        } else {
            params.set('warehouse', value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Warehouse:</span>
            <Select value={currentWarehouse} onValueChange={onValueChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                            {w.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
