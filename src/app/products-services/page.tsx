"use client";

import { useState } from "react";
import { useItems } from "@/lib/hooks/useItems";
import { useCategories } from "@/lib/hooks/useCategories";
import { useOrganization } from "@/lib/hooks/useOrganization";
import { Item, CategoryType, ProductTransactionType, ItemType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Wrench, Database, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { AddProductDialog } from "@/components/products_services/AddProductDialog";
import { AddServiceDialog } from "@/components/products_services/AddServiceDialog";
import { AddCategoryDialog } from "@/components/products_services/AddCategoryDialog";
import { ProductList } from "@/components/products_services/ProductList";
import { ServiceList } from "@/components/products_services/ServiceList";
import { CategoryTree } from "@/components/products_services/CategoryTree";
import { Loader } from "@/components/ui/loader";
import { ExportImportProducts } from "@/components/ExportImportProducts";

export default function ProductsServicesPage() {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const {
    items,
    loading: itemsLoading,
    createItem,
    createItemBulk,
    updateItem,
    deleteItem,
  } = useItems();
  const {
    categories,
    loading: categoriesLoading,
    createCategory,
    createCategoryBulk,
    deleteCategory,
  } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("sales-products");
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Item | null>(null);
  const [serviceToEdit, setServiceToEdit] = useState<Item | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteCategoryName, setDeleteCategoryName] = useState<string>("");
  const [deleteCategoryItemCount, setDeleteCategoryItemCount] =
    useState<number>(0);

  const loading = itemsLoading || categoriesLoading;

  const handleAddItem = async (
    item: Omit<Item, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await createItem(item);
      setProductDialogOpen(false);
      setServiceDialogOpen(false);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    }
  };

  const handleUpdateItem = async (
    itemId: string,
    item: Partial<Omit<Item, "id" | "createdAt">>,
  ) => {
    try {
      await updateItem(itemId, item);
      setProductToEdit(null);
      setServiceToEdit(null);
      setProductDialogOpen(false);
      setServiceDialogOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
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
    type: "product" | "service";
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
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const itemCount = items.filter(
      (item: Item) => item.categoryId === categoryId,
    ).length;

    setDeleteCategoryId(categoryId);
    setDeleteCategoryName(category?.name || "");
    setDeleteCategoryItemCount(itemCount);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      await deleteCategory(deleteCategoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleteCategoryId(null);
      setDeleteCategoryName("");
      setDeleteCategoryItemCount(0);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">
          Loading products and services...
        </p>
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

      <Tabs
        value={currentTab}
        className="w-full"
        onValueChange={(value) => {
          setCurrentTab(value);
          setSelectedCategory(null);
          setSearchTerm("");
        }}
      >
        <TabsList>
          <TabsTrigger value="sales-products">
            <Package className="w-4 h-4 mr-2" />
            Sales Products
          </TabsTrigger>
          <TabsTrigger value="sales-services">
            <Wrench className="w-4 h-4 mr-2" />
            Sales Services
          </TabsTrigger>
          <TabsTrigger value="purchase-products">
            <Package className="w-4 h-4 mr-2" />
            Purchase Products
          </TabsTrigger>
          <TabsTrigger value="purchase-services">
            <Wrench className="w-4 h-4 mr-2" />
            Purchase Services
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales-products" className="space-y-4">
          <div className="flex items-center gap-2 py-8">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Sales Products</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories.filter(
                        (c) =>
                          c.transactionType === ProductTransactionType.SALES,
                      )}
                      defaultType={CategoryType.PRODUCT}
                      defaultTransactionType={ProductTransactionType.SALES}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryTree
                    categories={categories.filter(
                      (c) =>
                        c.type === CategoryType.PRODUCT &&
                        c.transactionType === ProductTransactionType.SALES,
                    )}
                    products={items.filter(
                      (item) => item.itemType === ItemType.PRODUCT,
                    )}
                    services={[]}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    onCategoryDelete={handleDeleteCategory}
                    type={CategoryType.PRODUCT}
                  />
                </CardContent>
              </Card>
            </div>
             <div className="w-full md:w-2/3">
               <Card>
                 <CardContent>
                   <ProductList
                     products={items.filter(
                       (item) =>
                         item.itemType === ItemType.PRODUCT &&
                         item.transactionType === ProductTransactionType.SALES,
                     )}
                     categories={categories}
                     selectedCategory={selectedCategory}
                     searchTerm={searchTerm}
                     selectedTransactionType={ProductTransactionType.SALES}
                     onEditProduct={handleEditItem}
                     onDeleteProduct={handleDeleteItem}
                     onAddProduct={() => {
                       setProductToEdit(null);
                       setProductDialogOpen(true);
                     }}
                   />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales-services" className="space-y-4">
          <div className="flex items-center gap-2 py-8">
            <Wrench className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Sales Services</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories.filter(
                        (c) =>
                          c.transactionType === ProductTransactionType.SALES,
                      )}
                      defaultType={CategoryType.SERVICE}
                      defaultTransactionType={ProductTransactionType.SALES}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryTree
                    categories={categories.filter(
                      (c) =>
                        c.type === CategoryType.SERVICE &&
                        c.transactionType === ProductTransactionType.SALES,
                    )}
                    products={[]}
                    services={items.filter(
                      (item) => item.itemType === ItemType.SERVICE,
                    )}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    onCategoryDelete={handleDeleteCategory}
                    type={CategoryType.SERVICE}
                  />
                </CardContent>
              </Card>
            </div>
             <div className="w-full md:w-2/3">
               <Card>
                 <CardContent>
                   <ServiceList
                     services={items.filter(
                       (item) =>
                         item.itemType === ItemType.SERVICE &&
                         item.transactionType === ProductTransactionType.SALES,
                     )}
                     categories={categories}
                     selectedCategory={selectedCategory}
                     searchTerm={searchTerm}
                     selectedTransactionType={ProductTransactionType.SALES}
                     onEditService={handleEditItem}
                     onDeleteService={handleDeleteItem}
                     onAddService={() => {
                       setServiceToEdit(null);
                       setServiceDialogOpen(true);
                     }}
                   />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchase-products" className="space-y-4">
          <div className="flex items-center gap-2 py-8">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Sales Products</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories.filter(
                        (c) =>
                          c.transactionType === ProductTransactionType.PURCHASE,
                      )}
                      defaultType={CategoryType.PRODUCT}
                      defaultTransactionType={ProductTransactionType.PURCHASE}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <CategoryTree
                     categories={categories.filter(
                       (c) =>
                         c.type === CategoryType.PRODUCT &&
                         c.transactionType === ProductTransactionType.PURCHASE,
                     )}
                     products={items.filter(
                       (item) =>
                         item.itemType === ItemType.PRODUCT &&
                         item.transactionType === ProductTransactionType.PURCHASE,
                     )}
                     services={[]}
                     selectedCategory={selectedCategory}
                     onCategorySelect={setSelectedCategory}
                     onCategoryDelete={handleDeleteCategory}
                     type={CategoryType.PRODUCT}
                   />
                </CardContent>
              </Card>
            </div>
             <div className="w-full md:w-2/3">
               <Card>
                 <CardContent>
                   <ProductList
                     products={items.filter(
                       (item) =>
                         item.itemType === ItemType.PRODUCT &&
                         item.transactionType ===
                           ProductTransactionType.PURCHASE,
                     )}
                     categories={categories}
                     selectedCategory={selectedCategory}
                     searchTerm={searchTerm}
                     selectedTransactionType={ProductTransactionType.PURCHASE}
                     onEditProduct={handleEditItem}
                     onDeleteProduct={handleDeleteItem}
                     onAddProduct={() => {
                       setProductToEdit(null);
                       setProductDialogOpen(true);
                     }}
                   />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchase-services" className="space-y-4">
           <div className="flex items-center gap-2 py-8">
             <Wrench className="h-6 w-6" />
             <h2 className="text-2xl font-bold">Purchase Services</h2>
           </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Categories
                    </div>
                    <AddCategoryDialog
                      open={categoryDialogOpen}
                      onOpenChange={setCategoryDialogOpen}
                      onAddCategory={handleAddCategory}
                      categories={categories.filter(
                        (c) =>
                          c.transactionType === ProductTransactionType.PURCHASE,
                      )}
                      defaultType={CategoryType.SERVICE}
                      defaultTransactionType={ProductTransactionType.PURCHASE}
                      selectedParentId={selectedCategory}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <CategoryTree
                     categories={categories.filter(
                       (c) =>
                         c.type === CategoryType.SERVICE &&
                         c.transactionType === ProductTransactionType.PURCHASE,
                     )}
                     products={[]}
                     services={items.filter(
                       (item) =>
                         item.itemType === ItemType.SERVICE &&
                         item.transactionType === ProductTransactionType.PURCHASE,
                     )}
                     selectedCategory={selectedCategory}
                     onCategorySelect={setSelectedCategory}
                     onCategoryDelete={handleDeleteCategory}
                     type={CategoryType.SERVICE}
                   />
                </CardContent>
              </Card>
            </div>
             <div className="w-full md:w-2/3">
               <Card>
                 <CardContent>
                    <ServiceList
                      services={items.filter(
                        (item) =>
                          item.itemType === ItemType.SERVICE &&
                          item.transactionType ===
                            ProductTransactionType.PURCHASE,
                      )}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      searchTerm={searchTerm}
                      selectedTransactionType={ProductTransactionType.PURCHASE}
                      onEditService={handleEditItem}
                      onDeleteService={handleDeleteItem}
                      onAddService={() => {
                        setServiceToEdit(null);
                        setServiceDialogOpen(true);
                      }}
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
              return await createCategoryBulk(data);
            }}
            onCreateItem={async (data) => {
              return await createItemBulk(data);
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

      <AlertDialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category &ldquo;
              {deleteCategoryName}&rdquo;?
              {deleteCategoryItemCount > 0 &&
                ` This will also remove ${deleteCategoryItemCount} item${deleteCategoryItemCount > 1 ? "s" : ""} in this category.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCategoryId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onAddProduct={handleAddItem}
        onUpdateProduct={handleUpdateItem}
        productToEdit={productToEdit}
        categories={categories}
        selectedCategory={selectedCategory}
        defaultTransactionType={
          currentTab === "sales-products" || currentTab === "purchase-products"
            ? currentTab === "sales-products"
              ? ProductTransactionType.SALES
              : ProductTransactionType.PURCHASE
            : ProductTransactionType.SALES
        }
      />

      <AddServiceDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onAddService={handleAddItem}
        onUpdateService={handleUpdateItem}
        serviceToEdit={serviceToEdit}
        categories={categories}
        selectedCategory={selectedCategory}
        defaultTransactionType={
          currentTab === "sales-services" || currentTab === "purchase-services"
            ? currentTab === "sales-services"
              ? ProductTransactionType.SALES
              : ProductTransactionType.PURCHASE
            : ProductTransactionType.SALES
        }
      />
    </div>
  );
}
