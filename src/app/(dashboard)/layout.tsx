import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { WarehouseSelector } from '@/components/layout/WarehouseSelector';
import { getWarehouses } from '@/actions/warehouse';
import { Button } from '@/components/ui/button';
import { logout, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const warehouses = await getWarehouses();
    const user = await getCurrentUser();

    async function logoutAction() {
        'use server';
        await logout();
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 lg:flex-row">
            <Sidebar className="hidden lg:block lg:w-64" role={user?.role} />
            <div className="flex flex-1 flex-col sm:gap-4 sm:py-4 sm:pl-14 lg:pl-0">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <MobileSidebar onLogout={logoutAction} role={user?.role} />
                    <Suspense fallback={<div className="w-[200px]" />}>
                        <WarehouseSelector warehouses={warehouses} />
                    </Suspense>
                    <div className="ml-auto flex items-center gap-2">
                        <form action={logoutAction} className="hidden lg:block">
                            <Button variant="outline" size="sm">Logout</Button>
                        </form>
                    </div>
                </header>
                <main className="p-4 sm:px-6 sm:py-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
