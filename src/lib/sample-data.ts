// Sample data for customers, products, and services
// This would typically come from a database

import {
  Invoice,
  PurchaseInvoice,
  SalesInvoice,
  Category,
  Item,
  Table,
  Order,
  Customer,
  Supplier,
  OrderType,
  PaymentType,
  ItemType,
  CategoryType,
  TableStatus,
  OrderStatus,
  PaymentStatus,
  InvoiceStatus,
  PurchaseInvoiceStatus,
  InvoiceType,
  ProductTransactionType,
} from "@/types";
import { InvoiceTemplateType } from "@/types/enums";

// Sample categories
export const sampleCategories: Omit<Category, "organizationId">[] = [
  {
    id: "cat1",
    name: "Food & Beverages",
    description: "Food and drink items",
    type: CategoryType.PRODUCT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat2",
    name: "Appetizers",
    description: "Starters and small plates",
    type: CategoryType.PRODUCT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat3",
    name: "Main Courses",
    description: "Main dishes",
    type: CategoryType.PRODUCT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat4",
    name: "Desserts",
    description: "Sweet treats and desserts",
    type: CategoryType.PRODUCT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat5",
    name: "Beverages",
    description: "Drinks and refreshments",
    type: CategoryType.PRODUCT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat6",
    name: "IT Services",
    description: "Information technology services",
    type: CategoryType.SERVICE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat7",
    name: "Consulting",
    description: "Business consulting services",
    type: CategoryType.SERVICE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample products
export const sampleProducts: Omit<Item, "organizationId">[] = [
  {
    id: "p1",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil",
    price: 15.99,
    categoryId: "cat3",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p2",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing and croutons",
    price: 12.5,
    categoryId: "cat2",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p3",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon grilled to perfection",
    price: 24.99,
    categoryId: "cat3",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p4",
    name: "Chocolate Cake",
    description: "Rich chocolate cake with vanilla frosting",
    price: 8.99,
    categoryId: "cat4",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p5",
    name: "Cappuccino",
    description: "Espresso with steamed milk and foam",
    price: 4.5,
    categoryId: "cat5",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p6",
    name: "French Fries",
    description: "Crispy golden french fries",
    price: 6.99,
    categoryId: "cat2",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p7",
    name: "Chicken Burger",
    description: "Grilled chicken burger with lettuce and tomato",
    price: 13.99,
    categoryId: "cat3",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p8",
    name: "Ice Cream Sundae",
    description: "Vanilla ice cream with chocolate sauce and nuts",
    price: 7.5,
    categoryId: "cat4",
    itemType: ItemType.PRODUCT,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample services
export const sampleServices: Omit<Item, "organizationId">[] = [
  {
    id: "s1",
    name: "IT Support",
    description: "Technical support and maintenance",
    price: 85.0,
    categoryId: "cat6",
    itemType: ItemType.SERVICE,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "s2",
    name: "Business Consulting",
    description: "Strategic business consulting services",
    price: 200.0,
    categoryId: "cat7",
    itemType: ItemType.SERVICE,
    transactionType: ProductTransactionType.SALES,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample customers
export const sampleCustomers: Omit<Customer, "organizationId">[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@email.com",
    address: "123 Main St, City, Country",
    phone: "+1-234-567-8900",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    address: "456 Oak Ave, City, Country",
    phone: "+1-234-567-8901",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c3",
    name: "Mike Davis",
    email: "mike.davis@company.com",
    address: "789 Pine St, City, Country",
    phone: "+1-234-567-8902",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c4",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    address: "321 Elm Dr, City, Country",
    phone: "+1-234-567-8903",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "c5",
    name: "David Brown",
    email: "david.brown@business.com",
    address: "654 Maple Ln, City, Country",
    phone: "+1-234-567-8904",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample suppliers
export const sampleSuppliers: Omit<Supplier, "organizationId">[] = [
  {
    id: "sup1",
    name: "Fresh Foods Co",
    email: "orders@freshfoods.com",
    address: "123 Supply St, City, Country",
    phone: "+1-234-567-8905",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sup2",
    name: "Beverage Distributors",
    email: "sales@beverages.com",
    address: "456 Drink Ave, City, Country",
    phone: "+1-234-567-8906",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sup3",
    name: "Bakery Supplies Ltd",
    email: "info@bakery.com",
    address: "789 Bread Blvd, City, Country",
    phone: "+1-234-567-8907",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sup4",
    name: "Dairy Products Inc",
    email: "contact@dairy.com",
    address: "321 Milk Ln, City, Country",
    phone: "+1-234-567-8908",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sup5",
    name: "Meat & Poultry Corp",
    email: "support@meat.com",
    address: "654 Protein Drive, City, Country",
    phone: "+1-234-567-8909",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample tables
export const sampleTables: Omit<Table, "organizationId">[] = [
  {
    id: "t1",
    name: "Table 1",
    capacity: 4,
    status: TableStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t2",
    name: "Table 2",
    capacity: 2,
    status: TableStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t3",
    name: "Table 3",
    capacity: 6,
    status: TableStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t4",
    name: "Table 4",
    capacity: 4,
    status: TableStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "t5",
    name: "Bar Counter",
    capacity: 8,
    status: TableStatus.AVAILABLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample order types
export const sampleOrderTypes: Omit<OrderType, "organizationId">[] = [
  {
    id: "ot1",
    name: "Dine In",
    description: "Customer dining in the restaurant",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "ot2",
    name: "Take Away",
    description: "Customer taking food to go",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "ot3",
    name: "Delivery",
    description: "Food delivered to customer address",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample payment types
export const samplePaymentTypes: Omit<PaymentType, "organizationId">[] = [
  {
    id: "pt1",
    name: "Cash",
    description: "Payment in cash",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pt2",
    name: "Credit Card",
    description: "Payment by credit card",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pt3",
    name: "Debit Card",
    description: "Payment by debit card",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pt4",
    name: "Online Payment",
    description: "Payment through online gateway",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample orders
export const sampleOrders: Omit<Order, "organizationId">[] = [
  {
    id: "o1",
    orderNumber: "ORD-001",
    items: [
      {
        id: "oi1",
        type: ItemType.PRODUCT,
        itemId: "p1",
        name: "Margherita Pizza",
        quantity: 2,
        unitPrice: 15.99,
        total: 31.98,
      },
      {
        id: "oi2",
        type: ItemType.PRODUCT,
        itemId: "p5",
        name: "Cappuccino",
        quantity: 2,
        unitPrice: 4.5,
        total: 9.0,
      },
    ],
    subtotal: 40.98,
    taxRate: 15,
    taxAmount: 6.15,
    total: 47.13,
    status: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    customerName: "John Smith",
    customerPhone: "+1-234-567-8900",
    tableId: "t1",
    tableName: "Table 1",
    orderType: "Dine In",
    createdById: "user1",
    createdByName: "Admin User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "o2",
    orderNumber: "ORD-002",
    items: [
      {
        id: "oi3",
        type: ItemType.PRODUCT,
        itemId: "p7",
        name: "Chicken Burger",
        quantity: 1,
        unitPrice: 13.99,
        total: 13.99,
      },
      {
        id: "oi4",
        type: ItemType.PRODUCT,
        itemId: "p6",
        name: "French Fries",
        quantity: 1,
        unitPrice: 6.99,
        total: 6.99,
      },
      {
        id: "oi5",
        type: ItemType.PRODUCT,
        itemId: "p8",
        name: "Ice Cream Sundae",
        quantity: 1,
        unitPrice: 7.5,
        total: 7.5,
      },
    ],
    subtotal: 28.48,
    taxRate: 15,
    taxAmount: 4.27,
    total: 32.75,
    status: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
    customerName: "Sarah Johnson",
    customerPhone: "+1-234-567-8901",
    orderType: "Take Away",
    createdById: "user1",
    createdByName: "Admin User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper functions to get combobox options
export const getCustomerOptions = (
  customers: Omit<Customer, "organizationId">[],
) => {
  return customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    description: customer.email,
  }));
};

export const getProductOptions = (products: Omit<Item, "organizationId">[]) => {
  return products.map((product) => ({
    value: product.id,
    label: product.name,
    description: `$${product.price.toFixed(2)}`,
  }));
};

export const getServiceOptions = (services: Omit<Item, "organizationId">[]) => {
  return services.map((service) => ({
    value: service.id,
    label: service.name,
    description: `$${service.price.toFixed(2)}`,
  }));
};

// Helper functions for mixed product/service arrays
export const getProductOptionsFromMixed = (
  items: (
    | (Omit<Item, "organizationId"> & { type: ItemType.PRODUCT })
    | (Omit<Item, "organizationId"> & { type: ItemType.SERVICE })
  )[],
) => {
  return items
    .filter((item) => item.type === ItemType.PRODUCT)
    .map((item) => ({
      value: item.id,
      label: item.name,
      description: `$${item.price.toFixed(2)}`,
    }));
};

export const getServiceOptionsFromMixed = (
  items: (
    | (Omit<Item, "organizationId"> & { type: ItemType.PRODUCT })
    | (Omit<Item, "organizationId"> & { type: ItemType.SERVICE })
  )[],
) => {
  return items
    .filter((item) => item.type === ItemType.SERVICE)
    .map((item) => ({
      value: item.id,
      label: item.name,
      description: `$${item.price.toFixed(2)}`,
    }));
};

export const getSupplierOptions = (
  suppliers: Omit<Supplier, "organizationId">[],
) => {
  return suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
    description: supplier.email,
  }));
};

export const getTableOptions = (tables: Table[]) => {
  return tables.map((table) => ({
    value: table.id,
    label: table.name,
    description: `Capacity: ${table.capacity}`,
  }));
};

export const getOrderTypeOptions = (orderTypes: OrderType[]) => {
  return orderTypes.map((type) => ({
    value: type.id,
    label: type.name,
    description: type.description,
  }));
};

export const getPaymentTypeOptions = (paymentTypes: PaymentType[]) => {
  return paymentTypes.map((type) => ({
    value: type.id,
    label: type.name,
    description: type.description,
  }));
};

export const getCustomerById = (
  customers: Omit<Customer, "organizationId">[],
  id: string,
) => {
  return customers.find((customer) => customer.id === id);
};

export const getSupplierById = (
  suppliers: Omit<Supplier, "organizationId">[],
  id: string,
) => {
  return suppliers.find((supplier) => supplier.id === id);
};

// Sample purchase invoices
export const samplePurchaseInvoices: Omit<PurchaseInvoice, "organizationId">[] =
  [
    {
      id: "pi1",
      type: InvoiceType.PURCHASE,
      supplierId: "sup1",
      supplierName: "Fresh Foods Co",
      supplierEmail: "orders@freshfoods.com",
      supplierAddress: "123 Supply St, City, Country",
      supplierVAT: "VAT123456",
      invoiceNumber: "SUP-2024-001",
      invoiceDate: new Date("2024-01-15"),
      items: [
        {
          id: "item1",
          itemType: ItemType.PRODUCT,
          itemId: "p1",
          name: "Margherita Pizza Ingredients",
          description: "Tomatoes, cheese, dough supplies",
          quantity: 50,
          unitPrice: 25.0,
          total: 1250.0,
        },
        {
          id: "item2",
          itemType: ItemType.PRODUCT,
          itemId: "p2",
          name: "Fresh Vegetables",
          description: "Lettuce, tomatoes, herbs for salads",
          quantity: 30,
          unitPrice: 15.0,
          total: 450.0,
        },
      ],
      subtotal: 1700.0,
      taxRate: 15,
      taxAmount: 255.0,
      total: 1955.0,
      status: PurchaseInvoiceStatus.PAID,
      dueDate: new Date("2024-02-14"),
      notes: "Weekly food supplies",
      includeQR: false,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
    },
    {
      id: "pi2",
      type: InvoiceType.PURCHASE,
      supplierId: "sup2",
      supplierName: "Beverage Distributors",
      supplierEmail: "sales@beverages.com",
      supplierAddress: "456 Drink Ave, City, Country",
      supplierVAT: "VAT789012",
      invoiceNumber: "BEV-2024-045",
      invoiceDate: new Date("2024-02-01"),
      items: [
        {
          id: "item3",
          itemType: ItemType.PRODUCT,
          itemId: "p5",
          name: "Coffee Beans",
          description: "Premium arabica coffee beans",
          quantity: 20,
          unitPrice: 45.0,
          total: 900.0,
        },
        {
          id: "item4",
          itemType: ItemType.PRODUCT,
          itemId: "p5",
          name: "Soft Drinks",
          description: "Assorted soft drinks and juices",
          quantity: 100,
          unitPrice: 2.5,
          total: 250.0,
        },
      ],
      subtotal: 1150.0,
      taxRate: 15,
      taxAmount: 172.5,
      total: 1322.5,
      status: PurchaseInvoiceStatus.PAID,
      dueDate: new Date("2024-03-01"),
      notes: "Monthly beverage supplies",
      includeQR: false,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-10"),
    },
  ];

// Sample sales invoices
export const sampleSalesInvoices: Omit<SalesInvoice, "organizationId">[] = [
  {
    id: "si1",
    type: InvoiceType.SALES,
    clientName: "John Smith",
    clientEmail: "john.smith@email.com",
    clientAddress: "123 Main St, City, Country",
    items: [
      {
        id: "item5",
        itemType: ItemType.PRODUCT,
        itemId: "p1",
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        quantity: 3,
        unitPrice: 15.99,
        total: 47.97,
      },
      {
        id: "item6",
        itemType: ItemType.PRODUCT,
        itemId: "p5",
        name: "Cappuccino",
        description: "Espresso with steamed milk and foam",
        quantity: 2,
        unitPrice: 4.5,
        total: 9.0,
      },
    ],
    subtotal: 56.97,
    taxRate: 15,
    taxAmount: 8.55,
    total: 65.52,
    status: InvoiceStatus.PAID,
    dueDate: new Date("2024-01-25"),
    notes: "Dinner order",
    payments: [],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "si2",
    type: InvoiceType.SALES,
    clientName: "Sarah Johnson",
    clientEmail: "sarah.j@email.com",
    clientAddress: "456 Oak Ave, City, Country",
    items: [
      {
        id: "item7",
        itemType: ItemType.PRODUCT,
itemId: "p7",
          name: "Chicken Burger",
          description: "Grilled chicken burger with lettuce and tomato",
          quantity: 2,
          unitPrice: 13.99,
          total: 27.98,
        },
        {
          id: "item8",
          itemType: ItemType.PRODUCT,
          itemId: "p6",
        name: "French Fries",
        description: "Crispy golden french fries",
        quantity: 2,
        unitPrice: 6.99,
        total: 13.98,
      },
{
          id: "item9",
          itemType: ItemType.PRODUCT,
          itemId: "p8",
          name: "Ice Cream Sundae",
          description: "Vanilla ice cream with chocolate sauce and nuts",
          quantity: 1,
          unitPrice: 7.5,
          total: 7.5,
        },
    ],
    subtotal: 49.46,
    taxRate: 15,
    taxAmount: 7.42,
    total: 56.88,
    status: InvoiceStatus.PAID,
    dueDate: new Date("2024-02-05"),
    notes: "Take away order",
    payments: [],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
];

// Combined sample products and services (for backward compatibility)
export const sampleProductsServices = [
  ...sampleProducts.map((p) => ({ ...p, type: ItemType.PRODUCT as const })),
  ...sampleServices.map((s) => ({ ...s, type: ItemType.SERVICE as const })),
];

// Combined sample invoices (both sales and purchase)
export const sampleInvoices: Omit<Invoice, "organizationId">[] = [
  ...samplePurchaseInvoices,
  ...sampleSalesInvoices,
];

export const getProductById = (products: Item[], id: string) => {
  return products.find((product) => product.id === id);
};

export const getServiceById = (services: Item[], id: string) => {
  return services.find((service) => service.id === id);
};

export const getProductServiceById = (
  items: (
    | (Omit<Item, "organizationId"> & { type: ItemType.PRODUCT })
    | (Omit<Item, "organizationId"> & { type: ItemType.SERVICE })
  )[],
  id: string,
) => {
  return items.find((item) => item.id === id);
};
