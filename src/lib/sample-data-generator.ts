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

export async function generateSampleData(organizationId: string) {
  const batch = writeBatch(db);

  try {
    // Generate categories
    for (const category of sampleCategories) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'categories'));
      batch.set(docRef, { ...category, organizationId });
    }

    // Generate products
    for (const product of sampleProducts) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'products'));
      batch.set(docRef, { ...product, organizationId });
    }

    // Generate services
    for (const service of sampleServices) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'services'));
      batch.set(docRef, { ...service, organizationId });
    }

    // Generate customers
    for (const customer of sampleCustomers) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'customers'));
      batch.set(docRef, { ...customer, organizationId });
    }

    // Generate suppliers
    for (const supplier of sampleSuppliers) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'suppliers'));
      batch.set(docRef, { ...supplier, organizationId });
    }

    // Generate tables
    for (const table of sampleTables) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'tables'));
      batch.set(docRef, { ...table, organizationId });
    }

    // Generate order types
    for (const orderType of sampleOrderTypes) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'orderTypes'));
      batch.set(docRef, { ...orderType, organizationId });
    }

    // Generate payment types
    for (const paymentType of samplePaymentTypes) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'paymentTypes'));
      batch.set(docRef, { ...paymentType, organizationId });
    }

    // Generate orders
    for (const order of sampleOrders) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'orders'));
      batch.set(docRef, { ...order, organizationId });
    }

    // Generate purchase invoices
    for (const invoice of samplePurchaseInvoices) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'invoices'));
      batch.set(docRef, { ...invoice, organizationId });
    }

    // Generate sales invoices
    for (const invoice of sampleSalesInvoices) {
      const docRef = doc(collection(db, 'tenants', organizationId, 'invoices'));
      batch.set(docRef, { ...invoice, organizationId });
    }

    // Commit the batch
    await batch.commit();

    console.log('Sample data generated successfully');
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
}