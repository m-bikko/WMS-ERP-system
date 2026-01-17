'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Plus, Folder, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategory } from '@/actions/category';



interface Category {
    id: string;
    name: string;
    parent: string | null;
}

interface Product {
    id: string;
    name: string;
    categoryId: string; // ID
}

interface TreeNode extends Category {
    children: TreeNode[];
    products: Product[];
}

interface CategoryTreeProps {
    categories: Category[];
    products: any[];
}


export function CategoryTree({ categories, products }: CategoryTreeProps) {
    const searchParams = useSearchParams();
    const selectedId = searchParams.get('category');
    const router = useRouter();

    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Build Tree
    const buildTree = (cats: Category[], prods: any[]): TreeNode[] => {
        const map: Record<string, TreeNode> = {};
        const roots: TreeNode[] = [];

        // Initialize map
        cats.forEach(c => {
            map[c.id] = { ...c, children: [], products: [] };
        });

        // Link children
        cats.forEach(c => {
            if (c.parent && map[c.parent]) {
                map[c.parent].children.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });

        // Distribute products
        prods.forEach(p => {
            // ensure we match the structure from getProducts action which returns flat object
            // checking if p.category is object or ID. Action returns populate, so p.category might be object? 
            // Wait, getProducts returns mapped object: categoryName.
            // I need the Category ID in the product object from getProducts to map it correctly.
            // I will need to update getProducts to return categoryId as well.
            // Assuming p.categoryId is available (I will add it).
            if (p.categoryId && map[p.categoryId]) {
                map[p.categoryId].products.push(p);
            }
        });

        return roots;
    };

    const tree = buildTree(categories, products);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectCategory = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('category', id);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Categories</h3>
                <CreateCategoryDialog parentId={null} />
            </div>
            <div className="space-y-1">
                {tree.map(node => (
                    <TreeNodeItem
                        key={node.id}
                        node={node}
                        level={0}
                        expanded={expanded}
                        toggleExpand={toggleExpand}
                        selectedId={selectedId}
                        onSelect={selectCategory}
                    />
                ))}
            </div>
        </div>
    );
}

function TreeNodeItem({ node, level, expanded, toggleExpand, selectedId, onSelect }: any) {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children.length > 0 || node.products.length > 0;

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer group",
                    selectedId === node.id && "bg-accent"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onSelect(node.id)}
            >
                <div
                    className="p-1 hover:bg-accent rounded text-muted-foreground"
                    onClick={(e) => hasChildren && toggleExpand(node.id, e)}
                >
                    {hasChildren ? (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                    ) : <span className="w-4 h-4 inline-block" />}
                </div>

                <Folder className="h-4 w-4 text-blue-500" />
                <span className="flex-1 text-sm truncate">{node.name}</span>

                {/* Actions visible on hover or selection */}
                <div className="hidden group-hover:flex items-center gap-1">
                    <CreateCategoryDialog parentId={node.id} trigger={<Plus className="h-3 w-3" />} />
                    <Link href={`/products/new?category=${node.id}`} onClick={e => e.stopPropagation()}>
                        <Box className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            {isExpanded && (
                <>
                    {node.children.map((child: any) => (
                        <TreeNodeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                    {node.products.map((prod: any) => (
                        <div
                            key={prod.id}
                            className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent/50 cursor-default"
                            style={{ paddingLeft: `${(level + 1) * 12 + 40}px` }}
                        >
                            <Box className="h-3 w-3 text-gray-500" />
                            <span className="text-sm truncate text-gray-700">{prod.name}</span>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}


function CreateCategoryDialog({ parentId, trigger }: { parentId: string | null, trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createCategory(name, parentId);
        setOpen(false);
        setName('');
        router.refresh();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        {trigger}
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{parentId ? 'Create Subcategory' : 'Create Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
