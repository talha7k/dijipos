import { useMemo, useState } from 'react';
import { useOrders } from './useOrders';
import { useCustomers } from './useCustomers';
import { useTables } from './useTables';
import { useProducts } from './useProducts';
import { useServices } from './useServices';
import { useInvoices } from './useInvoices';
import { useQuotes } from './useQuotes';
import { useStoreSettings } from './useStoreSettings';
import { useOrganization } from './useOrganization';
import { useAuth } from './useAuth';
import { useAtomValue } from 'jotai';
import { organizationUserRoleAtom } from '@/atoms';

import { OrderStatus, UserRole } from '@/types/enums';
import { startOfDay, endOfDay, subDays } from 'date-fns';

interface DashboardData {
  // Order statistics
  openOrdersCount: number;
  completedOrdersCount: number;
  totalOrdersToday: number;
  totalOrdersYesterday: number;
  
  // Customer statistics
  totalCustomers: number;
  
  // Table statistics
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  
  // Product/Service statistics
  totalProducts: number;
  totalServices: number;
  
  // Financial data (for managers/admins)
  totalSalesToday: number;
  totalSalesYesterday: number;
  vatAmountToday: number;
  
  // Top selling items
  topSellingItemsToday: Array<{
    id: string;
    name: string;
    quantity: number;
    total: number;
  }>;
  topSellingItemsYesterday: Array<{
    id: string;
    name: string;
    quantity: number;
    total: number;
  }>;
  
  // Order type breakdown (for managers/admins)
  salesByOrderTypeToday: Record<string, number>;
  salesByOrderTypeYesterday: Record<string, number>;
  
  // User info
  userName: string | null;
  userRole: UserRole | null;
  
  // Company info
  companyName: string | null;
  companyAddress: string | null;
  companyVatNumber: string | null;
  
  // Store settings preview
  vatRate: number | null;
}

interface DashboardHook {
  data: DashboardData;
  loading: boolean;
  dateFilter: 'today' | 'yesterday';
  setDateFilter: (filter: 'today' | 'yesterday') => void;
}

export function useDashboard(): DashboardHook {
  const { orders, loading: ordersLoading } = useOrders();
  const { customers, loading: customersLoading } = useCustomers();
  const { tables, loading: tablesLoading } = useTables();
  const { products, loading: productsLoading } = useProducts();
  const { services, loading: servicesLoading } = useServices();
  const { salesInvoices, loading: invoicesLoading } = useInvoices();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { storeSettings, loading: settingsLoading } = useStoreSettings();
  const { selectedOrganization } = useOrganization();
  const { user } = useAuth();
  
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday'>('today');

  const loading = ordersLoading || customersLoading || tablesLoading || 
                  productsLoading || servicesLoading || invoicesLoading || 
                  quotesLoading || settingsLoading;

  const userRole = useAtomValue(organizationUserRoleAtom)?.role || null;

  const data = useMemo(() => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    // Filter orders by date
    const ordersToday = orders.filter(order => {
      const orderDate = order.selectedDate ? new Date(order.selectedDate) : order.createdAt;
      return orderDate >= todayStart && orderDate <= todayEnd;
    });

    const ordersYesterday = orders.filter(order => {
      const orderDate = order.selectedDate ? new Date(order.selectedDate) : order.createdAt;
      return orderDate >= yesterdayStart && orderDate <= yesterdayEnd;
    });

    // Order statistics
    const openOrdersCount = orders.filter(order => order.status === OrderStatus.OPEN).length;
    const completedOrdersCount = orders.filter(order => order.status === OrderStatus.COMPLETED).length;
    const totalOrdersToday = ordersToday.length;
    const totalOrdersYesterday = ordersYesterday.length;

    // Customer statistics
    const totalCustomers = customers.length;

    // Table statistics
    const totalTables = tables.length;
    const availableTables = tables.filter(table => table.status === 'available').length;
    const occupiedTables = tables.filter(table => table.status === 'occupied').length;

    // Product/Service statistics
    const totalProducts = products.length;
    const totalServices = services.length;

    // Financial calculations
    const completedOrdersToday = ordersToday.filter(order => order.status === OrderStatus.COMPLETED);
    const completedOrdersYesterday = ordersYesterday.filter(order => order.status === OrderStatus.COMPLETED);

    const totalSalesToday = completedOrdersToday.reduce((sum, order) => sum + order.total, 0);
    const totalSalesYesterday = completedOrdersYesterday.reduce((sum, order) => sum + order.total, 0);
    const vatAmountToday = completedOrdersToday.reduce((sum, order) => sum + order.taxAmount, 0);

    // Top selling items calculation
    const getTopSellingItems = (ordersList: typeof completedOrdersToday, limit: number = 10) => {
      const allItems = ordersList.flatMap(order => order.items);
      const itemSales: Record<string, { id: string; name: string; quantity: number; total: number }> = {};
      
      allItems.forEach(item => {
        if (!itemSales[item.id]) {
          itemSales[item.id] = { id: item.id, name: item.name, quantity: 0, total: 0 };
        }
        itemSales[item.id].quantity += item.quantity;
        itemSales[item.id].total += item.total;
      });

      return Object.values(itemSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
    };

    const topSellingItemsToday = getTopSellingItems(completedOrdersToday);
    const topSellingItemsYesterday = getTopSellingItems(completedOrdersYesterday);

    // Order type breakdown
    const getSalesByOrderType = (ordersList: typeof completedOrdersToday) => {
      return ordersList.reduce((acc, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + order.total;
        return acc;
      }, {} as Record<string, number>);
    };

    const salesByOrderTypeToday = getSalesByOrderType(completedOrdersToday);
    const salesByOrderTypeYesterday = getSalesByOrderType(completedOrdersYesterday);

    // User info
    const userName = user?.displayName || user?.email || null;

    // Company info
    const companyName = selectedOrganization?.name || null;
    const companyAddress = selectedOrganization?.address || null;
    const companyVatNumber = selectedOrganization?.vatNumber || null;

    // Store settings preview
    const vatRate = storeSettings?.vatSettings?.rate || null;

    return {
      openOrdersCount,
      completedOrdersCount,
      totalOrdersToday,
      totalOrdersYesterday,
      totalCustomers,
      totalTables,
      availableTables,
      occupiedTables,
      totalProducts,
      totalServices,
      totalSalesToday,
      totalSalesYesterday,
      vatAmountToday,
      topSellingItemsToday,
      topSellingItemsYesterday,
      salesByOrderTypeToday,
      salesByOrderTypeYesterday,
      userName,
      userRole,
      companyName,
      companyAddress,
      companyVatNumber,
      vatRate,
    };
  }, [
    orders,
    customers,
    tables,
    products,
    services,
    salesInvoices,
    quotes,
    storeSettings,
    selectedOrganization,
    user,
    dateFilter,
  ]);

  return {
    data,
    loading,
    dateFilter,
    setDateFilter,
  };
}