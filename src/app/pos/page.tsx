"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useOrderContext } from '@/contexts/OrderContext';
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

export default function POSPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access POS</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Point of Sale</h1>
      <p>Welcome to the POS system. This page is under development.</p>
    </div>
  );
}