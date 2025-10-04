import { db } from '@/lib/firebase/config';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Product, Service, Quote, Customer, Supplier, InvoiceItem as Item, Payment, Invoice, Category, Order, OrderPayment, CartItem, OrderType, PaymentType, Table, TableStatus, OrderStatus, PaymentStatus, CategoryType, ItemType, InvoiceType, QuoteStatus, InvoiceStatus, ProductTransactionType } from '@/types';
 
// --- HELPER FUNCTIONS ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number, decimals: number) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
let idCounter = 0;
const generateId = (prefix: string) => `${prefix}-${++idCounter}-${Date.now() % 10000}`;

// --- DATA FOR REALISTIC NAMING ---

const productAdjectives = ['Organic', 'Premium', 'Hand-Crafted', 'Ergonomic', 'Heavy-Duty', 'Artisanal', 'Imported'];
const productNouns = ['Coffee Beans', 'Olive Oil', 'Office Chair', 'Keyboard', 'Steel Pipes', 'Fabric', 'Software License'];
const serviceAdjectives = ['Strategic', 'Technical', 'Creative', 'Financial', 'Legal', 'Operational'];
const serviceNouns = ['Consulting', 'Support', 'Design', 'Auditing', 'Development', 'Analysis'];
const firstNames = ['Aisha', 'Fatima', 'Omar', 'Yusuf', 'Layla', 'Zayn', 'Noor', 'Amir'];
const lastNames = ['Al-Farsi', 'Khan', 'Al-Qahtani', 'Siddiqui', 'Hassan', 'Bakr', 'Hussein'];
const companyNames = ['Future', 'Desert', 'Oasis', 'Falcon', 'Arabian', 'Gulf', 'United'];
const companySuffixes = ['Trading', 'Solutions', 'Enterprises', 'Group', 'LLC', 'Corp'];

// --- PROCEDURAL DATA GENERATORS ---

const generateCategories = (): Omit<Category, 'organizationId'>[] => {
  const categories: Omit<Category, 'organizationId'>[] = [];
  const mainCategories = [
    { name: 'Food & Beverages', type: CategoryType.PRODUCT },
    { name: 'Electronics', type: CategoryType.PRODUCT },
    { name: 'Services', type: CategoryType.SERVICE }
  ];

  const subCategories: Record<string, string[]> = {
    'Food & Beverages': ['Hot Drinks', 'Cold Drinks', 'Snacks'],
    'Electronics': ['Computers', 'Accessories', 'Mobile Devices'],
    'Services': ['Consulting', 'Maintenance', 'Installation']
  };

  mainCategories.forEach((mainCat) => {
    // Create main category
    const mainCategoryId = generateId('cat');
    categories.push({
      id: mainCategoryId,
      name: mainCat.name,
      description: `${mainCat.name} category`,
      type: mainCat.type,
      transactionType: ProductTransactionType.SALES,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create subcategories
    subCategories[mainCat.name].forEach((subName: string) => {
      categories.push({
        id: generateId('cat'),
        name: subName,
        description: `${subName} subcategory under ${mainCat.name}`,
        type: mainCat.type,
        transactionType: ProductTransactionType.SALES,
        parentId: mainCategoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  return categories;
};

const generateProductsAndServices = (productCount: number, serviceCount: number, categories: Omit<Category, 'organizationId'>[]) => {
  const products: Omit<Product, 'organizationId'>[] = [];
  const services: Omit<Service, 'organizationId'>[] = [];

  // Get only subcategories (categories with parentId)
  const subCategories = categories.filter(cat => cat.parentId);

  // Select 4 random subcategories for products
  const selectedSubCategories = [];
  const shuffled = [...subCategories].sort(() => 0.5 - Math.random());
  for (let i = 0; i < Math.min(4, shuffled.length); i++) {
    selectedSubCategories.push(shuffled[i]);
  }

  for (let i = 0; i < productCount; i++) {
    const randomCategory = getRandomElement(selectedSubCategories);
    products.push({
      id: generateId('prod'),
      name: `${getRandomElement(productAdjectives)} ${getRandomElement(productNouns)}`,
      description: 'High-quality item.',
      price: getRandomFloat(10, 500, 2),
      categoryId: randomCategory.id,
      itemType: ItemType.PRODUCT,
      transactionType: getRandomElement([ProductTransactionType.SALES, ProductTransactionType.PURCHASE]),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  for (let i = 0; i < serviceCount; i++) {
    services.push({
      id: generateId('serv'),
      name: `${getRandomElement(serviceAdjectives)} ${getRandomElement(serviceNouns)}`,
      description: 'Professional service offering.',
      price: getRandomFloat(50, 400, 2), // Per hour
      itemType: ItemType.SERVICE,
      transactionType: getRandomElement([ProductTransactionType.SALES, ProductTransactionType.PURCHASE]),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { products, services };
};

const generateCustomers = (count: number): Omit<Customer, 'organizationId'>[] => {
    return Array.from({ length: count }, () => {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        return {
            id: generateId('cust'),
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1,99)}@example.com`,
            phone: `+966-5${getRandomInt(0,9)}${getRandomInt(100,999)}${getRandomInt(1000,9999)}`,
            address: `${getRandomInt(100, 9999)} King Fahd Rd, Riyadh, Saudi Arabia`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};

const generateSuppliers = (count: number): Omit<Supplier, 'organizationId'>[] => {
     return Array.from({ length: count }, () => {
        const name = `${getRandomElement(companyNames)} ${getRandomElement(companySuffixes)}`;
        return {
            id: generateId('sup'),
            name: name,
            email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: `+966-11-${getRandomInt(100,999)}-${getRandomInt(1000,9999)}`,
            address: `${getRandomInt(10, 800)} Industrial City, Riyadh, Saudi Arabia`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });
};

const generateOrderTypes = (): Omit<OrderType, 'organizationId'>[] => {
    const orderTypes = [
        { name: 'Dine-in', description: 'Customer eating at the restaurant' },
        { name: 'Take-away', description: 'Customer taking food to go' },
        { name: 'Delivery', description: 'Food delivered to customer location' },
        { name: 'Drive-thru', description: 'Quick service through drive-thru' },
        { name: 'Room Service', description: 'Service delivered to hotel room' },
        { name: 'Catering', description: 'Large order for events' }
    ];

    return orderTypes.map(type => ({
        id: generateId('ord-type'),
        name: type.name,
        description: type.description,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
};

const generatePaymentTypes = (): Omit<PaymentType, 'organizationId'>[] => {
    const paymentTypes = [
        { name: 'Cash', description: 'Cash payment' },
        { name: 'Credit Card', description: 'Credit card payment' },
        { name: 'Debit Card', description: 'Debit card payment' },
        { name: 'Digital Wallet', description: 'Mobile payment apps' },
        { name: 'Bank Transfer', description: 'Direct bank transfer' },
        { name: 'Gift Card', description: 'Gift card payment' },
        { name: 'Check', description: 'Check payment' },
        { name: 'Points', description: 'Loyalty points redemption' }
    ];

    return paymentTypes.map(type => ({
        id: generateId('pay-type'),
        name: type.name,
        description: type.description,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
};

const generateOrderItems = (products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[]): CartItem[] => {
    const items: CartItem[] = [];
    const itemCount = getRandomInt(1, 4);

    for (let i = 0; i < itemCount; i++) {
        const isProduct = Math.random() > 0.4; // 60% chance of being a product
        if (isProduct) {
            const product = getRandomElement(products);
            const quantity = getRandomInt(1, 5);
            items.push({
                id: generateId('ord-item'),
                type: ItemType.PRODUCT,
                itemId: product.id,
                name: product.name,
                description: product.description || '',
                quantity,
                unitPrice: product.price,
                total: quantity * product.price,
            });
        } else {
            const service = getRandomElement(services);
            const quantity = getRandomInt(1, 3); // Hours
            items.push({
                id: generateId('ord-item'),
                type: ItemType.SERVICE,
                itemId: service.id,
                name: service.name,
                description: service.description || '',
                quantity,
                unitPrice: service.price,
                total: quantity * service.price,
            });
        }
    }
    return items;
};

const generateOrders = (count: number, customers: Omit<Customer, 'organizationId'>[], products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[], orderTypes: Omit<OrderType, 'organizationId'>[], paymentTypes: Omit<PaymentType, 'organizationId'>[], organizationId: string): { orders: Omit<Order, 'organizationId'>[], orderPayments: OrderPayment[] } => {
    const orders: Omit<Order, 'organizationId'>[] = [];
    const orderPayments: OrderPayment[] = [];

    Array.from({ length: count }, () => {
        const customer = Math.random() > 0.3 ? getRandomElement(customers) : undefined; // 70% have customers
        const orderItems = generateOrderItems(products, services);
        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        const taxRate = 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        const orderId = generateId('ord');
        const status = getRandomElement([OrderStatus.OPEN, OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.ON_HOLD]);

        const orderData: Omit<Order, 'organizationId'> = {
            id: orderId,
            orderNumber: `ORD-${Date.now()}-${getRandomInt(100, 999)}`,
            items: orderItems,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status,
            paymentStatus: status === OrderStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.UNPAID,
             orderType: getRandomElement(orderTypes).name,
            createdById: 'temp-user-id', // Will be replaced with actual userId
            createdByName: 'System Generated',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Omit<Order, 'organizationId'>;

        // Only add customer fields if customer exists
        if (customer) {
            orderData.customerName = customer.name;
            orderData.customerPhone = customer.phone;
            orderData.customerEmail = customer.email;
        }

        // Only add notes if randomly selected
        if (Math.random() > 0.7) {
            orderData.notes = 'Special instructions for order';
        }

        orders.push(orderData as Omit<Order, 'organizationId'>);

        // Generate payments for completed orders
        console.log(`Order ${orderId} has status: ${status}`);
        if (status === OrderStatus.COMPLETED) {
            const paymentCount = getRandomInt(1, 2);
            let remainingTotal = total;
            for (let p = 0; p < paymentCount; p++) {
                const isLastPayment = p === paymentCount - 1;
                const paymentAmount = isLastPayment ? remainingTotal : getRandomFloat(0.3, 0.7, 2) * remainingTotal;
                remainingTotal -= paymentAmount;
                orderPayments.push({
                    id: generateId('ord-pay'),
                    orderId: orderId,
                    organizationId: organizationId,
                    amount: paymentAmount,
                     paymentMethod: getRandomElement(paymentTypes).name,
                    paymentDate: new Date(),
                    reference: `REF-${getRandomInt(100000, 999999)}`,
                    notes: p === 0 ? 'Payment for order' : 'Additional payment',
                    createdAt: new Date(),
                });
            }
        }
    });

    return { orders, orderPayments };
};

const generateItems = (products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[]): Item[] => {
    const items: Item[] = [];
    const itemCount = getRandomInt(2, 5);

    for (let i = 0; i < itemCount; i++) {
        const isProduct = Math.random() > 0.3; // 70% chance of being a product
        if (isProduct) {
            const product = getRandomElement(products);
            const quantity = getRandomInt(1, 10);
            items.push({
                id: generateId('item'),
                itemType: ItemType.PRODUCT,
                itemId: product.id,
                name: product.name,
                description: 'Product item',
                quantity,
                unitPrice: product.price,
                total: quantity * product.price,
            });
        } else {
            const service = getRandomElement(services);
            const quantity = getRandomInt(2, 20); // Hours
            items.push({
                id: generateId('item'),
                itemType: ItemType.SERVICE,
                itemId: service.id,
                name: service.name,
                description: 'Professional services rendered.',
                quantity,
                unitPrice: service.price,
                total: quantity * service.price,
            });
        }
    }
    return items;
};

const generateQuotes = (count: number, customers: Omit<Customer, 'organizationId'>[], products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[]): Omit<Quote, 'organizationId'>[] => {
    return Array.from({ length: count }, () => {
        const customer = getRandomElement(customers);
        const items = generateItems(products, services);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        
        return {
            id: generateId('quote'),
            clientName: customer.name,
            clientEmail: customer.email,
            clientAddress: customer.address,
            items,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status: getRandomElement([QuoteStatus.DRAFT, QuoteStatus.SENT, QuoteStatus.ACCEPTED, QuoteStatus.REJECTED]),
            createdAt: new Date(),
            updatedAt: new Date(),
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        };
    });
};

const generateInvoices = (count: number, customers: Omit<Customer, 'organizationId'>[], suppliers: Omit<Supplier, 'organizationId'>[], products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[], paymentTypes: Omit<PaymentType, 'organizationId'>[], organizationId: string): { invoices: Omit<Invoice, 'organizationId'>[], payments: Payment[] } => {
    const allInvoices: Omit<Invoice, 'organizationId'>[] = [];
    const allPayments: Payment[] = [];

    Array.from({ length: count }, () => {
        const items = generateItems(products, services);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        const status = getRandomElement([InvoiceStatus.SENT, InvoiceStatus.PAID, InvoiceStatus.OVERDUE]);

        const invoiceId = generateId('inv');

        // Generate payments based on invoice status
        const payments: Payment[] = [];
        console.log(`Invoice ${invoiceId} has status: ${status}`);
        if (status === InvoiceStatus.PAID) {
            const paymentCount = getRandomInt(1, 2);
            let remainingTotal = total;
            for (let p = 0; p < paymentCount; p++) {
                const isLastPayment = p === paymentCount - 1;
                const paymentAmount = isLastPayment ? remainingTotal : getRandomFloat(0.3, 0.7, 2) * remainingTotal;
                remainingTotal -= paymentAmount;
                const payment = {
                    id: generateId('pay'),
                    invoiceId: invoiceId,
                    organizationId: organizationId,
                    amount: paymentAmount,
                    paymentDate: new Date(),
                     paymentMethod: getRandomElement(paymentTypes).name,
                    notes: '',
                    createdAt: new Date(),
                };
                payments.push(payment);
                allPayments.push(payment);
            }
        } else if (status === InvoiceStatus.SENT && Math.random() > 0.6) { // 40% chance of a partial payment on a sent invoice
            const payment = {
                id: generateId('pay'),
                invoiceId: invoiceId,
                organizationId: organizationId,
                amount: getRandomFloat(0.1, 0.5, 2) * total,
                paymentDate: new Date(),
                paymentMethod: 'Bank Transfer',
                notes: 'Initial deposit.',
                createdAt: new Date(),
            };
            payments.push(payment);
            allPayments.push(payment);
        }

        const baseInvoice = {
            id: invoiceId,
            items,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        const isSales = Math.random() > 0.5; // 50% of invoices are sales
        if (isSales) {
            const invoice: Omit<Invoice, 'organizationId'> = {
                ...baseInvoice,
                type: InvoiceType.SALES,
            };
            allInvoices.push(invoice);
        } else {
            const invoice: Omit<Invoice, 'organizationId'> = {
                ...baseInvoice,
                type: InvoiceType.PURCHASE,
            };
            allInvoices.push(invoice);
        }
    });

    return { invoices: allInvoices, payments: allPayments };
};


// --- MAIN GENERATOR FUNCTION ---

export async function generateSampleData(organizationId: string) {
  console.log(`Starting sample data generation for organization: ${organizationId}`);
  const batch = writeBatch(db);

  // Debug counters
  let totalPayments = 0;
  let totalOrderPayments = 0;

  // Define how much data to generate
  const COUNTS = {
    PRODUCTS: 60,
    SERVICES: 40,
    CUSTOMERS: 10,
    SUPPLIERS: 10,
    QUOTES: 20,
    INVOICES: 40,
    ORDERS: 25,
  };

  try {
    // 1. Generate independent data
    const categories = generateCategories();
    const { products, services } = generateProductsAndServices(COUNTS.PRODUCTS, COUNTS.SERVICES, categories);
    const customers = generateCustomers(COUNTS.CUSTOMERS);
    const suppliers = generateSuppliers(COUNTS.SUPPLIERS);
    const orderTypes = generateOrderTypes();
    const paymentTypes = generatePaymentTypes();

    // Generate tables
    const tables: Table[] = [];
    const tableStatuses = [TableStatus.AVAILABLE, TableStatus.OCCUPIED, TableStatus.RESERVED];
    
    for (let i = 1; i <= 10; i++) {
      const table: Table = {
        id: `table_${i}`,
        name: `Table ${i}`,
        capacity: Math.floor(Math.random() * 4) + 2,
        status: tableStatuses[Math.floor(Math.random() * tableStatuses.length)],
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      tables.push(table);
    }

    // 2. Generate dependent data
    const quotes = generateQuotes(COUNTS.QUOTES, customers, products, services);
    const { invoices, payments } = generateInvoices(COUNTS.INVOICES, customers, suppliers, products, services, paymentTypes, organizationId);
    const { orders, orderPayments } = generateOrders(COUNTS.ORDERS, customers, products, services, orderTypes, paymentTypes, organizationId);

    totalPayments = payments.length;
    totalOrderPayments = orderPayments.length;
    console.log(`Generated ${totalPayments} invoice payments and ${totalOrderPayments} order payments`);
    
    // 3. Prepare data for batch write
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collections: { [key: string]: any[] } = {
        categories,
        products,
        services,
        customers,
        suppliers,
        orderTypes,
        paymentTypes,
        quotes,
        invoices,
        payments,
        orders,
        orderPayments,
        tables
    };

    for (const [name, data] of Object.entries(collections)) {
        console.log(`-> Preparing ${data.length} documents for '${name}' collection...`);
        if (name === 'payments' || name === 'orderPayments') {
            console.log(`   Payments data:`, data.slice(0, 3)); // Show first 3 payments for debugging
        }
        for (const item of data) {
            const docRef = doc(collection(db, 'organizations', organizationId, name), item.id);
            // Handle different collection types
            if (['customers', 'suppliers'].includes(name)) {
                // Add timestamps and orgId for customers/suppliers
                batch.set(docRef, { ...item, organizationId, createdAt: new Date(), updatedAt: new Date() });
            } else if (name === 'categories') {
                // Categories already have timestamps, just add orgId
                batch.set(docRef, { ...item, organizationId });
            } else if (name === 'payments' || name === 'orderPayments') {
                // Payments have organizationId set correctly
                batch.set(docRef, item);
            } else if (name === 'orderTypes' || name === 'paymentTypes') {
                // Order types and payment types already have timestamps, just add orgId
                batch.set(docRef, { ...item, organizationId });
            } else if (name === 'tables') {
                // Tables already have organizationId and timestamps
                batch.set(docRef, item);
            } else {
                // Other collections just need organizationId
                batch.set(docRef, { ...item, organizationId });
            }
        }
    }

    // 4. Commit the batch
    await batch.commit();
    console.log(`✅ Sample data generated successfully! Wrote documents to ${Object.keys(collections).length} collections.`);
    console.log(`📊 Summary: ${totalPayments} payments, ${totalOrderPayments} order payments generated.`);

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
}