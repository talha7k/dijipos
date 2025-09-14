'use client';

import { useState } from "react";
import { Order } from "@/types";

export function useOrderSelection() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const selectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const clearSelection = () => {
    setSelectedOrder(null);
  };

  const hasSelection = selectedOrder !== null;

  return {
    selectedOrder,
    selectOrder,
    clearSelection,
    hasSelection,
  };
}