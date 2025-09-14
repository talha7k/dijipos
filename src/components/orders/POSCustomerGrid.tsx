'use client';

import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface POSCustomerGridProps {
  customers: Customer[];
  onCustomerSelect: (customer: Customer) => void;
  onBack: () => void;
}

export function POSCustomerGrid({ customers, onCustomerSelect, onBack }: POSCustomerGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

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
          <Badge variant="outline" className="text-lg px-3 py-1">
            {filteredCustomers.length} customers
          </Badge>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredCustomers.map((customer) => (
              <Card 
                key={customer.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                onClick={() => onCustomerSelect(customer)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold truncate" title={customer.name}>
                    {customer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground truncate" title={customer.email}>
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="text-sm text-muted-foreground">
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="text-sm text-muted-foreground truncate" title={customer.address}>
                        {customer.address}
                      </div>
                    )}
                    {customer.vatNumber && (
                      <div className="text-sm text-muted-foreground">
                        VAT: {customer.vatNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
}