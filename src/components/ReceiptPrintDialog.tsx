import React, { useState, useEffect, ReactNode } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Order,
  Organization,
  ReceiptTemplate,
  OrderPayment,
  PrinterSettings,
} from "@/types";
import { ReceiptTemplateData } from "@/types/template";
import { defaultEnglishReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-english";
import { defaultArabicReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-arabic";
import { createReceiptQRData, generateZatcaQRCode } from "@/lib/zatca-qr";
import { formatDateTime } from "@/lib/utils";
import { renderTemplate } from "@/lib/template-renderer";
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { useOrders } from "@/lib/hooks/useOrders";

async function renderReceipt(
  templateObj: ReceiptTemplate,
  order: Order,
  organization: Organization | null,
  payments: OrderPayment[] = [],
  printerSettings?: PrinterSettings,
): Promise<string> {
  const qrCodeBase64 = await generateZatcaQRCode(
    createReceiptQRData(order, organization),
  );
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const data: ReceiptTemplateData = {
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: organization?.logoUrl || "",
    orderNumber: order.orderNumber,
    queueNumber: order.queueNumber || "",
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    formattedDate: formatDateTime(order.createdAt),
    tableName: order.tableName || "",
    customerName: order.customerName || "",
    createdByName: order.createdByName || "",
    orderType: order.orderType || "dine-in",
    paymentMethod: payments.length > 0 ? payments[0].paymentMethod : "cash",
    subtotal: (order.subtotal || 0).toFixed(2),
    vatRate: (order.taxRate || 0).toString(),
    vatAmount: (order.taxAmount || 0).toFixed(2),
    total: (order.total || 0).toFixed(2),
    totalQty: totalQty,
    customHeader: printerSettings?.receipts?.customHeader || "",
    customFooter: printerSettings?.receipts?.customFooter || "",
    items: order.items.map((item) => ({
      ...item,
      unitPrice: (item.unitPrice || 0).toFixed(2),
      // --- THIS IS THE FIX ---
      // Renamed 'total' to 'lineTotal' to avoid conflict with the order's grand total.
      lineTotal: (item.quantity * item.unitPrice).toFixed(2),
    })),
    payments: payments.map((p) => ({
      paymentType: p.paymentMethod,
      amount: p.amount.toFixed(2),
    })),
    includeQR: true,
    qrCodeUrl: qrCodeBase64,
  };
  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultArabicReceiptTemplate
      : defaultEnglishReceiptTemplate);
  return renderTemplate(templateContent, data);
}

// Helper component for settings inputs
const SettingsInputGroup = ({
  label,
  values,
  onChange,
}: {
  label: string;
  values: Record<string, number>;
  onChange: (key: string, value: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
    >
      {Object.keys(values).map((key) => (
        <div key={key}>
          <label className="block text-xs capitalize text-gray-600">
            {key}
          </label>
          <input
            type="number"
            value={values[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full p-1 border rounded text-sm"
          />
        </div>
      ))}
    </div>
  </div>
);

interface ReceiptPrintDialogProps {
  order: Order;
  organization: Organization | null;
  receiptTemplates: ReceiptTemplate[];
  payments?: OrderPayment[];
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
}

export function ReceiptPrintDialog({
  order,
  organization,
  receiptTemplates,
  payments: initialPayments = [],
  printerSettings,
  children,
}: ReceiptPrintDialogProps) {
  const { getPaymentsForOrder } = useOrders();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [pageSize, setPageSize] = useState("80mm");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [payments, setPayments] = useState<OrderPayment[]>(initialPayments);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [margins, setMargins] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [paddings, setPaddings] = useState({
    top: 3,
    right: 3,
    bottom: 3,
    left: 3,
  });

  // Effect to initialize all settings when the dialog opens
  useEffect(() => {
    if (open) {
      const settings = printerSettings?.receipts;
      // 1. Set default template
      const defaultTemplateId = settings?.defaultTemplateId;
      const isValidDefault =
        defaultTemplateId &&
        receiptTemplates.some((t) => t.id === defaultTemplateId);
      setSelectedTemplate(
        isValidDefault ? defaultTemplateId : receiptTemplates[0]?.id || "",
      );

      // 2. Set paper size
      setPageSize(settings?.paperWidth ? `${settings.paperWidth}mm` : "80mm");

      // 3. Set margins and paddings
      setMargins({
        top: settings?.marginTop ?? 0,
        right: settings?.marginRight ?? 0,
        bottom: settings?.marginBottom ?? 0,
        left: settings?.marginLeft ?? 0,
      });
      setPaddings({
        top: settings?.paddingTop ?? 3,
        right: settings?.paddingRight ?? 3,
        bottom: settings?.paddingBottom ?? 3,
        left: settings?.paddingLeft ?? 3,
      });
    } else {
      setRenderedHtml(""); // Clear preview on close
    }
  }, [open, printerSettings, receiptTemplates]);

  // Effect to fetch payments when dialog opens
  useEffect(() => {
    if (open && initialPayments.length === 0) {
      const fetchPayments = async () => {
        try {
          setPaymentsLoading(true);
          const orderPayments = await getPaymentsForOrder(order.id);
          setPayments(orderPayments);
        } catch (error) {
          console.error('Error fetching payments for receipt:', error);
          setPayments([]);
        } finally {
          setPaymentsLoading(false);
        }
      };

      fetchPayments();
    } else if (open && initialPayments.length > 0) {
      setPayments(initialPayments);
    }
  }, [open, order.id, initialPayments, getPaymentsForOrder]);

  // Effect to render the preview when settings change
  useEffect(() => {
    if (open && selectedTemplate && !paymentsLoading) {
      const template = receiptTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [
    open,
    selectedTemplate,
    pageSize,
    order,
    organization,
    payments,
    printerSettings,
    paymentsLoading,
  ]);

  const renderPreview = async (template: ReceiptTemplate) => {
    if (paymentsLoading) {
      setRenderedHtml("<p style='color: gray;'>Loading payment information...</p>");
      return;
    }

    try {
      const content = await renderReceipt(
        template,
        order,
        organization,
        payments,
        printerSettings ?? undefined,
      );
      setRenderedHtml(content);
    } catch (error) {
      console.error("Failed to render receipt preview:", error);
      setRenderedHtml("<p style='color: red;'>Error rendering preview.</p>");
    }
  };

  const handlePrint = async () => {
    toast.info("Printing logic not implemented in this example.");
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      title="Print Receipt"
      actions={
        <>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedTemplate || isGenerating || paymentsLoading}
          >
            <Printer className="h-4 w-4 mr-2" />
            {paymentsLoading ? "Loading payments..." : isGenerating ? "Processing..." : "Print Receipt"}
          </Button>
        </>
      }
      trigger={children}
    >
      <div
        className="flex h-[70vh] font-sans"
        style={{ maxHeight: "calc(100vh - 180px)" }}
      >
        <div className="w-1/3 p-4 border-r bg-muted overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold">Print Settings</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {receiptTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Paper Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="80mm">80mm Thermal</option>
              <option value="58mm">58mm Thermal</option>
              <option value="210mm">A4</option>
            </select>
          </div>
          <SettingsInputGroup
            label="Margins (mm)"
            values={margins}
            onChange={(key, value) =>
              setMargins((m) => ({ ...m, [key]: Number(value) }))
            }
          />
          <SettingsInputGroup
            label="Paddings (mm)"
            values={paddings}
            onChange={(key, value) =>
              setPaddings((p) => ({ ...p, [key]: Number(value) }))
            }
          />
        </div>
        <div className="w-2/3 p-6 flex justify-center items-start bg-gray-200 overflow-y-auto">
          <div
            className="shadow-lg"
            style={{
              width: pageSize,
              backgroundColor: "white",
              color: "black",
              margin: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
              padding: `${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm`,
              boxSizing: "border-box",
            }}
          >
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
