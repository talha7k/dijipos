import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PrinterSettings,
  ReportTemplate,
} from "@/types";
import { renderTemplate } from "@/lib/template-renderer";
import { DialogWithActions } from "@/components/ui/DialogWithActions";

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

interface ReportPrintDialogProps {
  reportTemplates?: ReportTemplate[];
  printerSettings?: PrinterSettings | null;
  children: ReactNode;
  title?: string;
  onOpenChange?: (open: boolean) => void;
  allowedPageSizes?: Array<"80mm" | "58mm" | "210mm" | "letter">;
  data?: any;
}

export function ReportPrintDialog({
  reportTemplates = [],
  printerSettings,
  children,
  title = "Print Report",
  onOpenChange,
  allowedPageSizes,
  data,
}: ReportPrintDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Use external onOpenChange if provided
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [pageSize, setPageSize] = useState("80mm");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  
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
        reportTemplates.some((t) => t.id === defaultTemplateId);
      const newSelectedTemplate = isValidDefault ? defaultTemplateId : reportTemplates[0]?.id || "";
      if (selectedTemplate !== newSelectedTemplate) {
        setSelectedTemplate(newSelectedTemplate);
      }

      // 2. Set paper size
      const newPageSize = settings?.paperWidth ? `${settings.paperWidth}mm` : "80mm";
      if (pageSize !== newPageSize) {
        setPageSize(newPageSize);
      }

      // 3. Set margins and paddings
      const newMargins = {
        top: settings?.marginTop ?? 0,
        right: settings?.marginRight ?? 0,
        bottom: settings?.marginBottom ?? 0,
        left: settings?.marginLeft ?? 0,
      };
      const newPaddings = {
        top: settings?.paddingTop ?? 3,
        right: settings?.paddingRight ?? 3,
        bottom: settings?.paddingBottom ?? 3,
        left: settings?.paddingLeft ?? 3,
      };

      // Only update if values actually changed
      if (JSON.stringify(margins) !== JSON.stringify(newMargins)) {
        setMargins(newMargins);
      }
      if (JSON.stringify(paddings) !== JSON.stringify(newPaddings)) {
        setPaddings(newPaddings);
      }
    } else {
      if (renderedHtml !== "") {
        setRenderedHtml(""); // Clear preview on close
      }
    }
  }, [open, printerSettings, reportTemplates, renderedHtml, pageSize, selectedTemplate, margins, paddings]);

  

  // Effect to render the preview when settings change
  useEffect(() => {
    if (!open || !selectedTemplate) {
      return;
    }

    const template = reportTemplates.find((t) => t.id === selectedTemplate);
    if (!template) {
      return;
    }

    // Set direction based on template type
    setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");

    const renderPreview = async () => {
      try {
        const templateResponse = await fetch(`/templates/${template.content}`);
        const templateContent = await templateResponse.text();
        const content = renderTemplate(templateContent, data);
        setRenderedHtml(content);
      } catch (error) {
        console.error("Failed to render report preview:", error);
        setRenderedHtml("<p style='color: red;'>Error rendering preview.</p>");
      }
    };

    renderPreview();
  }, [open, selectedTemplate, data, reportTemplates]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              @media print {
                @page {
                  size: ${pageSize === '210mm' ? 'A4' : pageSize === 'letter' ? 'letter' : pageSize};
                  margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
                }
                body {
                  padding: ${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm;
                }
              }
              body {
                font-family: sans-serif;
              }
            </style>
          </head>
          <body>
            <div dir="${direction}">${renderedHtml}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
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
            disabled={!selectedTemplate}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
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
              {reportTemplates.map((t) => (
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
              {allowedPageSizes ? (
                <>
                  {allowedPageSizes.includes("210mm") && <option value="210mm">A4</option>}
                  {allowedPageSizes.includes("letter") && <option value="letter">Letter</option>}
                  {allowedPageSizes.includes("80mm") && <option value="80mm">80mm Thermal</option>}
                  {allowedPageSizes.includes("58mm") && <option value="58mm">58mm Thermal</option>}
                </>
              ) : (
                <>
                  <option value="80mm">80mm Thermal</option>
                  <option value="58mm">58mm Thermal</option>
                  <option value="210mm">A4</option>
                </>
              )}
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