import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWarehouses } from '@/actions/warehouse';
import { CreateWarehouseDialog } from '@/components/warehouses/CreateWarehouseDialog';

export default async function WarehousesPage() {
    const warehouses = await getWarehouses();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
                <CreateWarehouseDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Warehouses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {warehouses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">
                                        No warehouses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                warehouses.map((w) => (
                                    <TableRow key={w.id}>
                                        <TableCell className="font-medium">{w.name}</TableCell>
                                        <TableCell>{w.code}</TableCell>
                                        <TableCell>{w.address}</TableCell>
                                        <TableCell className="text-right">
                                            {/* TODO: Edit/Delete buttons */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
