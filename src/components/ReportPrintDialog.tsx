import React, { useState, useCallback, useMemo, ReactNode } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PrinterSettings,
  ReportTemplate,
} from "@/types";
import { renderTemplate, TemplateData } from "@/lib/template-renderer";
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
  description?: string;
  onOpenChange?: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  allowedPageSizes?: string[];
}

export function ReportPrintDialog({
  reportTemplates = [],
  printerSettings,
  children,
  title = "Print Report",
  description,
   onOpenChange,
   data,
}: ReportPrintDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Use external onOpenChange if provided
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const settings = printerSettings?.receipts;
    const defaultTemplateId = settings?.defaultTemplateId;
    const isValidDefault = defaultTemplateId && reportTemplates.some((t) => t.id === defaultTemplateId);
    return isValidDefault ? defaultTemplateId : reportTemplates[0]?.id || "";
  });
  const [pageSize, setPageSize] = useState(() => {
    const settings = printerSettings?.receipts;
    return settings?.paperWidth ? `${settings.paperWidth}mm` : "80mm";
  });
  // Derive direction from template
  const direction = useMemo(() => {
    const template = reportTemplates.find((t) => t.id === selectedTemplate);
    return template?.type?.includes("arabic") ? "rtl" : "ltr";
  }, [selectedTemplate, reportTemplates]);

  const [margins, setMargins] = useState(() => {
    // No margins for thermal receipts/reports
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
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





  // Clear preview when dialog closes - use derived value
  const renderedHtmlContent = useMemo(() => {
    if (!open) return "";
    
    if (!selectedTemplate) return "";
    
    const template = reportTemplates.find((t) => t.id === selectedTemplate);
    if (!template || !data) return "";
    
    try {
      const templateContent = template.content;
      return renderTemplate(templateContent, data as TemplateData);
    } catch (error) {
      console.error("Failed to render report preview:", error);
      return "<p style='color: red;'>Error rendering preview.</p>";
    }
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
            <div dir="${direction}">${renderedHtmlContent}</div>
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
      description={description}
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
               <option value="80mm">80mm Thermal</option>
               <option value="58mm">58mm Thermal</option>
               <option value="210mm">A4</option>
               <option value="letter">Letter</option>
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
              dangerouslySetInnerHTML={{ __html: renderedHtmlContent }}
            />
          </div>
        </div>
      </div>
    </DialogWithActions>
  );
}