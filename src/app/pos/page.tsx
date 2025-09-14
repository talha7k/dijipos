'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProductsData } from '@/hooks/products_services/use-products-data';
import { useServicesData } from '@/hooks/products_services/use-services-data';
import { useCategoriesData } from '@/hooks/products_services/use-categories-data';
import { useTablesData } from '@/hooks/tables/use-tables-data';
import { useCustomersData } from '@/hooks/customers/use-customers-data';
import { useOrdersData } from '@/hooks/orders/use-order-data';
import { useOrderTypesData } from '@/hooks/orders/use-order-types-data';
import { usePaymentTypesData } from '@/hooks/use-payment-types-data';
import { usePaymentsData } from '@/hooks/use-payments-data';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';

import { POSLayout, POSLeftColumn, POSHeaderContainer, POSMainContent, POSRightColumn } from './components/POSLayout';
import { POSHeader } from '@/components/orders/POSHeader';
import { POSViewsManager } from './components/POSViewsManager';
import { POSCartSidebar } from '@/components/orders/POSCartSidebar';
import { usePOSLogic } from '@/hooks/pos/usePOSLogic';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PaymentSuccessDialog } from '@/components/PaymentSuccessDialog';
import { CartItemModal } from '@/components/orders/CartItemModal';

export default function SimplifiedPOSPage() {
  const { organizationId } = useAuth();

  // Data hooks
  const { products = [], loading: productsLoading } = useProductsData(organizationId || '');
  const { services = [], loading: servicesLoading } = useServicesData(organizationId || '');
  const { categories = [], loading: categoriesLoading } = useCategoriesData(organizationId || '');
  const { tables = [], loading: tablesLoading } = useTablesData(organizationId || '');
  const { customers = [], loading: customersLoading } = useCustomersData(organizationId || '');
  const { orders = [], loading: ordersLoading } = useOrdersData(organizationId || '');
  const { paymentTypes = [], loading: paymentTypesLoading } = usePaymentTypesData(organizationId || '');
  const { payments: orderPayments = {}, loading: orderPaymentsLoading } = usePaymentsData(organizationId || '');
  const { receiptTemplates = [], loading: receiptTemplatesLoading } = useReceiptTemplatesData(organizationId || '');
  const { orderTypes = [], loading: orderTypesLoading } = useOrderTypesData(organizationId || '');

  // Use the custom POS logic hook
  const {
    cart,
    cartTotal,
    posView,
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

  // Loading state
  const loading = productsLoading || servicesLoading || categoriesLoading || 
                 tablesLoading || customersLoading || ordersLoading || 
                 paymentTypesLoading || orderPaymentsLoading || receiptTemplatesLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading POS...</div>
      </div>
    );
  }

  return (
    <POSLayout>
      <POSLeftColumn>
        <POSHeaderContainer>
          <POSHeader
            cart={cart}
            cartTotal={cartTotal}
            selectedTable={selectedTable}
            selectedCustomer={selectedCustomer}
            orderTypes={orderTypes}
             selectedOrderType={selectedOrderType}
             onTableSelect={handleTableSelect}
             onCustomerSelect={handleCustomerSelect}
             onOrderTypeSelect={handleOrderTypeSelect}
            onTableDeselect={handleTableDeselect}
            onCustomerDeselect={handleCustomerDeselect}
            onOrderTypeDeselect={handleOrderTypeDeselect}
            onOrdersClick={handleOrdersClick}
          />
        </POSHeaderContainer>

        <POSMainContent>
          <POSViewsManager
            currentView={posView}
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
            onPaymentProcessed={handlePaymentProcessed}
          />
        </POSMainContent>
      </POSLeftColumn>

      <POSRightColumn>
        <POSCartSidebar
          cart={cart}
          cartTotal={cartTotal}
          onItemClick={(item) => {
            setEditingCartItem(item);
            setShowCartItemModal(true);
          }}
           onPayOrder={handlePayOrder}
          onSaveOrder={handleSaveOrder}
          onPrintReceipt={() => {}}
          onClearCart={handleClearCart}
        />
      </POSRightColumn>

      {/* Order Confirmation Dialog */}
      <AlertDialog open={showOrderConfirmationDialog} onOpenChange={setShowOrderConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current cart with order #{pendingOrderToReopen?.orderNumber}. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowOrderConfirmationDialog(false)}>
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
          item={editingCartItem}
          isOpen={showCartItemModal}
          onClose={() => setShowCartItemModal(false)}
          onUpdateQuantity={(itemId, newQuantity) => {
            // Handle quantity update
            if (editingCartItem) {
              updateCartItem(itemId, editingCartItem.type, {
                quantity: newQuantity,
                total: newQuantity * editingCartItem.price
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