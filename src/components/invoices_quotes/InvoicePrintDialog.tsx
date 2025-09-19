import React, { useState, useEffect, ReactNode } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { renderTemplate } from "@/lib/template-renderer"; // Assuming local file

// --- START: Self-Contained Dependencies ---

const DialogWithActions = ({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  maxWidth,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}) => {
  if (!open) return <div onClick={() => onOpenChange(true)}>{trigger}</div>;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "800px",
          color: "black",
        }}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);

type Invoice = {
  id: string;
  createdAt: Date;
  dueDate: Date;
  status: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  items: any[];
};
type Organization = {
  name: string;
  nameAr?: string;
  address: string;
  phone: string;
  vatNumber: string;
  logoUrl?: string;
};
type InvoiceTemplate = {
  id: string;
  name: string;
  type?: string;
  content?: string;
};
type Customer = { name: string; address: string; vatNumber: string };
type Supplier = { name: string; address: string; vatNumber: string };
type InvoiceTemplateData = { [key: string]: any };

const defaultInvoiceEnglish = `<!DOCTYPE html><html><body><h1>Invoice {{invoiceId}}</h1></body></html>`;
const defaultInvoiceArabic = `<!DOCTYPE html><html dir="rtl"><body><h1>فاتورة {{invoiceId}}</h1></body></html>`;
const createReceiptQRData = (data: any, org: any) => ({});
const generateZatcaQRCode = async (data: any) =>
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// --- END: Self-Contained Dependencies ---

async function renderInvoice(
  templateObj: InvoiceTemplate,
  invoice: Invoice,
  organization: Organization | null,
  customer?: Customer,
  supplier?: Supplier,
): Promise<string> {
  const qrCodeBase64 = await generateZatcaQRCode(
    createReceiptQRData({ ...invoice, orderType: "invoice" }, organization),
  );
  const data: InvoiceTemplateData = {
    invoiceId: invoice.id,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
    dueDate: new Date(invoice.dueDate).toLocaleDateString(),
    status: invoice.status,
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    clientName: customer?.name || supplier?.name || "",
    subtotal: (invoice.subtotal || 0).toFixed(2),
    taxAmount: (invoice.taxAmount || 0).toFixed(2),
    total: (invoice.total || 0).toFixed(2),
    notes: invoice.notes || "",
    items: invoice.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2),
    })),
    includeQR: true,
    qrCodeUrl: qrCodeBase64,
  };
  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultInvoiceArabic
      : defaultInvoiceEnglish);
  return renderTemplate(templateContent, data);
}

interface InvoicePrintDialogProps {
  invoice: Invoice;
  organization: Organization | null;
  invoiceTemplates: InvoiceTemplate[];
  customer?: Customer;
  supplier?: Supplier;
  children: React.ReactNode;
}

export function InvoicePrintDialog({
  invoice,
  organization,
  invoiceTemplates,
  customer,
  supplier,
  children,
}: InvoicePrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    if (open && invoiceTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(invoiceTemplates[0].id);
    }
  }, [open, invoiceTemplates, selectedTemplate]);

  useEffect(() => {
    if (open && selectedTemplate) {
      const template = invoiceTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [open, selectedTemplate, invoice, organization, customer, supplier]);

  const renderPreview = async (template: InvoiceTemplate) => {
    const content = await renderInvoice(
      template,
      invoice,
      organization,
      customer,
      supplier,
    );
    setRenderedHtml(content);
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={setOpen}
      title="Print Invoice"
      trigger={children}
      maxWidth="max-w-4xl"
    >
      <div className="flex h-[80vh] font-sans">
        <div className="w-1/4 p-4 border-r bg-gray-100 overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <div>
            <label className="block text-sm font-medium">
              Invoice Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {invoiceTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "ltr" | "rtl")}
              className="w-full p-2 border rounded"
            >
              <option value="ltr">Left-to-Right (LTR)</option>
              <option value="rtl">Right-to-Left (RTL)</option>
            </select>
          </div>
        </div>
        <div className="w-3/4 p-6 bg-gray-200 overflow-y-auto flex justify-center items-start">
          <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-8">
            <div
              dir={direction}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>
      </div>
    </DialogWithActions>
  );
}
