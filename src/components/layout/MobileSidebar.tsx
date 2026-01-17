'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Warehouse, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Ensure accessibility if SheetTitle is required but hidden


interface MobileSidebarProps {
    onLogout: () => Promise<void>;
}

export function MobileSidebar({ onLogout }: MobileSidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

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

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] flex flex-col justify-between">
                {/* Accessibility: Sheet requires a Title */}
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

                <div className="flex flex-col gap-6 py-4">
                    <div className="px-2">
                        <h2 className="text-lg font-semibold tracking-tight">WMS ERP</h2>
                    </div>
                    <div className="flex flex-col gap-1">
                        {links.map((link) => (
                            <Button
                                key={link.href}
                                variant={pathname.startsWith(link.href) ? "secondary" : "ghost"}
                                className="justify-start gap-2"
                                asChild
                                onClick={() => setOpen(false)}
                            >
                                <Link href={link.href}>
                                    <link.icon className="h-4 w-4" />
                                    {link.name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="border-t p-4 mt-auto">
                    <form action={async () => {
                        await onLogout();
                        setOpen(false);
                    }}>
                        <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                            Logout
                        </Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
}
