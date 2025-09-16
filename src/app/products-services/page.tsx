'use client';

import { useState } from 'react';
import { useOrganizationId } from '@/hooks/useAuthState';
import { useProductsData, useProductActions } from '@/hooks/products_services/useProducts';
import { useServicesData, useServiceActions } from '@/hooks/products_services/useServices';
import { useCategoriesData } from '@/hooks/products_services/useCategories';
import { Product, Service, CategoryType } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Package, Wrench, Search, Database } from 'lucide-react';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/products_services/AddProductDialog';
import { AddServiceDialog } from '@/components/products_services/AddServiceDialog';
import { AddCategoryDialog } from '@/components/products_services/AddCategoryDialog';
import { ProductList } from '@/components/products_services/ProductList';
import { ServiceList } from '@/components/products_services/ServiceList';
import { CategoryTree } from '@/components/products_services/CategoryTree';
import { ExportImportProducts } from '@/components/ExportImportProducts';

export default function ProductsServicesPage() {
  const organizationId = useOrganizationId();
  const { products, loading: productsLoading } = useProductsData(organizationId || undefined);
  const { services, loading: servicesLoading } = useServicesData(organizationId || undefined);
  const { categories, loading: categoriesLoading, createCategory, deleteCategory: deleteCategoryHook } = useCategoriesData(organizationId || undefined);
  const { createProduct, deleteProduct: deleteProductHook } = useProductActions(organizationId || undefined);
  const { createService, deleteService: deleteServiceHook } = useServiceActions(organizationId || undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string>('');
  const [deleteCategoryItemCount, setDeleteCategoryItemCount] = useState<number>(0);

  const loading = productsLoading || servicesLoading || categoriesLoading;

  const handleAddProduct = async (product: {
    name: string;
    description: string;
    price: number;
    categoryId: string | null;
  }) => {
    if (!organizationId) return;

    try {
      await createProduct({
        ...product,
        categoryId: product.categoryId || undefined,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleAddService = async (service: {
    name: string;
    description: string;
    price: number;
    categoryId: string | null;
  }) => {
    if (!organizationId) return;

    try {
      await createService({
        ...service,
        categoryId: service.categoryId || undefined,
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    }
  };

  const handleAddCategory = async (category: {
    name: string;
    description: string;
    type: 'product' | 'service';
    parentId: string | null;
  }) => {
    if (!organizationId) return;

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
    const itemCount = products.filter((p: Product) => p.categoryId === categoryId).length;
    const serviceCount = services.filter((s: Service) => s.categoryId === categoryId).length;
    const totalCount = itemCount + serviceCount;

    setDeleteCategoryId(categoryId);
    setDeleteCategoryName(category?.name || '');
    setDeleteCategoryItemCount(totalCount);
  };

  const confirmDeleteCategory = async () => {
    if (!organizationId || !deleteCategoryId) return;
    
    try {
      await deleteCategoryHook(deleteCategoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    } finally {
      setDeleteCategoryId(null);
      setDeleteCategoryName('');
      setDeleteCategoryItemCount(0);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!organizationId) return;

    try {
      await deleteProductHook(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!organizationId) return;

    try {
      await deleteServiceHook(serviceId);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products & Services</h1>
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories}
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
                        {products.length}
                      </Badge>
                    </Button>
                    
                    <CategoryTree
                      categories={categories}
                      products={products}
                      services={services}
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      All Products
                    </div>
                    <AddProductDialog
                      open={productDialogOpen}
                      onOpenChange={setProductDialogOpen}
                      onAddProduct={handleAddProduct}
                      categories={categories}
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
                </CardHeader>
                <CardContent>
                  <ProductList
                    products={products}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    onDeleteProduct={handleDeleteProduct}
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Service Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories}
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
                        {services.length}
                      </Badge>
                    </Button>
                    
                    <CategoryTree
                      categories={categories}
                      products={products}
                      services={services}
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      All Services
                    </div>
                    <AddServiceDialog
                      open={serviceDialogOpen}
                      onOpenChange={setServiceDialogOpen}
                      onAddService={handleAddService}
                      categories={categories}
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
                </CardHeader>
                <CardContent>
                  <ServiceList
                    services={services}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    onDeleteService={handleDeleteService}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <ExportImportProducts organizationId={organizationId || undefined} />
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