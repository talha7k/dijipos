'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Service, Category } from '@/types';
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
  const { user, organizationId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    if (!organizationId) return;

    // Fetch products
    const productsQ = query(collection(db, 'tenants', organizationId, 'purchase-products'));
    const productsUnsubscribe = onSnapshot(productsQ, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];
      setProducts(productsData);
    });

    // Fetch services
    const servicesQ = query(collection(db, 'tenants', organizationId, 'purchase-services'));
    const servicesUnsubscribe = onSnapshot(servicesQ, (querySnapshot) => {
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Service[];
      setServices(servicesData);
    });

    // Fetch categories
    const categoriesQ = query(collection(db, 'tenants', organizationId, 'categories'));
    const categoriesUnsubscribe = onSnapshot(categoriesQ, (querySnapshot) => {
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[];
      setCategories(categoriesData);
      setLoading(false);
    });

    return () => {
      productsUnsubscribe();
      servicesUnsubscribe();
      categoriesUnsubscribe();
    };
  }, [organizationId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    await addDoc(collection(db, 'tenants', organizationId, 'purchase-products'), {
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      category: productCategory,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setProductDialogOpen(false);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductCategory('');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    await addDoc(collection(db, 'tenants', organizationId, 'purchase-services'), {
      name: serviceName,
      description: serviceDescription,
      price: parseFloat(servicePrice),
      category: serviceCategory,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setServiceDialogOpen(false);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceCategory('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!organizationId) return;
    await deleteDoc(doc(db, 'tenants', organizationId, 'purchase-products', id));
  };

  const handleDeleteService = async (id: string) => {
    if (!organizationId) return;
    await deleteDoc(doc(db, 'tenants', organizationId, 'purchase-services', id));
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
                      <TableCell>${product.price ? product.price.toFixed(2) : '0.00'}</TableCell>
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
                      <TableCell>${service.price ? service.price.toFixed(2) : '0.00'}</TableCell>
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