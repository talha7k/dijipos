import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import {
  sampleCategories,
  sampleProducts,
  sampleServices,
  sampleCustomers,
  sampleSuppliers,
  sampleTables,
  sampleOrderTypes,
  samplePaymentTypes,
  sampleOrders,
  samplePurchaseInvoices,
  sampleSalesInvoices
} from './sample-data';

export async function generateSampleData(tenantId: string) {
  const batch = writeBatch(db);

  try {
    // Generate categories
    for (const category of sampleCategories) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'categories'));
      batch.set(docRef, { ...category, tenantId });
    }

    // Generate products
    for (const product of sampleProducts) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'products'));
      batch.set(docRef, { ...product, tenantId });
    }

    // Generate services
    for (const service of sampleServices) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'services'));
      batch.set(docRef, { ...service, tenantId });
    }

    // Generate customers
    for (const customer of sampleCustomers) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'customers'));
      batch.set(docRef, { ...customer, tenantId });
    }

    // Generate suppliers
    for (const supplier of sampleSuppliers) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'suppliers'));
      batch.set(docRef, { ...supplier, tenantId });
    }

    // Generate tables
    for (const table of sampleTables) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'tables'));
      batch.set(docRef, { ...table, tenantId });
    }

    // Generate order types
    for (const orderType of sampleOrderTypes) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'orderTypes'));
      batch.set(docRef, { ...orderType, tenantId });
    }

    // Generate payment types
    for (const paymentType of samplePaymentTypes) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'paymentTypes'));
      batch.set(docRef, { ...paymentType, tenantId });
    }

    // Generate orders
    for (const order of sampleOrders) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'orders'));
      batch.set(docRef, { ...order, tenantId });
    }

    // Generate purchase invoices
    for (const invoice of samplePurchaseInvoices) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'invoices'));
      batch.set(docRef, { ...invoice, tenantId });
    }

    // Generate sales invoices
    for (const invoice of sampleSalesInvoices) {
      const docRef = doc(collection(db, 'tenants', tenantId, 'invoices'));
      batch.set(docRef, { ...invoice, tenantId });
    }

    // Commit the batch
    await batch.commit();

    console.log('Sample data generated successfully');
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
}