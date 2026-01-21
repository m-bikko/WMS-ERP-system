'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Warehouse, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ className, role }: { className?: string, role?: string }) {
    const pathname = usePathname();

    const links = [
        {
            name: 'My Products',
            href: '/products',
            icon: Package,
        },
        {
            name: 'Warehouses',
            href: '/warehouses',
            icon: Warehouse,
        },
    ];

    if (role === 'admin') {
        links.push({
            name: 'Users',
            href: '/users',
            icon: Users,
        });
    }

    return (
        <div className={cn("pb-12 min-h-screen border-r bg-muted/40", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        WMS ERP
                    </h2>
                    <div className="space-y-1">
                        {links.map((link) => (
                            <Button
                                key={link.href}
                                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={link.href}>
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
