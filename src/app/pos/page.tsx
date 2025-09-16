"use client";

import React from "react";
import { useOrganizationId } from "@/legacy_hooks/useAuthState";
import { CartItem, ItemType } from "@/types";
import { useProductsData } from "@/legacy_hooks/products_services/useProducts";
import { useServicesData } from "@/legacy_hooks/products_services/useServices";
import { useCategoriesData } from "@/legacy_hooks/products_services/useCategories";
import { useTablesData } from "@/legacy_hooks/tables/useTables";
import { useCustomersData } from "@/legacy_hooks/useCustomerState";
import { useOrders } from "@/legacy_hooks/orders/useOrders";
import { useOrderTypes } from "@/legacy_hooks/useOrderTypes";
import { usePaymentTypes } from "@/legacy_hooks/uePaymentTypes";

import {
  POSLayout,
  POSLeftColumn,
  POSHeaderContainer,
  POSMainContent,
  POSRightColumn,
} from "./components/POSLayout";
import { POSHeader } from "@/components/orders/POSHeader";
import { POSViewsManager } from "./components/POSViewsManager";
import { POSCartSidebar } from "@/components/orders/POSCartSidebar";
import { usePOSLogic } from "@/legacy_hooks/pos/usePOSState";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentSuccessDialog } from "@/components/PaymentSuccessDialog";
import { CartItemModal } from "@/components/orders/CartItemModal";

export default function SimplifiedPOSPage() {
  const organizationId = useOrganizationId();

  // Data hooks
  const { products = [], loading: productsLoading } = useProductsData(
    organizationId || ""
  );
  const { services = [], loading: servicesLoading } = useServicesData(
    organizationId || ""
  );
  const { categories = [], loading: categoriesLoading } = useCategoriesData(
    organizationId || ""
  );
  const { tables = [], loading: tablesLoading } = useTablesData(
    organizationId || ""
  );
  const { customers = [], loading: customersLoading } = useCustomersData(
    organizationId || ""
  );
  const {
    orders = [],
    orderPayments = {},
    loading: ordersLoading,
    paymentsLoading: orderPaymentsLoading
  } = useOrders(organizationId || undefined);
  const { orderTypes = [] } = useOrderTypes(organizationId || undefined);
  const { paymentTypes = [], loading: paymentTypesLoading } =
    usePaymentTypes(organizationId || undefined);

  // Use the custom POS logic hook
  const {
    cartItems,
    cartTotal,
    posView: currentView,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    categoryPath,
    showOrderConfirmationDialog,
    pendingOrderToReopen,
    showPaymentSuccessDialog,
    paymentSuccessData,
    showCartItemModal,
    editingCartItem,
    handleAddToCart,
    handleTableSelected,
    handleCustomerSelected,
    handleOrderTypeSelect,
    handleOrderReopen,
    proceedWithOrderReopen,
    handleSaveOrder,
    handlePaymentProcessed,
    handleClearCart,
    handleBackToItems,
    handleTableDeselect,
    handleCustomerDeselect,
    handleOrderTypeDeselect,
    handleTableSelect,
    handleCustomerSelect,
    handleOrdersClick,
    handleCategoryClick,
    handleNavigateToRoot,
    handleNavigateToPath,
    handlePayOrder,
    updateCartItem,
    removeFromCart,
    setShowOrderConfirmationDialog,
    setShowCartItemModal,
    setEditingCartItem,
    setShowPaymentSuccessDialog,
  } = usePOSLogic();

  // Loading state - exclude ordersLoading and orderPaymentsLoading when viewing orders to prevent stuck loading
  const loading =
    productsLoading ||
    servicesLoading ||
    categoriesLoading ||
    tablesLoading ||
    customersLoading ||
    (currentView !== 'orders' ? ordersLoading : false) ||
    paymentTypesLoading ||
    (currentView !== 'orders' ? orderPaymentsLoading : false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading POS...</div>
      </div>
    );
  }

  // Transform CartItem[] to CartItem[] for component compatibility
  const cartForComponents = (cartItems || []).map((item) => ({
    id: item.id,
    type: item.type === "product" ? ("product" as const) : ("service" as const),
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    total: item.total,
  }));

  return (
    <POSLayout>
      <POSLeftColumn>
        <POSHeaderContainer>
          <POSHeader
            cartItems={cartForComponents}
            cartTotal={cartTotal}
            selectedTable={selectedTable}
            selectedCustomer={selectedCustomer}
            selectedOrder={selectedOrder}
            orderTypes={orderTypes}
            selectedOrderType={selectedOrderType}
            onTableSelect={handleTableSelect}
            onCustomerSelect={handleCustomerSelect}
            onOrderTypeSelect={handleOrderTypeSelect}
            onTableDeselect={handleTableDeselect}
            onCustomerDeselect={handleCustomerDeselect}
            onOrderTypeDeselect={handleOrderTypeDeselect}
            onOrdersClick={handleOrdersClick}
            onOrderToggle={handleBackToItems}
          />
        </POSHeaderContainer>

        <POSMainContent>
            <POSViewsManager
              currentView={currentView as import('./components/POSViewsManager').POSViewType}
             products={products}
             services={services}
             categories={categories}
             tables={tables}
             customers={customers}
             orders={orders}
             orderPayments={orderPayments}
             paymentTypes={paymentTypes}
             selectedOrder={selectedOrder}
             categoryPath={categoryPath}
             organizationId={organizationId || undefined}
             onCategoryClick={handleCategoryClick}
             onNavigateToRoot={handleNavigateToRoot}
             onNavigateToPath={handleNavigateToPath}
             onItemClick={handleAddToCart}
             onTableSelect={handleTableSelected}
             onCustomerSelect={handleCustomerSelected}
             onOrderSelect={handleOrderReopen}
             onPayOrder={() => {}}
             onBackToItems={handleBackToItems}
             onPaymentProcessed={async (payments) => {
               await handlePaymentProcessed(payments);
             }}
           />
        </POSMainContent>
      </POSLeftColumn>

      <POSRightColumn>
        <POSCartSidebar
          cartItems={cartForComponents}
          cartTotal={cartTotal}
          onItemClick={(item) => {
            // Transform CartItem back to CartItem for state management
            const CartItem: CartItem = {
              id: item.id,
              type:
                item.type === "product" ? ItemType.PRODUCT : ItemType.SERVICE,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              total: item.total,
            };
            setEditingCartItem(CartItem);
            setShowCartItemModal(true);
          }}
          onPayOrder={handlePayOrder}
          onSaveOrder={handleSaveOrder}
          onPrintReceipt={() => {}}
          onClearCart={handleClearCart}
        />
      </POSRightColumn>

      {/* Order Confirmation Dialog */}
      <AlertDialog
        open={showOrderConfirmationDialog}
        onOpenChange={setShowOrderConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current cartItems with order #
              {pendingOrderToReopen?.orderNumber}. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowOrderConfirmationDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithOrderReopen}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        isOpen={showPaymentSuccessDialog}
        onClose={() => setShowPaymentSuccessDialog(false)}
        totalPaid={paymentSuccessData?.totalPaid || 0}
        onViewOrders={handleBackToItems}
      />

      {/* Cart Item Modal */}
      {editingCartItem && (
        <CartItemModal
          item={{
            id: editingCartItem.id,
            type:
              editingCartItem.type === ItemType.PRODUCT ? "product" : "service",
            name: editingCartItem.name,
            price: editingCartItem.unitPrice,
            quantity: editingCartItem.quantity,
            total: editingCartItem.total,
          }}
          isOpen={showCartItemModal}
          onClose={() => setShowCartItemModal(false)}
          onUpdateQuantity={(itemId, newQuantity) => {
            // Handle quantity update
            if (editingCartItem) {
              updateCartItem(itemId, editingCartItem.type, {
                quantity: newQuantity,
                total: newQuantity * editingCartItem.unitPrice,
              });
            }
            setShowCartItemModal(false);
          }}
          onDeleteItem={(itemId) => {
            // Handle item deletion
            if (editingCartItem) {
              removeFromCart(itemId, editingCartItem.type);
            }
            setShowCartItemModal(false);
          }}
        />
      )}
    </POSLayout>
  );
}
