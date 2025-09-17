import React from 'react';
import { POSItemsGrid } from '@/components/orders/POSItemsGrid';
import { POSCategoriesGrid } from '@/components/orders/POSCategoriesGrid';
import { POSBreadcrumb } from '@/components/orders/POSBreadcrumb';
import { POSTableGrid } from '@/components/orders/POSTableGrid';
import { POSCustomerGrid } from '@/components/orders/POSCustomerGrid';
import { POSOrderGrid } from '@/components/orders/POSOrderGrid';
import { POSPaymentGrid } from '@/components/orders/POSPaymentGrid';
import { Category, Product, Service, Table, Customer, Order, OrderPayment, PaymentType } from '@/types';

export type POSViewType = 'items' | 'tables' | 'customers' | 'orders' | 'payment';

interface POSViewsManagerProps {
  currentView: POSViewType;
  products: Product[];
  services: Service[];
  categories: Category[];
  tables: Table[];
  customers: Customer[];
  orders: Order[];
  orderPayments: { [orderId: string]: OrderPayment[] };
  paymentTypes: PaymentType[];
  selectedOrder: Order | null;
  categoryPath: string[];
  organizationId?: string;
  onCategoryClick: (categoryId: string) => void;
  onNavigateToRoot: () => void;
  onNavigateToPath: (path: string[]) => void;
  onItemClick: (item: Product | Service, type: 'product' | 'service') => void;
  onTableSelect: (table: Table) => void;
  onCustomerSelect: (customer: Customer) => void;
  onOrderSelect: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onBackToItems: () => void;
  onPaymentProcessed: (payments: OrderPayment[]) => Promise<void>;
}

export function POSViewsManager({
  currentView,
  products,
  services,
  categories,
  tables,
  customers,
  orders,
  orderPayments,
  paymentTypes,
  selectedOrder,
  categoryPath,
  organizationId,
  onCategoryClick,
  onNavigateToRoot,
  onNavigateToPath,
  onItemClick,
  onTableSelect,
  onCustomerSelect,
  onOrderSelect,
  onPayOrder,
  onBackToItems,
  onPaymentProcessed,
}: POSViewsManagerProps) {
  switch (currentView) {
    case 'items':
      return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0">
          {/* Items Grid */}
          <div className="overflow-auto bg-background">
            {/* Breadcrumb - only shown in items view */}
            <POSBreadcrumb
              categoryPath={categoryPath}
              categories={categories}
              onNavigateToPath={onNavigateToPath}
            />

            <div className="p-4">
              {categoryPath.length === 0 ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Categories</h3>
                    <POSCategoriesGrid
                      categories={categories}
                      products={products}
                      services={services}
                      categoryPath={categoryPath}
                      onCategoryClick={onCategoryClick}
                    />
                  </div>

                  {/* Uncategorized Items Section at Root Level */}
                  {(products.filter(p => !p.categoryId).length > 0 || services.filter(s => !s.categoryId).length > 0) && (
                    <POSItemsGrid
                      categories={categories}
                      products={products}
                      services={services}
                      categoryPath={['uncategorized']}
                      onCategoryClick={onCategoryClick}
                      onItemClick={onItemClick}
                    />
                  )}
                </div>
              ) : (
                <POSItemsGrid
                  categories={categories}
                  products={products}
                  services={services}
                  categoryPath={categoryPath}
                  onCategoryClick={onCategoryClick}
                  onItemClick={onItemClick}
                />
              )}
            </div>
          </div>
        </div>
      );

    case 'tables':
      return (
        <POSTableGrid
          tables={tables}
          orders={orders}
          onTableSelect={onTableSelect}
          onBack={onBackToItems}
        />
      );

    case 'customers':
      return (
        <POSCustomerGrid
          customers={customers}
          onCustomerSelect={onCustomerSelect}
          onBack={onBackToItems}
        />
      );

    case 'orders':
      return (
        <POSOrderGrid
          orders={orders.filter(order => order.status !== 'cancelled')}
          payments={orderPayments}
          onOrderSelect={onOrderSelect}
          onPayOrder={onPayOrder}
          onBack={onBackToItems}
        />
      );

    case 'payment':
      if (!selectedOrder) return null;
      return (
        <POSPaymentGrid
          order={selectedOrder}
          paymentTypes={paymentTypes}
          onPaymentProcessed={onPaymentProcessed}
          onBack={onBackToItems}
        />
      );

    default:
      return null;
  }
}