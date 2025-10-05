import React from "react";
import { POSItemsGrid } from "@/components/pos/PosViews/POSItemsView";
import { POSCategoriesGrid } from "@/components/pos/POSCategoriesGrid";
import { POSBreadcrumb } from "@/components/pos/POSBreadcrumb";
import { POSTableGrid } from "@/components/pos/POSTableGrid";
import { POSCustomerGrid } from "@/components/pos/POSCustomerGrid";
import { POSOrderGrid } from "@/components/pos/PosViews/POSOrdersView";
import { POSPaymentGrid } from "@/components/pos/PosViews/POSPaymentView";
import {
  Category,
  Item,
  Table,
  Customer,
  Order,
  OrderPayment,
  PaymentType,
} from "@/types";

export type POSViewType =
  | "items"
  | "tables"
  | "customers"
  | "orders"
  | "payment";

interface POSViewsManagerProps {
  currentView: POSViewType;
  items: Item[];
  categories: Category[];
  tables: Table[];
  customers: Customer[];
  orders: Order[];
  paymentTypes: PaymentType[];
  selectedOrder: Order | null;
  categoryPath: string[];
  onCategoryClick: (categoryId: string) => void;
  onNavigateToPath: (path: string[]) => void;
  onItemClick: (item: Item) => void;
  onTableSelect: (table: Table) => void;
  onCustomerSelect: (customer: Customer) => void;
  onReopenOrder: (order: Order) => void;
  onBackToItems: () => void;
  onPaymentProcessed: (payments: OrderPayment[]) => Promise<void>;
  onOrderUpdate?: () => void;
}

export function POSViewsManager({
  currentView,
  items,
  categories,
  tables,
  customers,
  orders,
  paymentTypes,
  selectedOrder,
  categoryPath,
  onCategoryClick,
  onNavigateToPath,
  onItemClick,
  onTableSelect,
  onCustomerSelect,
  onReopenOrder,
  onBackToItems,
  onPaymentProcessed,
  onOrderUpdate,
}: POSViewsManagerProps) {
  switch (currentView) {
    case "items":
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
                      items={items}
                      categoryPath={categoryPath}
                      onCategoryClick={onCategoryClick}
                    />
                  </div>

                  {/* Uncategorized Items Section at Root Level */}
                  {items.filter((item) => !item.categoryId).length > 0 && (
                    <POSItemsGrid
                      categories={categories}
                      items={items}
                      categoryPath={["uncategorized"]}
                      onCategoryClick={onCategoryClick}
                      onItemClick={onItemClick}
                    />
                  )}
                </div>
              ) : (
                <POSItemsGrid
                  categories={categories}
                  items={items}
                  categoryPath={categoryPath}
                  onCategoryClick={onCategoryClick}
                  onItemClick={onItemClick}
                />
              )}
            </div>
          </div>
        </div>
      );

    case "tables":
      return (
        <POSTableGrid
          tables={tables}
          orders={orders}
          onTableSelect={onTableSelect}
          onBack={onBackToItems}
        />
      );

    case "customers":
      return (
        <POSCustomerGrid
          customers={customers}
          onCustomerSelect={onCustomerSelect}
          onBack={onBackToItems}
        />
      );

    case "orders":
      return (
        <POSOrderGrid
          orders={orders.filter((order) => order.status !== "cancelled")}
          onReopenOrder={onReopenOrder}
          onBack={onBackToItems}
          onOrderUpdate={onOrderUpdate}
        />
      );

    case "payment":
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
