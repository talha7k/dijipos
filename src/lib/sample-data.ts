// Sample data for customers, products, and services
// This would typically come from a database

import { Invoice } from '@/types';

export interface Customer {
  id: string
  name: string
  email: string
  address?: string
  phone?: string
}

export interface ProductService {
  id: string
  name: string
  description?: string
  price: number
  type: 'product' | 'service'
  category?: string
}

// Sample customers
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'ABC Corporation',
    email: 'contact@abc.com',
    address: '123 Business St, City, Country',
    phone: '+1-234-567-8900'
  },
  {
    id: '2',
    name: 'XYZ Industries',
    email: 'info@xyz.com',
    address: '456 Industrial Ave, City, Country',
    phone: '+1-234-567-8901'
  },
  {
    id: '3',
    name: 'Tech Solutions Ltd',
    email: 'hello@techsolutions.com',
    address: '789 Tech Park, City, Country',
    phone: '+1-234-567-8902'
  },
  {
    id: '4',
    name: 'Global Services Inc',
    email: 'support@globalservices.com',
    address: '321 Service Rd, City, Country',
    phone: '+1-234-567-8903'
  },
  {
    id: '5',
    name: 'Local Business Co',
    email: 'admin@localbusiness.com',
    address: '654 Main St, City, Country',
    phone: '+1-234-567-8904'
  }
]

// Sample products and services
export const sampleProductsServices: ProductService[] = [
  // Products
  {
    id: 'p1',
    name: 'Laptop Computer',
    description: 'High-performance laptop for business use',
    price: 1200.00,
    type: 'product',
    category: 'Electronics'
  },
  {
    id: 'p2',
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 350.00,
    type: 'product',
    category: 'Furniture'
  },
  {
    id: 'p3',
    name: 'Wireless Mouse',
    description: 'Bluetooth wireless mouse with ergonomic design',
    price: 45.00,
    type: 'product',
    category: 'Electronics'
  },
  {
    id: 'p4',
    name: 'Printer Paper (500 sheets)',
    description: 'A4 size printer paper, 80gsm',
    price: 12.50,
    type: 'product',
    category: 'Office Supplies'
  },
  {
    id: 'p5',
    name: 'External Hard Drive',
    description: '2TB external hard drive for data backup',
    price: 89.99,
    type: 'product',
    category: 'Electronics'
  },

  // Services
  {
    id: 's1',
    name: 'Web Development',
    description: 'Custom website development service',
    price: 150.00,
    type: 'service',
    category: 'Development'
  },
  {
    id: 's2',
    name: 'Graphic Design',
    description: 'Logo and branding design service',
    price: 120.00,
    type: 'service',
    category: 'Design'
  },
  {
    id: 's3',
    name: 'IT Support',
    description: 'Technical support and maintenance',
    price: 85.00,
    type: 'service',
    category: 'IT Services'
  },
  {
    id: 's4',
    name: 'Consulting',
    description: 'Business consulting services',
    price: 200.00,
    type: 'service',
    category: 'Consulting'
  },
  {
    id: 's5',
    name: 'SEO Optimization',
    description: 'Search engine optimization service',
    price: 175.00,
    type: 'service',
    category: 'Marketing'
  }
]

// Helper functions to get combobox options
export const getCustomerOptions = (customers: Customer[]) => {
  return customers.map(customer => ({
    value: customer.id,
    label: customer.name,
    description: customer.email
  }))
}

export const getProductServiceOptions = (items: ProductService[]) => {
  return items.map(item => ({
    value: item.id,
    label: item.name,
    description: `${item.type === 'product' ? 'Product' : 'Service'} - $${item.price.toFixed(2)}`
  }))
}

export const getProductOptions = (items: ProductService[]) => {
  return items.filter(item => item.type === 'product').map(item => ({
    value: item.id,
    label: item.name,
    description: `$${item.price.toFixed(2)}`
  }))
}

export const getServiceOptions = (items: ProductService[]) => {
  return items.filter(item => item.type === 'service').map(item => ({
    value: item.id,
    label: item.name,
    description: `$${item.price.toFixed(2)}`
  }))
}

export const getCustomerById = (customers: Customer[], id: string) => {
  return customers.find(customer => customer.id === id)
}

// Sample suppliers
export const sampleSuppliers: Customer[] = [
  {
    id: 's1',
    name: 'Office Supplies Co',
    email: 'orders@officesupplies.com',
    address: '123 Supply St, City, Country',
    phone: '+1-234-567-8905'
  },
  {
    id: 's2',
    name: 'Tech Equipment Ltd',
    email: 'sales@techequipment.com',
    address: '456 Tech Ave, City, Country',
    phone: '+1-234-567-8906'
  },
  {
    id: 's3',
    name: 'Furniture Wholesale',
    email: 'info@furniturewholesale.com',
    address: '789 Furniture Blvd, City, Country',
    phone: '+1-234-567-8907'
  },
  {
    id: 's4',
    name: 'Print Services Inc',
    email: 'contact@printservices.com',
    address: '321 Print Ln, City, Country',
    phone: '+1-234-567-8908'
  },
  {
    id: 's5',
    name: 'IT Solutions Corp',
    email: 'support@itsolutions.com',
    address: '654 IT Drive, City, Country',
    phone: '+1-234-567-8909'
  }
]

export const getSupplierOptions = (suppliers: Customer[]) => {
  return suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
    description: supplier.email
  }))
}

export const getSupplierById = (suppliers: Customer[], id: string) => {
  return suppliers.find(supplier => supplier.id === id)
}

// Sample purchase invoices
export const samplePurchaseInvoices: Invoice[] = [
  {
    id: 'pi1',
    tenantId: 'tenant1',
    type: 'purchase',
    supplierId: 's1',
    supplierName: 'Office Supplies Co',
    supplierEmail: 'orders@officesupplies.com',
    supplierAddress: '123 Supply St, City, Country',
    supplierVAT: 'VAT123456',
    invoiceNumber: 'SUP-2024-001',
    invoiceDate: new Date('2024-01-15'),
    items: [
      {
        id: 'item1',
        type: 'product',
        productId: 'p4',
        name: 'Printer Paper (500 sheets)',
        description: 'A4 size printer paper, 80gsm',
        quantity: 10,
        unitPrice: 12.50,
        total: 125.00,
      },
      {
        id: 'item2',
        type: 'product',
        productId: 'p3',
        name: 'Wireless Mouse',
        description: 'Bluetooth wireless mouse with ergonomic design',
        quantity: 5,
        unitPrice: 45.00,
        total: 225.00,
      }
    ],
    subtotal: 350.00,
    taxRate: 15,
    taxAmount: 52.50,
    total: 402.50,
    status: 'paid',
    dueDate: new Date('2024-02-14'),
    notes: 'Bulk office supplies purchase',
    template: 'english',
    includeQR: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'pi2',
    tenantId: 'tenant1',
    type: 'purchase',
    supplierId: 's2',
    supplierName: 'Tech Equipment Ltd',
    supplierEmail: 'sales@techequipment.com',
    supplierAddress: '456 Tech Ave, City, Country',
    supplierVAT: 'VAT789012',
    invoiceNumber: 'TECH-2024-045',
    invoiceDate: new Date('2024-02-01'),
    items: [
      {
        id: 'item3',
        type: 'product',
        productId: 'p1',
        name: 'Laptop Computer',
        description: 'High-performance laptop for business use',
        quantity: 2,
        unitPrice: 1200.00,
        total: 2400.00,
      },
      {
        id: 'item4',
        type: 'product',
        productId: 'p5',
        name: 'External Hard Drive',
        description: '2TB external hard drive for data backup',
        quantity: 3,
        unitPrice: 89.99,
        total: 269.97,
      }
    ],
    subtotal: 2669.97,
    taxRate: 15,
    taxAmount: 400.50,
    total: 3070.47,
    status: 'paid',
    dueDate: new Date('2024-03-01'),
    notes: 'IT equipment for new hires',
    template: 'english',
    includeQR: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  }
]

// Combined sample invoices (both sales and purchase)
export const sampleInvoices: Invoice[] = [
  ...samplePurchaseInvoices,
  // Add sales invoices here when available
]

export const getProductServiceById = (items: ProductService[], id: string) => {
  return items.find(item => item.id === id)
}