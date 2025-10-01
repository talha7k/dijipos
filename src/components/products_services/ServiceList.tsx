'use client';

import { Service, Category, ProductTransactionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Wrench } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  categories: Category[];
  selectedCategory: string | null;
  searchTerm: string;
  selectedTransactionType: ProductTransactionType | null;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

export function ServiceList({
  services,
  categories,
  selectedCategory,
  searchTerm,
  selectedTransactionType,
  onEditService,
  onDeleteService
}: ServiceListProps) {
  const { formatCurrency } = useCurrency();

  const getCategoryPath = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || service.categoryId === selectedCategory;
    
    const matchesTransactionType = !selectedTransactionType || service.transactionType === selectedTransactionType;
    
    return matchesSearch && matchesCategory && matchesTransactionType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedCategory 
            ? `${categories.find(c => c.id === selectedCategory)?.name || 'Selected'} Services` 
            : 'All Services'
          }
          <Badge variant="outline" className="ml-2">
            {filteredServices.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline">{formatCurrency(service.price)}</Badge>
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
                      onEdit={() => onEditService(service)}
                      onDelete={() => onDeleteService(service.id)}
                      showEdit={true}
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
                : 'No services found. Click Add Service to get started.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}