'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Users, Upload, X } from 'lucide-react';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Customer } from '@/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function CustomersPage() {
  const { organizationId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    address: '',
    phone: '',
    vatNumber: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (!organizationId) return;

    // Fetch customers
    const customersQ = query(collection(db, 'tenants', organizationId, 'customers'));
    const customersUnsubscribe = onSnapshot(customersQ, (querySnapshot) => {
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Customer[];
      setCustomers(customersData);
      setLoading(false);
    });

    return () => {
      customersUnsubscribe();
    };
  }, [organizationId]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      nameAr: '',
      email: '',
      address: '',
      phone: '',
      vatNumber: '',
      logoUrl: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      nameAr: customer.nameAr || '',
      email: customer.email,
      address: customer.address || '',
      phone: customer.phone || '',
      vatNumber: customer.vatNumber || '',
      logoUrl: customer.logoUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!organizationId) return;
    if (confirm('Are you sure you want to delete this customer?')) {
      await deleteDoc(doc(db, 'tenants', organizationId, 'customers', id));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploadingLogo(true);
    
    try {
      const storageRef = ref(storage, `customers/${Date.now()}_logo`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, logoUrl: downloadUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSaveCustomer = async () => {
    if (!organizationId) return;

    if (editingCustomer) {
      // Update existing customer
      await updateDoc(doc(db, 'tenants', organizationId, 'customers', editingCustomer.id), {
        ...formData,
        updatedAt: new Date(),
      });
    } else {
      // Add new customer
      await addDoc(collection(db, 'tenants', organizationId, 'customers'), {
        ...formData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setIsDialogOpen(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Customers</h1>
        </div>
        <Button onClick={handleAddCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No customers found. Add your first customer to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>VAT Number</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell>{customer.vatNumber || '-'}</TableCell>
                    <TableCell>
                      <ActionButtons
                        onEdit={() => handleEditCustomer(customer)}
                        onDelete={() => handleDeleteCustomer(customer.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name (English) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name in English"
                />
              </div>
              <div>
                <Label htmlFor="nameAr">Name (Arabic)</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="Customer name in Arabic"
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-234-567-8900"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city, country"
              />
            </div>
            <div>
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                placeholder="VAT number"
              />
            </div>
            <div className="space-y-4">
              <Label>Customer Logo</Label>
              <div className="flex items-center space-x-4">
                {formData.logoUrl ? (
                  <div className="relative">
                    <img 
                      src={formData.logoUrl} 
                      alt="Customer Logo" 
                      className="w-24 h-24 object-contain border rounded"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Logo</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button variant="outline" loading={uploadingLogo}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCustomer}>
                {editingCustomer ? 'Update' : 'Add'} Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}