import React, { createContext, useContext, ReactNode } from "react";
import { Order, OrderPayment, OrderStatus } from "@/types";

interface OrderContextType {
  orders: Order[];
  payments: { [orderId: string]: OrderPayment[] };
  organizationId: string | undefined;
  onOrderSelect: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onBack: () => void;
  onOrderUpdate?: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ 
  children, 
  value 
}: { 
  children: ReactNode; 
  value: OrderContextType;
}) {
  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}