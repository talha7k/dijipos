import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config";
import { ReceiptTemplate, InvoiceTemplate } from "@/types";
import { STATIC_INVOICE_TEMPLATE_IDS } from "@/types";
import { STATIC_RECEIPT_TEMPLATE_IDS } from "@/types";

// Collection references
const receiptTemplatesRef = collection(db, "receiptTemplates");
const invoiceTemplatesRef = collection(db, "invoiceTemplates");


// Receipt Templates

/**
 * Fetch all receipt templates for an organization
 */
export async function getReceiptTemplates(
  organizationId: string,
): Promise<ReceiptTemplate[]> {
  try {
    const templatesQuery = query(
      receiptTemplatesRef,
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(templatesQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ReceiptTemplate[];
  } catch (error) {
    console.error("Error fetching receipt templates:", error);
    throw error;
  }
}

/**
 * Create a new receipt template
 */
export async function createReceiptTemplate(
  data: Omit<ReceiptTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(receiptTemplatesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating receipt template:", error);
    throw error;
  }
}

/**
 * Update a receipt template
 */
export async function updateReceiptTemplate(
  templateId: string, // This can be any templateId, including static ones
  updates: Partial<Omit<ReceiptTemplate, "id" | "createdAt">>,
): Promise<void> {
  try {
    // Static templates don't exist in Firestore, so we don't need to update anything
    // Template defaults are now managed through printer settings, not template.isDefault flags
    if ((STATIC_RECEIPT_TEMPLATE_IDS as readonly string[]).includes(templateId)) {
      console.log(`Skipping update for static template: ${templateId}`);
      return;
    }

    const docRef = doc(receiptTemplatesRef, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating receipt template:", error);
    throw error;
  }
}

/**
 * Delete a receipt template
 */
export async function deleteReceiptTemplate(templateId: string): Promise<void> {
  try {
    // Skip delete for static templates
    if ((STATIC_RECEIPT_TEMPLATE_IDS as readonly string[]).includes(templateId)) {
      console.log(`Skipping delete for static template: ${templateId}`);
      return;
    }

    await deleteDoc(doc(receiptTemplatesRef, templateId));
  } catch (error) {
    console.error("Error deleting receipt template:", error);
    throw error;
  }
}

// Invoice Templates

/**
 * Fetch all invoice templates for an organization
 */
export async function getInvoiceTemplates(
  organizationId: string,
): Promise<InvoiceTemplate[]> {
  try {
    const templatesQuery = query(
      invoiceTemplatesRef,
      where("organizationId", "==", organizationId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(templatesQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as InvoiceTemplate[];
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    throw error;
  }
}

/**
 * Create a new invoice template
 */
export async function createInvoiceTemplate(
  data: Omit<InvoiceTemplate, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(invoiceTemplatesRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating invoice template:", error);
    throw error;
  }
}

/**
 * Update an invoice template
 */
export async function updateInvoiceTemplate(
  templateId: string,
  updates: Partial<Omit<InvoiceTemplate, "id" | "createdAt">>,
): Promise<void> {
  try {
    // For static templates, only allow setting as default
    if ((STATIC_INVOICE_TEMPLATE_IDS as readonly string[]).includes(templateId)) {
      // Only allow isDefault updates for static templates
      if (
        Object.keys(updates).length === 1 &&
        updates.isDefault !== undefined
      ) {
        console.log(
          `Allowing isDefault update for static template: ${templateId}`,
        );
        // Static templates don't exist in Firestore, so we don't need to update anything
        // The frontend state will be updated by the useTemplates hook
        return;
      } else {
        console.log(
          `Skipping non-isDefault update for static template: ${templateId}`,
        );
        return;
      }
    }

    const docRef = doc(invoiceTemplatesRef, templateId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating invoice template:", error);
    throw error;
  }
}

/**
 * Delete an invoice template
 */
export async function deleteInvoiceTemplate(templateId: string): Promise<void> {
  try {
    // Skip delete for static templates
    if ((STATIC_INVOICE_TEMPLATE_IDS as readonly string[]).includes(templateId)) {
      console.log(`Skipping delete for static template: ${templateId}`);
      return;
    }

    await deleteDoc(doc(invoiceTemplatesRef, templateId));
  } catch (error) {
    console.error("Error deleting invoice template:", error);
    throw error;
  }
}


