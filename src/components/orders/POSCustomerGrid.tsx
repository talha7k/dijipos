'use client';

import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { QuickAddCustomerDialog } from './QuickAddCustomerDialog';
import { CustomerCard } from './CustomerCard';

interface POSCustomerGridProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onBack: () => void;
  onCustomerAdded?: () => void;
}

export function POSCustomerGrid({ customers, onCustomerSelect, onBack, onCustomerAdded }: POSCustomerGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    searchTerm === '' ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="bg-card shadow p-4 border-b">
         <div className="flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <Button variant="ghost" size="sm" onClick={onBack}>
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back
             </Button>
             <h1 className="text-2xl font-bold text-foreground">Select Customer</h1>
           </div>
           <div className="flex items-center space-x-4">
             <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className="h-4 w-4 mr-2" />
               Add Customer
             </Button>
             <Badge variant="outline" className="text-lg px-3 py-1">
               {filteredCustomers.length} customers
             </Badge>
           </div>
         </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b bg-card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="flex-1 overflow-auto p-6 bg-background">
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={onCustomerSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">
              {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
            </p>
            <p className="text-sm mt-2">
              {searchTerm ? 'Try adjusting your search terms.' : 'Add customers to get started.'}
            </p>
          </div>
        )}
      </div>

      <QuickAddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCustomerAdded={onCustomerAdded}
      />
    </div>
  );
}