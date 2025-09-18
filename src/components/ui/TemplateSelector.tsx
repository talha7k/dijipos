import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate, PrinterSettings } from "@/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type TemplateType = ReceiptTemplate | InvoiceTemplate | QuoteTemplate;

interface TemplateSelectorProps {
  templates: TemplateType[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  variant?: 'select' | 'radio';
  printerSettings?: PrinterSettings | null;
  templateType?: 'receipts' | 'invoices' | 'quotes';
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateChange,
  label = "Select Template",
  placeholder = "Choose a template",
  className = "",
  variant = 'select',
  printerSettings,
  templateType,
}: TemplateSelectorProps) {
  // Get the default template ID from printer settings
  const getDefaultTemplateId = () => {
    if (!printerSettings || !templateType) return null;
    
    const settings = printerSettings[templateType];
    return settings?.defaultTemplateId || null;
  };

  // Get the effective default template (from printer settings or fallback to template.isDefault)
  const getEffectiveDefaultTemplate = () => {
    const printerDefaultId = getDefaultTemplateId();
    
    if (printerDefaultId) {
      const printerDefaultTemplate = templates.find(t => t.id === printerDefaultId);
      if (printerDefaultTemplate) return printerDefaultTemplate;
    }
    
    // Fallback to template's isDefault flag
    return templates.find(t => t.isDefault);
  };

  const renderTemplateInfo = (template: TemplateType) => {
    const effectiveDefault = getEffectiveDefaultTemplate();
    const isEffectiveDefault = effectiveDefault?.id === template.id;
    
    return (
      <div className="flex items-center gap-2">
        <span>{template.name}</span>
        {isEffectiveDefault && (
          <Badge variant="default" className="text-xs">
            Default
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {template.type}
        </Badge>
      </div>
    );
  };

  const renderSelectedTemplate = () => {
    if (!selectedTemplate) return null;
    
    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return null;

    const effectiveDefault = getEffectiveDefaultTemplate();
    const isEffectiveDefault = effectiveDefault?.id === template.id;

    return (
      <div className="p-3 bg-muted/50 rounded-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{template.name}</span>
          {isEffectiveDefault && (
            <Badge variant="default">Default</Badge>
          )}
          <Badge variant="outline">{template.type}</Badge>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        )}
      </div>
    );
  };

  if (variant === 'radio') {
    return (
      <div className={`space-y-3 ${className}`}>
        <Label>{label}</Label>
        <RadioGroup value={selectedTemplate} onValueChange={onTemplateChange}>
          <div className="grid gap-3">
            {templates.map((template) => {
              const effectiveDefault = getEffectiveDefaultTemplate();
              const isEffectiveDefault = effectiveDefault?.id === template.id;
              
              return (
                <div key={template.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-accent/50">
                  <RadioGroupItem value={template.id} id={template.id} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={template.id} className="font-medium cursor-pointer">
                        {template.name}
                      </Label>
                      {isEffectiveDefault && <Badge variant="default">Default</Badge>}
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
        {renderSelectedTemplate()}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="template-select">{label}</Label>
      <Select value={selectedTemplate} onValueChange={onTemplateChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {renderTemplateInfo(template)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {renderSelectedTemplate()}
    </div>
  );
}