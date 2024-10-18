"use client"

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import ManageProducts from './ManageProducts';
import ManageCustomers from './ManageCustomers';
import ManageCategories from './ManageCategories';
import ManagePaymentTypes from './ManagePaymentTypes';
import ManageInventory from './ManageInventory';
import ManagePurchaseOrders from './ManagePurchaseOrders';
import ManageSuppliers from './ManageSuppliers';
import ManageStockMovements from './ManageStockMovements';

export default function ManageSection() {
  const [activeTab, setActiveTab] = useState("products");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (scrollRef.current) {
        scrollRef.current.style.width = `${window.innerWidth}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <div ref={scrollRef}>
          <TabsList className="inline-flex w-full justify-start p-1">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="payment-types">Payment Types</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="stock-movements">Stock Movements</TabsTrigger>
          </TabsList>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="products">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your product inventory here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageProducts />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="customers">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Manage your customer database here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageCustomers />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Manage product categories here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageCategories />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="payment-types">
        <Card>
          <CardHeader>
            <CardTitle>Payment Types</CardTitle>
            <CardDescription>Manage payment types here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManagePaymentTypes />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="inventory">
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>Manage your inventory here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageInventory />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="purchase-orders">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>Manage purchase orders here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManagePurchaseOrders />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="suppliers">
        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>Manage your suppliers here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageSuppliers />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="stock-movements">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movements</CardTitle>
            <CardDescription>Track stock movements here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageStockMovements />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}