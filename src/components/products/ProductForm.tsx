'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/actions/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';

interface Props {
    categories: any[];
    warehouses: any[];
    defaultCategoryId?: string;
    initialData?: any;
}

export function ProductForm({ categories, warehouses, defaultCategoryId, initialData }: Props) {
    const [state, formAction, isPending] = useActionState(initialData ? updateProduct.bind(null, initialData.id) : createProduct, null);
    const router = useRouter();

    // Complex State
    const [characteristics, setCharacteristics] = useState<{ key: string; value: string }[]>(initialData?.characteristics ?? []);
    const [barcodes, setBarcodes] = useState<{ type: string; value: string }[]>(initialData?.barcodes ?? []);
    const [isDiscountActive, setIsDiscountActive] = useState(initialData?.isDiscountActive ?? false);
    const [descLength, setDescLength] = useState(initialData?.description?.length ?? 0);


    // Success handling
    useEffect(() => {
        if (state?.success) {
            router.push('/products');
            router.refresh();
        }
    }, [state?.success, router]);


    const addCharacteristic = () => setCharacteristics([...characteristics, { key: '', value: '' }]);
    const removeCharacteristic = (i: number) => setCharacteristics(characteristics.filter((_, idx) => idx !== i));
    const updateCharacteristic = (i: number, field: 'key' | 'value', val: string) => {
        const newC = [...characteristics];
        newC[i][field] = val;
        setCharacteristics(newC);
    };

    const addBarcode = () => setBarcodes([...barcodes, { type: 'EAN13', value: '' }]);
    const removeBarcode = (i: number) => setBarcodes(barcodes.filter((_, idx) => idx !== i));
    const updateBarcode = (i: number, field: 'type' | 'value', val: string) => {
        const newB = [...barcodes];
        newB[i][field] = val;
        setBarcodes(newB);
    };

    // Prepare serialized data for hidden inputs
    const charMap = characteristics.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    const charJson = JSON.stringify(charMap);
    const barcodesJson = JSON.stringify(barcodes);

    return (
        <form action={formAction} className="space-y-8">
            {state?.error && <div className="text-red-500 font-bold">{state.error}</div>}

            {/* Hidden Fields for complex data */}
            <input type="hidden" name="characteristics" value={charJson} />
            <input type="hidden" name="barcodes" value={barcodesJson} />
            <input type="hidden" name="isDiscountActive" value={String(isDiscountActive)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Info */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Warehouse</Label>
                        <Select name="warehouse" defaultValue={initialData?.warehouse?._id || initialData?.warehouse} required >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select name="category" defaultValue={initialData?.category?._id || initialData?.category || defaultCategoryId} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Product Name</Label>
                        <Input name="name" defaultValue={initialData?.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Photos (Max 10)</Label>
                        <Input type="file" name="photos" multiple accept="image/*" />
                        {initialData?.photos?.length > 0 && <p className="text-xs text-muted-foreground">Uploading new photos will check Cloudinary (Append logic to be implemented if needed)</p>}
                    </div>
                </div>

                {/* Pricing & Codes */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Price</Label>
                            <Input name="price" type="number" defaultValue={initialData?.price} required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="disc"
                                    checked={isDiscountActive}
                                    onCheckedChange={(c) => setIsDiscountActive(!!c)}
                                />
                                <Label htmlFor="disc">Apply Discount</Label>
                            </div>
                            <Input
                                name="discountPrice"
                                type="number"
                                disabled={!isDiscountActive}
                                defaultValue={initialData?.discountPrice}
                                placeholder="Discount Price"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-2">
                            <Label>Article</Label>
                            <Input name="article" defaultValue={initialData?.article} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Code</Label>
                            <Input name="code" defaultValue={initialData?.code} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Ext Code</Label>
                            <Input name="externalCode" defaultValue={initialData?.externalCode} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Quantity</Label>
                            <Input name="quantity" type="number" defaultValue={initialData?.quantity ?? 0} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Min Quantity</Label>
                            <Input name="minQuantity" type="number" defaultValue={initialData?.minQuantity ?? 0} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Unit</Label>
                        <Select name="unit" defaultValue={initialData?.unit ?? "pcs"}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                <SelectItem value="l">Liter (l)</SelectItem>
                                <SelectItem value="m">Meter (m)</SelectItem>
                                <SelectItem value="box">Box</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Country</Label>
                        <Select name="country" defaultValue={initialData?.country ?? "China"}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['China', 'USA', 'Russia', 'Kazakhstan', 'Germany', 'Turkey'].map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                                {/* Shortened list for demo */}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
                <Label>Description ({descLength}/5000)</Label>
                <Textarea
                    name="description"
                    maxLength={5000}
                    className="h-32"
                    defaultValue={initialData?.description}
                    onChange={(e) => setDescLength(e.target.value.length)}
                />
            </div>

            {/* Dynamic Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Characteristics */}
                <div className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between items-center">
                        <Label className="font-bold">Characteristics</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addCharacteristic}>
                            <Plus className="h-4 w-4" /> Add
                        </Button>
                    </div>
                    {characteristics.map((c, i) => (
                        <div key={i} className="flex gap-2">
                            <Input
                                placeholder="Key (e.g. Size)"
                                value={c.key}
                                onChange={(e) => updateCharacteristic(i, 'key', e.target.value)}
                            />
                            <Input
                                placeholder="Value (e.g. XL)"
                                value={c.value}
                                onChange={(e) => updateCharacteristic(i, 'value', e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCharacteristic(i)}>
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Barcodes */}
                <div className="space-y-2 border p-4 rounded-md">
                    <div className="flex justify-between items-center">
                        <Label className="font-bold">Barcodes</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addBarcode}>
                            <Plus className="h-4 w-4" /> Add
                        </Button>
                    </div>
                    {barcodes.map((b, i) => (
                        <div key={i} className="flex gap-2">
                            <Select
                                value={b.type}
                                onValueChange={(val) => updateBarcode(i, 'type', val)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['EAN8', 'EAN13', 'Code128', 'GTIN', 'UPC'].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Code Value"
                                value={b.value}
                                onChange={(e) => updateBarcode(i, 'value', e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBarcode(i)}>
                                <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
                </Button>
            </div>
        </form>
    );
}
