'use client';

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';

import { selectedOrganizationAtom } from '@/atoms';
import { usePurchaseProductsData, usePurchaseProductsActions } from '@/lib/hooks/usePurchaseProducts';
import { usePurchaseServicesData, usePurchaseServicesActions } from '@/lib/hooks/usePurchaseServices';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCurrency } from '@/lib/hooks/useCurrency';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Package, Wrench } from 'lucide-react';
function ProductsContent() {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { products, loading: productsLoading } = usePurchaseProductsData(organizationId || undefined);
  const { services, loading: servicesLoading } = usePurchaseServicesData(organizationId || undefined);
  const { categories, loading: categoriesLoading } = useProducts();
  const { createProduct, deleteProduct } = usePurchaseProductsActions(organizationId || undefined);
  const { createService, deleteService } = usePurchaseServicesActions(organizationId || undefined);
  const { formatCurrency } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('');

  // Service form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');

  useEffect(() => {
    setLoading(productsLoading || servicesLoading || categoriesLoading);
  }, [productsLoading, servicesLoading, categoriesLoading]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        categoryId: productCategory,
        organizationId: organizationId || '',
      });
      setProductDialogOpen(false);
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductCategory('');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createService({
        name: serviceName,
        description: serviceDescription,
        price: parseFloat(servicePrice),
        categoryId: serviceCategory,
        organizationId: organizationId || '',
      });
      setServiceDialogOpen(false);
      setServiceName('');
      setServiceDescription('');
      setServicePrice('');
      setServiceCategory('');
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Products & Services</h1>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Purchase Products</CardTitle>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Purchase Product</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Purchase Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="productName">Name</Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="productDescription">Description</Label>
                      <Textarea
                        id="productDescription"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="productPrice">Price</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCategory">Category</Label>
                      <Input
                        id="productCategory"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                      />
                    </div>
                    <Button type="submit">Add Purchase Product</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>{product.price ? formatCurrency(product.price) : formatCurrency(0)}</TableCell>
                      <TableCell>{categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8" />
                          <p>No purchase products found. Click Add Purchase Product to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Purchase Services</CardTitle>
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Purchase Service</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Purchase Service</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div>
                      <Label htmlFor="serviceName">Name</Label>
                      <Input
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceDescription">Description</Label>
                      <Textarea
                        id="serviceDescription"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servicePrice">Price</Label>
                      <Input
                        id="servicePrice"
                        type="number"
                        step="0.01"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceCategory">Category</Label>
                      <Input
                        id="serviceCategory"
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                      />
                    </div>
                    <Button type="submit">Add Purchase Service</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.description}</TableCell>
                      <TableCell>{service.price ? formatCurrency(service.price) : formatCurrency(0)}</TableCell>
                      <TableCell>{categories.find(c => c.id === service.categoryId)?.name || 'Uncategorized'}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {services.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Wrench className="h-8 w-8" />
                          <p>No purchase services found. Click Add Purchase Service to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProductsPage() {
  return <ProductsContent />;
}