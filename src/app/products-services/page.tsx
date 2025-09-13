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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Wrench, Plus, Search, FolderOpen, FolderPlus } from 'lucide-react';
import { ActionButtons } from '@/components/ui/action-buttons';
function ProductsContent() {
  const { user, tenantId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategoryId, setProductCategoryId] = useState<string>('');

  // Service form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceCategoryId, setServiceCategoryId] = useState<string>('');

  // Category form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryType, setCategoryType] = useState<'product' | 'service' | 'both'>('product');
  const [categoryParentId, setCategoryParentId] = useState<string>('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    // Fetch products
    const productsQ = query(collection(db, 'tenants', tenantId, 'products'));
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
    const servicesQ = query(collection(db, 'tenants', tenantId, 'services'));
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
    const categoriesQ = query(collection(db, 'tenants', tenantId, 'categories'));
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
  }, [tenantId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    await addDoc(collection(db, 'tenants', tenantId, 'products'), {
      name: productName,
      description: productDescription,
      price: parseFloat(productPrice),
      categoryId: productCategoryId || null,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setProductDialogOpen(false);
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductCategoryId('');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    await addDoc(collection(db, 'tenants', tenantId, 'services'), {
      name: serviceName,
      description: serviceDescription,
      price: parseFloat(servicePrice),
      categoryId: serviceCategoryId || null,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setServiceDialogOpen(false);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceCategoryId('');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    await addDoc(collection(db, 'tenants', tenantId, 'categories'), {
      name: categoryName,
      description: categoryDescription,
      type: categoryType,
      parentId: categoryParentId || null,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setCategoryDialogOpen(false);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryType('product');
    setCategoryParentId('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!tenantId) return;
    await deleteDoc(doc(db, 'tenants', tenantId, 'products', id));
  };

  const handleDeleteService = async (id: string) => {
    if (!tenantId) return;
    await deleteDoc(doc(db, 'tenants', tenantId, 'services', id));
  };

  // Get product categories
  const productCategories = categories.filter(c => c.type === 'product' || c.type === 'both');
  
  // Get service categories
  const serviceCategories = categories.filter(c => c.type === 'service' || c.type === 'both');

  // Get child categories for a given parent category
  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Get category path (for display)
  const getCategoryPath = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  // Filter products based on search and selected category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter services based on search and selected category
  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || service.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products & Services</h1>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar - Categories and Subcategories */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Categories
                    </div>
                    <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <FolderPlus className="mr-1 h-4 w-4" />
                          Add Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                          <div>
                            <Label htmlFor="categoryName">Name</Label>
                            <Input
                              id="categoryName"
                              value={categoryName}
                              onChange={(e) => setCategoryName(e.target.value)}
                              placeholder="Category name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="categoryDescription">Description</Label>
                            <Textarea
                              id="categoryDescription"
                              value={categoryDescription}
                              onChange={(e) => setCategoryDescription(e.target.value)}
                              placeholder="Category description"
                            />
                          </div>
                          <div>
                            <Label htmlFor="categoryType">Type</Label>
                            <Select value={categoryType} onValueChange={(value: 'product' | 'service' | 'both') => setCategoryType(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="product">Products</SelectItem>
                                <SelectItem value="service">Services</SelectItem>
                                <SelectItem value="both">Both Products and Services</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="categoryParentId">Parent Category (Optional)</Label>
                            <Select value={categoryParentId} onValueChange={setCategoryParentId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a parent category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None (Top Level)</SelectItem>
                                {categories
                                  .filter(c => !c.parentId && (c.type === categoryType || c.type === 'both'))
                                  .map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Category</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
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
                    
                    <Accordion type="single" collapsible className="w-full">
                      {productCategories.map(category => (
                        <AccordionItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full pr-2">
                            <AccordionTrigger className="text-left p-0 hover:no-underline">
                              {category.name}
                              <Badge variant="secondary" className="ml-2">
                                {products.filter(p => p.categoryId === category.id).length}
                              </Badge>
                            </AccordionTrigger>
                             <ActionButtons
                               onDelete={() => {
                                 const productCount = products.filter(p => p.categoryId === category.id).length;
                                 if (confirm(`Are you sure you want to delete the category "${category.name}"?${productCount > 0 ? ` This will also remove ${productCount} product${productCount > 1 ? 's' : ''} in this category.` : ''}`)) {
                                   if (tenantId) {
                                     deleteDoc(doc(db, 'tenants', tenantId, 'categories', category.id));
                                   }
                                 }
                               }}
                               showEdit={false}
                             />
                          </div>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <Button
                                variant={selectedCategory === category.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                All in {category.name}
                              </Button>
                              
                              {getChildCategories(category.id).map(childCategory => (
                                <div key={childCategory.id} className="flex items-center justify-between w-full group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 justify-start pl-4"
                                    onClick={() => setSelectedCategory(childCategory.id)}
                                  >
                                    {childCategory.name}
                                    <Badge variant="outline" className="ml-auto">
                                      {products.filter(p => p.categoryId === childCategory.id).length}
                                    </Badge>
                                  </Button>
                                   <ActionButtons
                                     onDelete={() => {
                                       const productCount = products.filter(p => p.categoryId === childCategory.id).length;
                                       if (confirm(`Are you sure you want to delete the subcategory "${childCategory.name}"?${productCount > 0 ? ` This will also remove ${productCount} product${productCount > 1 ? 's' : ''} in this subcategory.` : ''}`)) {
                                         if (tenantId) {
                                           deleteDoc(doc(db, 'tenants', tenantId, 'categories', childCategory.id));
                                         }
                                       }
                                     }}
                                     showEdit={false}
                                     className="opacity-0 group-hover:opacity-100 transition-opacity"
                                   />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Products */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectedCategory ? `${selectedCategory} Products` : 'All Products'}
                    <Badge variant="outline" className="ml-2">
                      {filteredProducts.length}
                    </Badge>
                  </CardTitle>
                  <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
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
                          <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {productCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit">Add Product</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                            </div>
                            {product.categoryId && (
                              <Badge variant="secondary" className="w-fit">
                                {getCategoryPath(product.categoryId)}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {product.description || 'No description available.'}
                            </p>
                            <div className="flex justify-end">
                              <ActionButtons
                                onDelete={() => handleDeleteProduct(product.id)}
                                showEdit={false}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4" />
                      <p>
                        {searchTerm || selectedCategory
                          ? 'No products found matching your criteria.'
                          : 'No products found. Click Add Product to get started.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar - Categories and Subcategories */}
            <div className="w-full md:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Service Categories
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
                    
                    <Accordion type="single" collapsible className="w-full">
                      {serviceCategories.map(category => (
                        <AccordionItem key={category.id} value={category.id}>
                          <AccordionTrigger className="text-left">
                            {category.name}
                            <Badge variant="secondary" className="ml-2">
                              {services.filter(s => s.categoryId === category.id).length}
                            </Badge>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              <Button
                                variant={selectedCategory === category.id ? "default" : "ghost"}
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                All in {category.name}
                              </Button>
                              
                              {getChildCategories(category.id).map(childCategory => (
                                <div key={childCategory.id} className="flex items-center justify-between w-full group">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 justify-start pl-4"
                                    onClick={() => setSelectedCategory(childCategory.id)}
                                  >
                                    {childCategory.name}
                                    <Badge variant="outline" className="ml-auto">
                                      {services.filter(s => s.categoryId === childCategory.id).length}
                                    </Badge>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const serviceCount = services.filter(s => s.categoryId === childCategory.id).length;
                                      if (confirm(`Are you sure you want to delete the subcategory "${childCategory.name}"?${serviceCount > 0 ? ` This will also remove ${serviceCount} service${serviceCount > 1 ? 's' : ''} in this subcategory.` : ''}`)) {
                                        if (tenantId) {
                                          deleteDoc(doc(db, 'tenants', tenantId, 'categories', childCategory.id));
                                        }
                                      }
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                    </svg>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Services */}
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectedCategory ? `${selectedCategory} Services` : 'All Services'}
                    <Badge variant="outline" className="ml-2">
                      {filteredServices.length}
                    </Badge>
                  </CardTitle>
                  <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
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
                          <Select value={serviceCategoryId} onValueChange={setServiceCategoryId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit">Add Service</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredServices.map((service) => (
                        <Card key={service.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              <Badge variant="outline">${service.price.toFixed(2)}</Badge>
                            </div>
                            {service.categoryId && (
                              <Badge variant="secondary" className="w-fit">
                                {getCategoryPath(service.categoryId)}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {service.description || 'No description available.'}
                            </p>
                            <div className="flex justify-end">
                              <ActionButtons
                                onDelete={() => handleDeleteService(service.id)}
                                showEdit={false}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Wrench className="h-12 w-12 mx-auto mb-4" />
                      <p>
                        {searchTerm || selectedCategory
                          ? 'No services found matching your criteria.'
                          : 'No services found. Click Add Service to get started.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default function ProductsPage() {
  return <ProductsContent />;
}