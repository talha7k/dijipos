import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { Product, Service,Quote, Customer, Supplier, Item, Payment, PurchaseInvoice, SalesInvoice } from '@/lib/types';
 
// --- HELPER FUNCTIONS ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number, decimals: number) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
let idCounter = 0;
const generateId = (prefix: string) => `${prefix}-${++idCounter}-${Date.now() % 10000}`;

// --- DATA FOR REALISTIC NAMING ---

const productAdjectives = ['Organic', 'Premium', 'Hand-Crafted', 'Ergonomic', 'Heavy-Duty', 'Artisanal', 'Imported'];
const productNouns = ['Coffee Beans', 'Olive Oil', 'Office Chair', 'Keyboard', 'Steel Pipes', 'Fabric', 'Software License'];
const productUnits = ['kg', 'liter', 'piece', 'box', 'meter', 'license', 'pallet'];
const serviceAdjectives = ['Strategic', 'Technical', 'Creative', 'Financial', 'Legal', 'Operational'];
const serviceNouns = ['Consulting', 'Support', 'Design', 'Auditing', 'Development', 'Analysis'];
const firstNames = ['Aisha', 'Fatima', 'Omar', 'Yusuf', 'Layla', 'Zayn', 'Noor', 'Amir'];
const lastNames = ['Al-Farsi', 'Khan', 'Al-Qahtani', 'Siddiqui', 'Hassan', 'Bakr', 'Hussein'];
const companyNames = ['Future', 'Desert', 'Oasis', 'Falcon', 'Arabian', 'Gulf', 'United'];
const companySuffixes = ['Trading', 'Solutions', 'Enterprises', 'Group', 'LLC', 'Corp'];

// --- PROCEDURAL DATA GENERATORS ---

const generateProductsAndServices = (productCount: number, serviceCount: number) => {
  const products: Omit<Product, 'organizationId'>[] = [];
  const services: Omit<Service, 'organizationId'>[] = [];

  for (let i = 0; i < productCount; i++) {
    products.push({
      id: generateId('prod'),
      name: `${getRandomElement(productAdjectives)} ${getRandomElement(productNouns)}`,
      description: 'High-quality item.',
      price: getRandomFloat(10, 500, 2),
      unit: getRandomElement(productUnits),
    });
  }

  for (let i = 0; i < serviceCount; i++) {
    services.push({
      id: generateId('serv'),
      name: `${getRandomElement(serviceAdjectives)} ${getRandomElement(serviceNouns)}`,
      description: 'Professional service offering.',
      rate: getRandomFloat(50, 400, 2), // Per hour
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
                type: 'product',
                productId: product.id,
                name: product.name,
                description: `Unit: ${product.unit}`,
                quantity,
                unitPrice: product.price,
                total: quantity * product.price,
            });
        } else {
            const service = getRandomElement(services);
            const quantity = getRandomInt(2, 20); // Hours
            items.push({
                id: generateId('item'),
                type: 'service',
                serviceId: service.id,
                name: service.name,
                description: 'Professional services rendered.',
                quantity,
                unitPrice: service.rate,
                total: quantity * service.rate,
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
            status: getRandomElement(['draft', 'sent', 'accepted', 'rejected']),
            createdAt: new Date(),
            updatedAt: new Date(),
            validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        };
    });
};

const generateInvoices = (count: number, customers: Omit<Customer, 'organizationId'>[], suppliers: Omit<Supplier, 'organizationId'>[], products: Omit<Product, 'organizationId'>[], services: Omit<Service, 'organizationId'>[]): Omit<SalesInvoice | PurchaseInvoice, 'organizationId'>[] => {
    return Array.from({ length: count }, () => {
        const items = generateItems(products, services);
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const taxRate = 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        const status = getRandomElement<'sent' | 'paid' | 'overdue'>(['sent', 'paid', 'overdue']);

        const invoiceId = generateId('inv');
        
        // Generate payments based on invoice status
        const payments: Payment[] = [];
        if (status === 'paid') {
            const paymentCount = getRandomInt(1, 2);
            let remainingTotal = total;
            for (let p = 0; p < paymentCount; p++) {
                const isLastPayment = p === paymentCount - 1;
                const paymentAmount = isLastPayment ? remainingTotal : getRandomFloat(0.3, 0.7, 2) * remainingTotal;
                remainingTotal -= paymentAmount;
                payments.push({
                    id: generateId('pay'),
                    invoiceId: invoiceId,
                    organizationId: 'temp-org-id', // Will be replaced with actual orgId
                    amount: paymentAmount,
                    paymentDate: new Date(),
                    paymentMethod: getRandomElement(['Bank Transfer', 'Credit Card', 'Cash']),
                    notes: '',
                });
            }
        } else if (status === 'sent' && Math.random() > 0.6) { // 40% chance of a partial payment on a sent invoice
            payments.push({
                id: generateId('pay'),
                invoiceId: invoiceId,
                organizationId: 'temp-org-id', // Will be replaced with actual orgId
                amount: getRandomFloat(0.1, 0.5, 2) * total,
                paymentDate: new Date(),
                paymentMethod: 'Bank Transfer',
                notes: 'Initial deposit.'
            });
        }
        
        const baseInvoice = {
            id: invoiceId,
            items,
            subtotal,
            taxRate,
            taxAmount,
            total,
            status,
            payments,
            createdAt: new Date(),
            updatedAt: new Date(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        const isSales = Math.random() > 0.2; // 80% of invoices are sales
        if (isSales) {
            const customer = getRandomElement(customers);
            const salesInvoice: Omit<SalesInvoice, 'organizationId'> = {
                ...baseInvoice,
                type: 'sales',
                clientName: customer.name,
                clientEmail: customer.email,
                clientAddress: customer.address,
            };
            return salesInvoice;
        } else {
            const supplier = getRandomElement(suppliers);
            const purchaseInvoice: Omit<PurchaseInvoice, 'organizationId'> = {
                ...baseInvoice,
                type: 'purchase',
                supplierName: supplier.name,
                supplierEmail: supplier.email,
                supplierAddress: supplier.address,
            };
            return purchaseInvoice;
        }
    });
};


// --- MAIN GENERATOR FUNCTION ---

export async function generateSampleData(organizationId: string) {
  console.log(`Starting sample data generation for organization: ${organizationId}`);
  const batch = writeBatch(db);

  // Define how much data to generate
  const COUNTS = {
    PRODUCTS: 150,
    SERVICES: 40,
    CUSTOMERS: 50,
    SUPPLIERS: 25,
    QUOTES: 80,
    INVOICES: 200,
  };

  try {
    // 1. Generate independent data
    const { products, services } = generateProductsAndServices(COUNTS.PRODUCTS, COUNTS.SERVICES);
    const customers = generateCustomers(COUNTS.CUSTOMERS);
    const suppliers = generateSuppliers(COUNTS.SUPPLIERS);

    // 2. Generate dependent data
    const quotes = generateQuotes(COUNTS.QUOTES, customers, products, services);
    const invoices = generateInvoices(COUNTS.INVOICES, customers, suppliers, products, services);
    
    // 3. Prepare data for batch write
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collections: { [key: string]: any[] } = {
        products,
        services,
        customers,
        suppliers,
        quotes,
        invoices
    };

    for (const [name, data] of Object.entries(collections)) {
        console.log(`-> Preparing ${data.length} documents for '${name}' collection...`);
        for (const item of data) {
            const docRef = doc(collection(db, 'organizations', organizationId, name), item.id);
            // Add timestamps and orgId for customers/suppliers
            if (['customers', 'suppliers'].includes(name)) {
                batch.set(docRef, { ...item, organizationId, createdAt: new Date(), updatedAt: new Date() });
            } else {
                batch.set(docRef, { ...item, organizationId });
            }
        }
    }

    // 4. Commit the batch
    await batch.commit();
    console.log(`✅ Sample data generated successfully! Wrote documents to ${Object.keys(collections).length} collections.`);

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    throw error;
  }
}