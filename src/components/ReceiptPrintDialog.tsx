import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";

// --- UI Components ---
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";

// --- Types & Enums ---
import {
  Order,
  Organization,
  ReceiptTemplate,
  OrderPayment,
  PrinterSettings,
} from "@/types";
import { ReceiptTemplateData } from "@/types/template";

// --- Default Templates ---
import { defaultEnglishReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-english";
import { defaultReceiptA4Template } from "@/components/templates/receipt/default-receipt-a4-english";
import { defaultArabicReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-arabic";
import { defaultArabicReceiptA4Template } from "@/components/templates/receipt/default-receipt-a4-arabic";

// --- Utility Functions ---
import { createReceiptQRData, generateZatcaQRCode } from "@/lib/zatca-qr";
import { formatDateTime } from "@/lib/utils";

// ====================================================================================
// SECTION: Template Rendering Logic
// ====================================================================================

/**
 * Generates a ZATCA-compliant QR code for a given order.
 * @param order The order object.
 * @param organization The organization object.
 * @returns A promise that resolves to the base64 encoded QR code image.
 */
async function generateZatcaQR(
  order: Order,
  organization: Organization | null,
): Promise<string> {
  try {
    const qrData = createReceiptQRData(order, organization);
    return await generateZatcaQRCode(qrData);
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    // Return a placeholder 1x1 pixel transparent PNG if generation fails
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  }
}

/**
 * Retrieves the default HTML template content based on the template type.
 * @param templateType A string identifying the template type (e.g., 'english_thermal').
 * @returns The HTML content of the default template as a string.
 */
function getDefaultReceiptTemplate(
  templateType: string = "english_thermal",
): string {
  switch (templateType) {
    case "english_a4":
      return defaultReceiptA4Template;
    case "arabic_a4":
      return defaultArabicReceiptA4Template;
    case "arabic_thermal":
      return defaultArabicReceiptTemplate;
    case "english_thermal":
    default:
      return defaultEnglishReceiptTemplate;
  }
}

/**
 * Replaces placeholders in an HTML template string with actual data.
 * @param template The HTML template string with {{placeholders}}.
 * @param data The data object containing values to inject.
 * @returns The final rendered HTML string.
 */
function renderTemplateContent(
  template: string,
  data: ReceiptTemplateData,
): string {
  let result = template;

  // --- FIX: A more robust and efficient replacer for simple variables ---
  // This single block replaces all individual 'result.replace(...)' calls.
  // The \s* matches any whitespace (including non-breaking spaces).
  result = result.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    // Check if the captured key (e.g., "companyName") exists in our data object.
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // @ts-ignore
      const value = data[key];
      // Return the value from data, or an empty string if it's null/undefined
      return value ?? "";
    }
    // If the key isn't in our data, return the original placeholder to avoid breaking it.
    return match;
  });

  // --- Keep the logic for conditionals and loops from the previous fix ---

  // Handle general conditionals like {{#companyVat}}...{{/companyVat}}
  result = result.replace(
    /{{#(\w+)}}([\s\S]*?){{\/\1}}/g,
    (match, variable, content) => {
      const value = data[variable as keyof ReceiptTemplateData];
      // @ts-ignore
      return Array.isArray(value) && value.length > 0
        ? content
        : value
          ? content
          : "";
    },
  );

  // Handle items loop: {{#each items}}...{{/each}}
  result = result.replace(
    /{{#each items}}([\s\S]*?){{\/each}}/g,
    (match, itemTemplate) => {
      return data.items
        .map((item) =>
          itemTemplate
            .replace(/{{\s*name\s*}}/g, item.name)
            .replace(/{{\s*quantity\s*}}/g, item.quantity.toString())
            .replace(/{{\s*total\s*}}/g, item.total),
        )
        .join("");
    },
  );

  // Handle payments loop: {{#each payments}}...{{/each}}
  result = result.replace(
    /{{#each payments}}([\s\S]*?){{\/each}}/g,
    (match, paymentTemplate) => {
      return data.payments
        .map((payment) =>
          paymentTemplate
            .replace(/{{\s*paymentType\s*}}/g, payment.paymentType)
            .replace(/{{\s*amount\s*}}/g, payment.amount),
        )
        .join("");
    },
  );

  return result;
}

/**
 * Prepares data and renders a complete receipt template.
 * @param template The ReceiptTemplate object.
 * @param order The Order object.
 * @param organization The Organization object.
 * @param payments An array of OrderPayment objects.
 * @param printerSettings Optional printer settings.
 * @returns A promise that resolves to the final rendered HTML string.
 */
export async function renderReceiptTemplate(
  template: ReceiptTemplate,
  order: Order,
  organization: Organization | null,
  payments: OrderPayment[] = [],
  printerSettings?: PrinterSettings,
): Promise<string> {
  const companyLogoUrl = organization?.logoUrl || "";
  const qrCodeBase64 = await generateZatcaQR(order, organization);
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // Prepare the data object for the template
  const data: ReceiptTemplateData = {
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: companyLogoUrl,
    orderNumber: order.orderNumber,
    queueNumber: order.queueNumber || "",
    orderDate: new Date(order.createdAt).toLocaleString(),
    formattedDate: formatDateTime(order.createdAt),
    tableName: order.tableName || "",
    customerName: order.customerName || "",
    createdByName: order.createdByName || "",
    orderType: order.orderType || "dine-in",
    paymentMethod: "Cash", // Default if no payments are provided
    subtotal: (order.subtotal || 0).toFixed(2),
    vatRate: (order.taxRate || 0).toString(),
    vatAmount: (order.taxAmount || 0).toFixed(2),
    total: (order.total || 0).toFixed(2),
    totalQty: totalQty,
    customHeader: printerSettings?.receipts?.customHeader || "",
    customFooter: printerSettings?.receipts?.customFooter || "",
    fontSize: printerSettings?.receipts?.fontSize,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      total: item.total.toFixed(2),
    })),
    payments: payments.map((payment) => ({
      paymentType: payment.paymentMethod,
      amount: payment.amount.toFixed(2),
    })),
    includeQR: true, // Always include QR code for receipts
    qrCodeUrl: qrCodeBase64,
  };

  // Use the template's content, or fall back to a default based on its type
  const templateContent =
    template.content || getDefaultReceiptTemplate(template.type);

  // Render the final HTML
  return renderTemplateContent(templateContent, data);
}

// ====================================================================================
// SECTION: React Component for Print Dialog
// ====================================================================================

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
  payments = [],
  printerSettings,
  children,
}: ReceiptPrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [pageSize, setPageSize] = useState("80mm");
  const [margins, setMargins] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [padding, setPadding] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  // Re-render the receipt preview when settings or template change
  useEffect(() => {
    if (open && selectedTemplate) {
      const renderPreview = async () => {
        try {
          // Add try...catch for robust error handling
          const template = receiptTemplates.find(
            (t) => t.id === selectedTemplate,
          );

          if (!template) {
            setRenderedHtml("<p>Template not found.</p>");
            return;
          }

          // Safely create the live settings object
          const livePrinterSettings: PrinterSettings = {
            ...(printerSettings || {}), // <-- SAFE SPREAD
            id: printerSettings?.id || "live-preview",
            organizationId: organization?.id || "",
            createdAt: printerSettings?.createdAt || new Date(),
            updatedAt: new Date(),
            receipts: {
              ...(printerSettings?.receipts || {}),
              paperWidth: parseInt(pageSize),
            },
          };

          const content = await renderReceiptTemplate(
            template,
            order,
            organization,
            payments,
            livePrinterSettings,
          );
          setRenderedHtml(content);
        } catch (error) {
          console.error("Failed to render receipt preview:", error);
          setRenderedHtml(
            "<p style='color: red;'>Error rendering preview. Check console for details.</p>",
          );
        }
      };
      renderPreview();
    }
  }, [
    open,
    selectedTemplate,
    order,
    organization,
    payments,
    receiptTemplates,
    printerSettings,
    pageSize,
  ]);

  // Re-render the receipt preview when settings or template change
  useEffect(() => {
    if (open && selectedTemplate) {
      const renderPreview = async () => {
        const template = receiptTemplates.find(
          (t) => t.id === selectedTemplate,
        );
        if (!template) {
          setRenderedHtml("<p>Template not found.</p>");
          return;
        }

        // Pass live settings from the dialog to the renderer
        const livePrinterSettings: PrinterSettings = {
          ...(printerSettings || {}),
          id: printerSettings?.id || "live-preview",
          organizationId:
            printerSettings?.organizationId || organization?.id || "",
          createdAt: printerSettings?.createdAt || new Date(),
          updatedAt: printerSettings?.updatedAt || new Date(),
          receipts: {
            ...(printerSettings?.receipts || {}),
            paperWidth: parseInt(pageSize),
            // You can add more live settings here if needed, e.g., fonts, etc.
          },
        };

        const content = await renderReceiptTemplate(
          template,
          order,
          organization,
          payments,
          livePrinterSettings,
        );
        setRenderedHtml(content);
      };
      renderPreview();
    }
  }, [
    open,
    selectedTemplate,
    order,
    organization,
    payments,
    receiptTemplates,
    printerSettings,
    pageSize,
  ]);

  // Handle opening the dialog and setting the default template
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const defaultTemplateId = printerSettings?.receipts?.defaultTemplateId;
      const firstAvailableId =
        receiptTemplates.length > 0 ? receiptTemplates[0].id : "";

      const selectedId =
        defaultTemplateId &&
        receiptTemplates.some((t) => t.id === defaultTemplateId)
          ? defaultTemplateId
          : firstAvailableId;

      setSelectedTemplate(selectedId);
    }
    setOpen(newOpen);
  };

  const handlePrint = async () => {
    if (!renderedHtml) {
      toast.error("Receipt content is not available.");
      return;
    }
    setIsGenerating(true);

    const fullHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            @media print {
              @page {
                size: ${pageSize};
                margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
              }
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
              }
            }
            body {
              padding: ${padding.top}mm ${padding.right}mm ${padding.bottom}mm ${padding.left}mm;
              width: ${pageSize};
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${renderedHtml}
        </body>
      </html>
    `;

    try {
      const printWindow = window.open("", "_blank", "width=600,height=800");
      if (!printWindow) {
        throw new Error(
          "Popup blocker may be preventing the print window from opening.",
        );
      }

      printWindow.document.write(fullHtmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setIsGenerating(false);
          setOpen(false);
          toast.success("Receipt sent to printer!");
        }, 1000);
      };
    } catch (error) {
      console.error("Error during printing:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during print.",
      );
      setIsGenerating(false);
    }
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button
        onClick={handlePrint}
        disabled={!selectedTemplate || isGenerating}
      >
        <Printer className="h-4 w-4 mr-2" />
        {isGenerating ? "Processing..." : "Print Receipt"}
      </Button>
    </>
  );

  return (
    <DialogWithActions
      open={open}
      onOpenChange={handleOpenChange}
      title="Print Receipt"
      description="Adjust settings and preview the receipt before printing."
      actions={actions}
      trigger={children}
      maxWidth="max-w-4xl"
    >
      <div className="flex h-[60vh] font-sans">
        {/* --- Settings Panel (Cleaned Up) --- */}
        <div className="w-1/3 p-4 border-r bg-muted/50 overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold text-foreground pb-2 border-b">
            Print Settings
          </h2>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background"
            >
              {receiptTemplates.length === 0 ? (
                <option disabled>No templates available</option>
              ) : (
                receiptTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Paper Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="w-full p-2 border border-border rounded-md shadow-sm focus:ring-ring focus:border-ring bg-background"
            >
              <option value="80mm">80mm</option>
              <option value="58mm">58mm</option>
            </select>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-1 text-foreground">
              Margins (mm)
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Controls the printer&apos;s physical unprinted border.
            </p>
            {Object.keys(margins).map((side) => (
              <div
                key={side}
                className="flex items-center justify-between mb-1"
              >
                <label className="capitalize text-sm text-muted-foreground">
                  {side}:
                </label>
                <input
                  type="number"
                  name={side}
                  value={margins[side as keyof typeof margins]}
                  onChange={(e) =>
                    setMargins((p) => ({
                      ...p,
                      [e.target.name]: Number(e.target.value),
                    }))
                  }
                  className="w-20 p-1 border border-border rounded-md text-center shadow-sm bg-background"
                />
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-md font-semibold mb-1 text-foreground">
              Padding (mm)
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Controls the internal whitespace of the content.
            </p>
            {Object.keys(padding).map((side) => (
              <div
                key={side}
                className="flex items-center justify-between mb-1"
              >
                <label className="capitalize text-sm text-muted-foreground">
                  {side}:
                </label>
                <input
                  type="number"
                  name={side}
                  value={padding[side as keyof typeof padding]}
                  onChange={(e) =>
                    setPadding((p) => ({
                      ...p,
                      [e.target.name]: Number(e.target.value),
                    }))
                  }
                  className="w-20 p-1 border border-border rounded-md text-center shadow-sm bg-background"
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- Receipt Preview Area (Styled) --- */}
        <div className="w-2/3 p-6 flex justify-center items-start bg-muted/30 overflow-y-auto">
          <div
            className="shadow-lg"
            style={{
              width: pageSize,
              // Add styles for the "paper"
              backgroundColor: "white",
              color: "black",
            }}
          >
            <div
              style={{
                padding: `${padding.top}mm ${padding.right}mm ${padding.bottom}mm ${padding.left}mm`,
                // Add styles for the "ink"
                fontFamily: "monospace", // Use a monospaced font for a receipt feel
                fontSize: "12px", // A base font size for the preview
              }}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>
      </div>
    </DialogWithActions>
  );
}
