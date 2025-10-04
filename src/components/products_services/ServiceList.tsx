'use client';

import { Service, Category, ProductTransactionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Button } from '@/components/ui/button';
import { Wrench, Layers, Plus } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  categories: Category[];
  selectedCategory: string | null;
  searchTerm: string;
  selectedTransactionType: ProductTransactionType | null;
  onEditService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onAddService?: () => void;
}

export function ServiceList({
  services,
  categories,
  selectedCategory,
  searchTerm,
  selectedTransactionType,
  onEditService,
  onDeleteService,
  onAddService,
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
    <div>
      <div className="mb-4 p-3 bg-muted/50 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">
              {selectedCategory
                ? `${categories.find((c) => c.id === selectedCategory)?.name || "Selected"} Category`
                : "All Services"
              }
            </h3>
            {selectedCategory && (
              <p className="text-sm text-muted-foreground">
                Showing services in this category
              </p>
            )}
          </div>
          {onAddService && (
            <Button onClick={onAddService} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          )}
        </div>
      </div>
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
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description || 'No description available.'}
                </p>
                
                {/* Variations Section */}
                {service.variations && service.variations.length > 0 && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Variations ({service.variations.length})</span>
                    </div>
                    <div className="space-y-1">
                      {service.variations.slice(0, 3).map((variation) => (
                        <div key={variation.id} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{variation.name}</span>
                          <span className="font-medium">{formatCurrency(variation.price)}</span>
                        </div>
                      ))}
                      {service.variations.length > 3 && (
                        <div className="text-xs text-muted-foreground italic">
                          +{service.variations.length - 3} more variations
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
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
    </div>
  );
}