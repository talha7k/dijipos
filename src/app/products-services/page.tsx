'use client';

import { useState } from 'react';
import { useItems } from '@/lib/hooks/useItems';
import { useCategories } from '@/lib/hooks/useCategories';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Item, CategoryType, ProductTransactionType, ItemType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Package, Wrench, Search, Database, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/products_services/AddProductDialog';
import { AddServiceDialog } from '@/components/products_services/AddServiceDialog';
import { AddCategoryDialog } from '@/components/products_services/AddCategoryDialog';
import { ProductList } from '@/components/products_services/ProductList';
import { ServiceList } from '@/components/products_services/ServiceList';
import { CategoryTree } from '@/components/products_services/CategoryTree';
import { Loader } from '@/components/ui/loader';
import { ExportImportProducts } from '@/components/ExportImportProducts';

export default function ProductsServicesPage() {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const { items, loading: itemsLoading, createItem, updateItem, deleteItem } = useItems();
  const { categories, loading: categoriesLoading, createCategory, deleteCategory } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<ProductTransactionType | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Item | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<Item | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string>('');
  const [deleteCategoryItemCount, setDeleteCategoryItemCount] = useState<number>(0);

  const loading = itemsLoading || categoriesLoading;

  const filteredCategories = categories.filter(category => 
    !selectedTransactionType || category.transactionType === selectedTransactionType
  );

  const handleAddItem = async (item: Omit<Item, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createItem(item);
      setProductDialogOpen(false);
      setServiceDialogOpen(false);
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleUpdateItem = async (itemId: string, item: Partial<Omit<Item, 'id' | 'createdAt'>>) => {
    try {
      await updateItem(itemId, item);
      setProductToEdit(null);
      setServiceToEdit(null);
      setProductDialogOpen(false);
      setServiceDialogOpen(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleEditItem = (item: Item) => {
    if (item.itemType === ItemType.PRODUCT) {
      setProductToEdit(item);
      setProductDialogOpen(true);
    } else {
      setServiceToEdit(item);
      setServiceDialogOpen(true);
    }
  };

  const handleAddCategory = async (category: {
    name: string;
    description: string;
    type: 'product' | 'service';
    parentId: string | null;
    transactionType: ProductTransactionType;
  }) => {
    try {
      await createCategory({
        ...category,
        type: category.type as CategoryType,
        parentId: category.parentId || undefined,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const itemCount = items.filter((item: Item) => item.categoryId === categoryId).length;

    setDeleteCategoryId(categoryId);
    setDeleteCategoryName(category?.name || '');
    setDeleteCategoryItemCount(itemCount);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      await deleteCategory(deleteCategoryId);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteCategoryId(null);
      setDeleteCategoryName('');
      setDeleteCategoryItemCount(0);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading products and services...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Products & Services
        </h1>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="services">
            <Wrench className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar - Categories */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={filteredCategories}
                      defaultType={CategoryType.PRODUCT}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={!selectedCategory ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Products
                      <Badge variant="secondary" className="ml-auto">
                        {items.filter(item => item.itemType === ItemType.PRODUCT).length}
                      </Badge>
                    </Button>

                    <CategoryTree
                      categories={filteredCategories}
                      products={items.filter(item => item.itemType === ItemType.PRODUCT)}
                      services={items.filter(item => item.itemType === ItemType.SERVICE)}
                      selectedCategory={selectedCategory}
                      onCategorySelect={setSelectedCategory}
                      onCategoryDelete={handleDeleteCategory}
                      type={CategoryType.PRODUCT}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Products */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      All Products
                    </div>
                    <AddProductDialog
                      open={productDialogOpen}
                      onOpenChange={setProductDialogOpen}
                      onAddProduct={handleAddItem}
                      onUpdateProduct={handleUpdateItem}
                      productToEdit={productToEdit}
                      categories={filteredCategories}
                      selectedCategory={selectedCategory}
                    />
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div>
                    <Select value={selectedTransactionType || 'all'} onValueChange={(value) => setSelectedTransactionType(value === 'all' ? null : value as ProductTransactionType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value={ProductTransactionType.SALES}>Sales</SelectItem>
                        <SelectItem value={ProductTransactionType.PURCHASE}>Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProductList
                    products={items.filter(item => item.itemType === ItemType.PRODUCT)}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    selectedTransactionType={selectedTransactionType}
                    onEditProduct={handleEditItem}
                    onDeleteProduct={handleDeleteItem}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar - Categories */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Service Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={filteredCategories}
                      defaultType={CategoryType.SERVICE}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant={!selectedCategory ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Services
                      <Badge variant="secondary" className="ml-auto">
                        {items.filter(item => item.itemType === ItemType.SERVICE).length}
                      </Badge>
                    </Button>

                    <CategoryTree
                      categories={filteredCategories}
                      products={items.filter(item => item.itemType === ItemType.PRODUCT)}
                      services={items.filter(item => item.itemType === ItemType.SERVICE)}
                      selectedCategory={selectedCategory}
                      onCategorySelect={setSelectedCategory}
                      onCategoryDelete={handleDeleteCategory}
                      type={CategoryType.SERVICE}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Services */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      All Services
                    </div>
                    <AddServiceDialog
                      open={serviceDialogOpen}
                      onOpenChange={setServiceDialogOpen}
                      onAddService={handleAddItem}
                      onUpdateService={handleUpdateItem}
                      serviceToEdit={serviceToEdit}
                      categories={filteredCategories}
                      selectedCategory={selectedCategory}
                    />
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div>
                    <Select value={selectedTransactionType || 'all'} onValueChange={(value) => setSelectedTransactionType(value === 'all' ? null : value as ProductTransactionType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value={ProductTransactionType.SALES}>Sales</SelectItem>
                        <SelectItem value={ProductTransactionType.PURCHASE}>Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ServiceList
                    services={items.filter(item => item.itemType === ItemType.SERVICE)}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    selectedTransactionType={selectedTransactionType}
                    onEditService={handleEditItem}
                    onDeleteService={handleDeleteItem}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <ExportImportProducts
            organizationId={organizationId || undefined}
            categories={categories}
            items={items}
            onCreateCategory={async (data) => {
              return await createCategory(data);
            }}
            onCreateItem={async (data) => {
              return await createItem(data);
            }}
            onDeleteCategory={async (categoryId) => {
              await deleteCategory(categoryId);
            }}
            onDeleteItem={async (itemId) => {
              await deleteItem(itemId);
            }}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category &ldquo;{deleteCategoryName}&rdquo;?
              {deleteCategoryItemCount > 0 && ` This will also remove ${deleteCategoryItemCount} item${deleteCategoryItemCount > 1 ? 's' : ''} in this category.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCategoryId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}