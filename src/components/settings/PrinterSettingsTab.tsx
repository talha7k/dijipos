'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PrinterSettings, FontSize, PrinterType } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Printer, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectedPrinter {
  id: string;
  name: string;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
  usbVendorId?: number;
  usbProductId?: number;
}

interface ThermalPrinterService {
  getConnectedPrinters(): Promise<ConnectedPrinter[]>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  printTest(): Promise<void>;
  requestPrinterConnection(): Promise<ConnectedPrinter | null>;
  isWebSerialSupported(): boolean;
  isWebUSBSupported(): boolean;
  getConnectedUSBPrinters(): Promise<ConnectedPrinter[]>;
  requestUSBPrinterConnection(): Promise<ConnectedPrinter | null>;
  config: any; // Access to printer configuration
}

interface PrinterSettingsTabProps {
  printerSettings: PrinterSettings | null;
  onPrinterSettingsUpdate: (settings: PrinterSettings) => void;
}

export function PrinterSettingsTab({ printerSettings, onPrinterSettingsUpdate }: PrinterSettingsTabProps) {
  const { organizationId } = useAuth();
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [connectedPrinters, setConnectedPrinters] = useState<ConnectedPrinter[]>([]);
  const [connectedUSBPrinters, setConnectedUSBPrinters] = useState<ConnectedPrinter[]>([]);
  const [isWebSerialSupported, setIsWebSerialSupported] = useState(false);
  const [isWebUSBSupported, setIsWebUSBSupported] = useState(false);
  const [newPrinterSettings, setNewPrinterSettings] = useState({
    paperWidth: printerSettings?.paperWidth || 58,
    fontSize: printerSettings?.fontSize || FontSize.MEDIUM,
    autoCut: printerSettings?.autoCut ?? true,
    printerType: printerSettings?.printerType || PrinterType.EPSON,
    characterSet: printerSettings?.characterSet || 'korea',
    baudRate: printerSettings?.baudRate || 9600
  });

  useEffect(() => {
    // Check API support
    const checkAPISupport = () => {
      const serialSupported = (thermalPrinter as unknown as ThermalPrinterService).isWebSerialSupported();
      const usbSupported = (thermalPrinter as unknown as ThermalPrinterService).isWebUSBSupported();
      setIsWebSerialSupported(serialSupported);
      setIsWebUSBSupported(usbSupported);
    };

    checkAPISupport();
    fetchConnectedPrinters();
    fetchConnectedUSBPrinters();
  }, []);

  const fetchConnectedUSBPrinters = async () => {
    try {
      const usbPrinters = await (thermalPrinter as unknown as ThermalPrinterService).getConnectedUSBPrinters();
      setConnectedUSBPrinters(usbPrinters);
    } catch (error) {
      console.error('Failed to fetch connected USB printers:', error);
    }
  };

  const fetchConnectedPrinters = async () => {
    try {
      const printers = await (thermalPrinter as unknown as ThermalPrinterService).getConnectedPrinters();
      setConnectedPrinters(printers);
    } catch (error) {
      console.error('Failed to fetch connected printers:', error);
      toast.error('Failed to detect printers. Please check your browser compatibility.');
    }
  };

  const handleUpdatePrinterSettings = async () => {
    if (!organizationId) return;

    const calculateCharactersPerLine = (width: number) => {
      if (width <= 48) return 24;
      if (width <= 58) return 32;
      if (width <= 80) return 48;
      return 64;
    };

    const updatedPrinter: PrinterSettings = {
      id: 'printer',
      ...newPrinterSettings,
      characterPerLine: calculateCharactersPerLine(newPrinterSettings.paperWidth),
      organizationId,
      createdAt: printerSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'), updatedPrinter);
    onPrinterSettingsUpdate(updatedPrinter);
    setPrinterDialogOpen(false);
  };

  const handleConnectPrinter = async () => {
    try {
      await thermalPrinter.connect();
      toast.success('Printer connected successfully!');
      fetchConnectedPrinters();
    } catch (error) {
      toast.error('Failed to connect to printer');
    }
  };

  const handleRequestPrinterConnection = async () => {
    try {
      const printer = await (thermalPrinter as unknown as ThermalPrinterService).requestPrinterConnection();
      if (printer) {
        toast.success('Serial printer connected successfully!');
        fetchConnectedPrinters();
      }
    } catch (error) {
      toast.error('Failed to connect to serial printer. Please ensure your printer is connected and try again.');
    }
  };

  const handleRequestUSBPrinterConnection = async () => {
    try {
      const printer = await (thermalPrinter as unknown as ThermalPrinterService).requestUSBPrinterConnection();
      if (printer) {
        toast.success('USB printer connected successfully!');
        fetchConnectedUSBPrinters();
      }
    } catch (error) {
      toast.error('Failed to connect to USB printer. Please ensure your printer is connected and try again.');
    }
  };

  const handleTestPrint = async () => {
    try {
      await (thermalPrinter as unknown as ThermalPrinterService).printTest();
      toast.success('Test print sent!');
    } catch (error) {
      toast.error('Failed to print test');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Printer Settings
          </div>
          <Dialog open={printerDialogOpen} onOpenChange={setPrinterDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Printer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Printer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paper-width">Paper Width (mm)</Label>
                  <select
                    id="paper-width"
                    className="w-full p-2 border rounded"
                    value={newPrinterSettings.paperWidth}
                    onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, paperWidth: parseInt(e.target.value) })}
                  >
                    <option value={48}>48mm</option>
                    <option value={58}>58mm</option>
                    <option value={80}>80mm</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="font-size">Font Size</Label>
                  <select
                    id="font-size"
                    className="w-full p-2 border rounded"
                    value={newPrinterSettings.fontSize}
                    onChange={(e) => {
                      const value = e.target.value as FontSize;
                      setNewPrinterSettings({ ...newPrinterSettings, fontSize: value });
                    }}
                  >
                    <option value={FontSize.SMALL}>Small</option>
                    <option value={FontSize.MEDIUM}>Medium</option>
                    <option value={FontSize.LARGE}>Large</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-cut"
                    checked={newPrinterSettings.autoCut}
                    onCheckedChange={(checked) => setNewPrinterSettings({ ...newPrinterSettings, autoCut: checked })}
                  />
                  <Label htmlFor="auto-cut">Auto Cut (if supported)</Label>
                </div>
                <div>
                  <Label htmlFor="printer-type">Printer Type</Label>
                  <select
                    id="printer-type"
                    className="w-full p-2 border rounded"
                    value={newPrinterSettings.printerType}
                    onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, printerType: e.target.value as PrinterType })}
                  >
                    <option value={PrinterType.EPSON}>Epson</option>
                    <option value={PrinterType.STAR}>Star</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="character-set">Character Set</Label>
                  <select
                    id="character-set"
                    className="w-full p-2 border rounded"
                    value={newPrinterSettings.characterSet}
                    onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, characterSet: e.target.value })}
                  >
                    <option value="korea">Korea</option>
                    <option value="japan">Japan</option>
                    <option value="multilingual">Multilingual</option>
                    <option value="usa">USA</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="baud-rate">Baud Rate</Label>
                  <select
                    id="baud-rate"
                    className="w-full p-2 border rounded"
                    value={newPrinterSettings.baudRate}
                    onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, baudRate: parseInt(e.target.value) })}
                  >
                    <option value={9600}>9600</option>
                    <option value={19200}>19200</option>
                    <option value={38400}>38400</option>
                    <option value={115200}>115200</option>
                  </select>
                </div>
                <Button onClick={handleUpdatePrinterSettings} className="w-full">
                  Update Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {printerSettings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Paper Width:</span>
              <span className="font-medium">{printerSettings.paperWidth}mm</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Font Size:</span>
              <span className="font-medium">{printerSettings.fontSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Characters per Line:</span>
              <span className="font-medium">{printerSettings.characterPerLine}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto Cut:</span>
              <Badge variant={printerSettings.autoCut ? "default" : "secondary"}>
                {printerSettings.autoCut ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Printer Type:</span>
              <span className="font-medium">{printerSettings.printerType || 'epson'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Character Set:</span>
              <span className="font-medium">{printerSettings.characterSet || 'korea'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Baud Rate:</span>
              <span className="font-medium">{printerSettings.baudRate || 9600}</span>
            </div>

            {/* Print Method Selection */}
            <div className="border-t pt-4 mb-4">
              <h4 className="text-sm font-medium mb-3">Print Method:</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="browser-print"
                    name="print-method"
                    checked={(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'browser'}
                    onChange={() => {
                      (thermalPrinter as unknown as { config: { connectionType?: string } }).config.connectionType = 'browser';
                      toast.success('Switched to browser printing');
                    }}
                  />
                  <Label htmlFor="browser-print" className="text-sm">
                    <strong>Browser Print (Recommended)</strong> - Use your browser&apos;s native print dialog.
                    Works with any printer including thermal printers.
                  </Label>
                </div>

                {isWebSerialSupported && (
                  <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="serial-print"
                    name="print-method"
                    checked={(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'serial'}
                    onChange={() => {
                      (thermalPrinter as unknown as { config: { connectionType?: string } }).config.connectionType = 'serial';
                      toast.success('Switched to serial printing');
                    }}
                  />
                    <Label htmlFor="serial-print" className="text-sm">
                      Serial Printer - Direct connection to thermal printers via serial/USB
                    </Label>
                  </div>
                )}

                {isWebUSBSupported && (
                  <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="usb-print"
                    name="print-method"
                    checked={(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'usb'}
                    onChange={() => {
                      (thermalPrinter as unknown as { config: { connectionType?: string } }).config.connectionType = 'usb';
                      toast.success('Switched to USB printing');
                    }}
                  />
                    <Label htmlFor="usb-print" className="text-sm">
                      USB Printer - Direct USB connection to thermal printers
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Browser Print Section */}
            {(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'browser' && (
              <div className="border-t pt-4 mb-4">
                <h4 className="text-sm font-medium mb-2">Browser Printing:</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Ready to Print</span>
                  </div>
                  <p className="text-sm text-blue-600 mb-3">
                    Browser printing is active. Receipts will open in a print dialog optimized for thermal printers.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestPrint}
                    className="w-full"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Test Browser Print
                  </Button>
                </div>
              </div>
            )}

            {/* Connected Printers Section */}
            {((thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'serial' ||
              (thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'usb') && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Connected Printers:</span>
                  <div className="flex gap-2">
                    {(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'serial' && isWebSerialSupported && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchConnectedPrinters}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh Serial
                      </Button>
                    )}
                    {(thermalPrinter as unknown as { config: { connectionType?: string } }).config?.connectionType === 'usb' && isWebUSBSupported && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchConnectedUSBPrinters}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh USB
                      </Button>
                    )}
                  </div>
                </div>

              {/* API Support Warnings */}
              {(!isWebSerialSupported && !isWebUSBSupported) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Printer APIs Not Supported</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Your browser doesn&apos;t support Web Serial or WebUSB APIs. Please use Chrome, Edge, or Opera for printer functionality.
                  </p>
                </div>
              )}

              {isWebSerialSupported && !isWebUSBSupported && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Serial Printers Supported</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Your browser supports serial printers. USB printers may require additional browser support.
                  </p>
                </div>
              )}
              {/* Serial Printers */}
              {connectedPrinters.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Serial Printers:</h4>
                  <div className="space-y-2">
                    {connectedPrinters.map((printer) => (
                      <div key={printer.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{printer.name}</span>
                          {printer.vendorId && (
                            <div className="text-sm text-muted-foreground">
                              Serial - Vendor: 0x{printer.vendorId.toString(16)}, Product: 0x{printer.productId?.toString(16)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleConnectPrinter}
                          >
                            Connect
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleTestPrint}
                          >
                            Test Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* USB Printers */}
              {connectedUSBPrinters.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">USB Printers:</h4>
                  <div className="space-y-2">
                    {connectedUSBPrinters.map((printer) => (
                      <div key={printer.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{printer.name}</span>
                          {printer.vendorId && (
                            <div className="text-sm text-muted-foreground">
                              USB - Vendor: 0x{printer.vendorId.toString(16)}, Product: 0x{printer.productId?.toString(16)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRequestUSBPrinterConnection}
                          >
                            Connect USB
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleTestPrint}
                          >
                            Test Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No printers detected */}
              {connectedPrinters.length === 0 && connectedUSBPrinters.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No printers detected. Connect a thermal printer and refresh, or select one manually.
                  </p>
                  <div className="flex gap-2">
                    {isWebSerialSupported && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRequestPrinterConnection}
                        className="flex-1"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Select Serial Printer
                      </Button>
                    )}
                    {isWebUSBSupported && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRequestUSBPrinterConnection}
                        className="flex-1"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Select USB Printer
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {(thermalPrinter as unknown as ThermalPrinterService).isConnected() && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Printer Connected</span>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Printer settings not configured.</p>
        )}
      </CardContent>
    </Card>
  );
}