'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrinterSettings } from '@/types';
import { FontSize } from '@/types/enums';

interface PrinterSettingsPreviewProps {
  printerSettings?: PrinterSettings | null;
  documentType: 'receipts' | 'invoices' | 'quotes';
  title?: string;
}

export function PrinterSettingsPreview({
  printerSettings,
  documentType,
  title = 'Current Print Settings'
}: PrinterSettingsPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const settings = printerSettings?.[documentType];

  if (!settings) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">No settings configured</p>
        </CardContent>
      </Card>
    );
  }

  const formatFontSize = (size?: FontSize) => {
    switch (size) {
      case FontSize.SMALL: return 'Small';
      case FontSize.MEDIUM: return 'Medium';
      case FontSize.LARGE: return 'Large';
      default: return 'Medium';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <Settings className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Margins */}
          <div>
            <h4 className="text-sm font-medium mb-2">Margins (mm)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Top:</span>
                <Badge variant="outline">{settings.marginTop ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Bottom:</span>
                <Badge variant="outline">{settings.marginBottom ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Left:</span>
                <Badge variant="outline">{settings.marginLeft ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Right:</span>
                <Badge variant="outline">{settings.marginRight ?? 0}</Badge>
              </div>
            </div>
          </div>

          {/* Padding */}
          <div>
            <h4 className="text-sm font-medium mb-2">Padding (mm)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Top:</span>
                <Badge variant="outline">{settings.paddingTop ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Bottom:</span>
                <Badge variant="outline">{settings.paddingBottom ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Left:</span>
                <Badge variant="outline">{settings.paddingLeft ?? 0}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Right:</span>
                <Badge variant="outline">{settings.paddingRight ?? 0}</Badge>
              </div>
            </div>
          </div>

          {/* Printer Settings */}
          <div>
            <h4 className="text-sm font-medium mb-2">Printer Settings</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Paper Width:</span>
                <Badge variant="outline">{settings.paperWidth ?? 'Auto'}mm</Badge>
              </div>
              <div className="flex justify-between">
                <span>Font Size:</span>
                <Badge variant="outline">{formatFontSize(settings.fontSize)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Heading Font:</span>
                <Badge variant="outline">{settings.headingFont ?? 'Arial'}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Body Font:</span>
                <Badge variant="outline">{settings.bodyFont ?? 'Helvetica'}</Badge>
              </div>
              {documentType === 'receipts' && (
                <>
                  <div className="flex justify-between">
                    <span>Include QR Code:</span>
                    <Badge variant={settings.includeQRCode ? "default" : "secondary"}>
                      {settings.includeQRCode ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Line Spacing:</span>
                    <Badge variant="outline">{settings.lineSpacing ?? 1.2}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Print:</span>
                    <Badge variant={settings.autoPrint ? "default" : "secondary"}>
                      {settings.autoPrint ? "Yes" : "No"}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}