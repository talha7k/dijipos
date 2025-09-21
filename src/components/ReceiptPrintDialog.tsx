import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  console.log(
    "ReceiptPrintDialog: organization logoUrl:",
    organization?.logoUrl,
  );
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
      total: item.total.toFixed(2),
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
  order?: Order;
  organization?: Organization | null;
  receiptTemplates?: ReceiptTemplate[];
  payments?: OrderPayment[];
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
  title?: string;
  onOpenChange?: (open: boolean) => void;
}

export function ReceiptPrintDialog({
  order,
  organization,
  receiptTemplates = [],
  payments: initialPayments = [],
  printerSettings,
  children,
  title = "Print Receipt",
  onOpenChange,
}: ReceiptPrintDialogProps) {
  console.log("ReceiptPrintDialog: organization data:", organization);
  const { getPaymentsForOrder } = useOrders();
  const [open, setOpen] = useState(false);

  // Use external onOpenChange if provided
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState("");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [payments, setPayments] = useState<OrderPayment[]>(initialPayments);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Initialize states with default values from settings
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    const settings = printerSettings?.receipts;
    const defaultTemplateId = settings?.defaultTemplateId;
    const isValidDefault =
      defaultTemplateId &&
      receiptTemplates.some((t) => t.id === defaultTemplateId);
    return isValidDefault ? defaultTemplateId : receiptTemplates[0]?.id || "";
  });
  const [pageSize, setPageSize] = useState(() => {
    const settings = printerSettings?.receipts;
    return settings?.paperWidth ? `${settings.paperWidth}mm` : "80mm";
  });
  const [margins, setMargins] = useState(() => {
    const settings = printerSettings?.receipts;
    return {
      top: settings?.marginTop ?? 0,
      right: settings?.marginRight ?? 0,
      bottom: settings?.marginBottom ?? 0,
      left: settings?.marginLeft ?? 0,
    };
  });
  const [paddings, setPaddings] = useState(() => {
    const settings = printerSettings?.receipts;
    return {
      top: settings?.paddingTop ?? 3,
      right: settings?.paddingRight ?? 3,
      bottom: settings?.paddingBottom ?? 3,
      left: settings?.paddingLeft ?? 3,
    };
  });

  // Ref to prevent infinite loops
  const isRenderingRef = useRef(false);
  const lastRenderKeyRef = useRef("");

  // Effect to update settings when props change
  useEffect(() => {
    const settings = printerSettings?.receipts;

    // 1. Set default template
    const defaultTemplateId = settings?.defaultTemplateId;
    const isValidDefault =
      defaultTemplateId &&
      receiptTemplates.some((t) => t.id === defaultTemplateId);
    const newSelectedTemplate = isValidDefault
      ? defaultTemplateId
      : receiptTemplates[0]?.id || "";
    setSelectedTemplate(newSelectedTemplate);

    // 2. Set paper size (independent of template change)
    const newPageSize = settings?.paperWidth
      ? `${settings.paperWidth}mm`
      : "80mm";
    setPageSize(newPageSize);

    // 3. Set margins and paddings (apply for both raw HTML and template modes)
    const newMargins = {
      top: settings?.marginTop ?? 0,
      right: settings?.marginRight ?? 0,
      bottom: settings?.marginBottom ?? 0,
      left: settings?.marginLeft ?? 0,
    };
    const newPaddings = {
      top: settings?.paddingTop ?? 1,
      right: settings?.paddingRight ?? 1,
      bottom: settings?.paddingBottom ?? 1,
      left: settings?.paddingLeft ?? 1,
    };

    setMargins(newMargins);
    setPaddings(newPaddings);
  }, [printerSettings, receiptTemplates]);

  // Effect to clear preview when dialog closes
  useEffect(() => {
    if (!open) {
      setRenderedHtml(""); // Clear preview on close
    }
  }, [open]);

  // Effect to fetch payments when dialog opens
  useEffect(() => {
    if (open && order && initialPayments.length === 0) {
      const fetchPayments = async () => {
        try {
          setPaymentsLoading(true);
          const orderPayments = await getPaymentsForOrder(order.id);
          setPayments(orderPayments);
        } catch (error) {
          console.error("Error fetching payments for receipt:", error);
          setPayments([]);
        } finally {
          setPaymentsLoading(false);
        }
      };

      fetchPayments();
    } else if (open && initialPayments.length > 0) {
      setPayments(initialPayments);
    }
  }, [open, order, initialPayments, getPaymentsForOrder]);

  // Memoize the render data to prevent unnecessary re-renders
  const renderData = useMemo(
    () => ({
      order,
      organization: organization || null,
      payments,
      printerSettings: printerSettings ?? undefined,
    }),
    [order, organization, payments, printerSettings],
  );

  // Effect to render the preview when settings change
  useEffect(() => {
    // Only render if dialog is open, we're not using raw HTML, have a template, and payments are loaded
    if (
      !open ||
      !selectedTemplate ||
      paymentsLoading ||
      isRenderingRef.current
    ) {
      return;
    }

    const template = receiptTemplates.find((t) => t.id === selectedTemplate);
    if (!template || !renderData.order) {
      return;
    }

    // Create a unique key for this render to prevent duplicate renders
    const renderKey = `${selectedTemplate}-${JSON.stringify(renderData)}`;
    if (lastRenderKeyRef.current === renderKey) {
      return;
    }

    // Set direction based on template type
    setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");

    const renderPreview = async () => {
      isRenderingRef.current = true;
      lastRenderKeyRef.current = renderKey;

      try {
        const content = await renderReceipt(
          template,
          renderData.order!,
          renderData.organization,
          renderData.payments,
          renderData.printerSettings,
        );
        setRenderedHtml(content);
      } catch (error) {
        console.error("Failed to render receipt preview:", error);
        setRenderedHtml("<p style='color: red;'>Error rendering preview.</p>");
      } finally {
        isRenderingRef.current = false;
      }
    };

    renderPreview();
  }, [open, selectedTemplate, renderData, paymentsLoading, receiptTemplates]);

  const handlePrint = () => {
    // We'll keep this console log as a helpful debugging tool.
    console.log("Printing with page size:", pageSize);

    // 1. Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      toast.error("Could not create a print frame.");
      document.body.removeChild(iframe);
      return;
    }

    // 2. Define Adaptive CSS based on selected pageSize
    let printStyles = "";

    if (pageSize === "210mm") {
      // --- STYLES FOR A4 PAPER ---
      printStyles = `
        @media print {
          @page {
            size: A4;
            margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          }
          html, body {
            width: 100%;
            font-size: 12pt;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          #receipt-content {
            width: 100%;
            padding: ${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm;
            box-sizing: border-box; /* Good practice to include this for A4 too */
          }
        }
      `;
    } else {
      // --- STYLES FOR THERMAL PAPER ---
      printStyles = `
        @media print {
          @page {
            /* FIX 1: Set page margins to 0 for thermal printers to prevent cutoffs. */
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          #receipt-content {
            width: ${pageSize};
            padding: ${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm;
            page-break-after: always; /* Crucial for thermal printers */
            /* FIX 2: Add box-sizing to make padding work correctly within the fixed width. */
            box-sizing: border-box;
          }
        }
      `;
    }

    // 3. Write the HTML and the chosen styles into the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div id="receipt-content" dir="${direction}">
            ${renderedHtml}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // 4. Wait for images to load before printing
    const images = iframeDoc.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to avoid hanging
          setTimeout(() => resolve(), 3000); // Failsafe timeout
        }
      });
    });

    Promise.all(imagePromises).then(() => {
      // 5. Close the dialog immediately
      handleOpenChange(false);
      // 6. Print the iframe's content
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // 7. Clean up the iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    });
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      actions={
        <>
          <Button onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedTemplate || isGenerating || paymentsLoading}
          >
            <Printer className="h-4 w-4 mr-2" />
            {paymentsLoading
              ? "Loading payments..."
              : isGenerating
                ? "Processing..."
                : "Print"}
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
          <h2 className="text-lg font-bold">
            Print Settings - (Paper:{pageSize})
          </h2>
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
           {pageSize === "210mm" && (
             <SettingsInputGroup
               label="Margins (mm)"
               values={margins}
               onChange={(key, value) =>
                 setMargins((m) => ({ ...m, [key]: Number(value) }))
               }
             />
           )}
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
