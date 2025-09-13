'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ReceiptTemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptTemplatesTabProps {
  receiptTemplates: ReceiptTemplate[];
  onRefresh?: () => void;
}

export function ReceiptTemplatesTab({ receiptTemplates, onRefresh }: ReceiptTemplatesTabProps) {
  const { organizationId } = useAuth();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const [newReceiptTemplate, setNewReceiptTemplate] = useState({
    name: '',
    description: '',
    content: '',
    type: 'thermal' as 'thermal' | 'a4'
  });

  const handleAddReceiptTemplate = async () => {
    if (!organizationId || !newReceiptTemplate.name.trim()) return;

    const defaultTemplateContent = '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Receipt</title>\n  <style>\n    body { font-family: monospace; margin: 0; padding: 10px; }\n    .header { text-align: center; margin-bottom: 10px; }\n    .content { margin-bottom: 10px; }\n    .footer { text-align: center; margin-top: 10px; }\n    .line { display: flex; justify-content: space-between; }\n    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }\n  </style>\n</head>\n<body>\n  <div className="header">\n    <h2>{{companyName}}</h2>\n    <p>{{companyAddress}}</p>\n    <p>Tel: {{companyPhone}}</p>\n    <p>VAT: {{companyVat}}</p>\n    <hr>\n    <p>Order #: {{orderNumber}}</p>\n    <p>Date: {{orderDate}}</p>\n    <p>Table: {{tableName}}</p>\n    <p>Customer: {{customerName}}</p>\n    <hr>\n  </div>\n  \n  <div className="content">\n    {{#each items}}\n    <div className="line">\n      <span>{{name}} ({{quantity}}x)</span>\n      <span>{{total}}</span>\n    </div>\n    {{/each}}\n  </div>\n  \n  <div className="total">\n    <div className="line">\n      <span>Subtotal:</span>\n      <span>{{subtotal}}</span>\n    </div>\n    <div className="line">\n      <span>VAT ({{vatRate}}%):</span>\n      <span>{{vatAmount}}</span>\n    </div>\n    <div className="line">\n      <span>TOTAL:</span>\n      <span>{{total}}</span>\n    </div>\n  </div>\n  \n  <div className="footer">\n    <p>Payment: {{paymentMethod}}</p>\n    <p>Thank you for your business!</p>\n  </div>\n</body>\n</html>';

    await addDoc(collection(db, 'organizations', organizationId, 'receiptTemplates'), {
      ...newReceiptTemplate,
      content: newReceiptTemplate.content || defaultTemplateContent,
      isDefault: receiptTemplates.length === 0,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewReceiptTemplate({ name: '', description: '', content: '', type: 'thermal' });
    setTemplateDialogOpen(false);
    onRefresh?.();
    toast.success('Receipt template added successfully');
  };

  const handleSetDefaultTemplate = async (templateId: string) => {
    if (!organizationId) return;

    const updatePromises = receiptTemplates.map(template => {
      const templateRef = doc(db, 'organizations', organizationId, 'receiptTemplates', template.id);
      return setDoc(templateRef, {
        ...template,
        isDefault: template.id === templateId,
        updatedAt: new Date()
      });
    });

    await Promise.all(updatePromises);
    onRefresh?.();
  };

  const handleDeleteTemplate = (id: string) => {
    setDeleteTemplateId(id);
  };

  const confirmDeleteTemplate = async () => {
    if (!organizationId || !deleteTemplateId) return;
    
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'receiptTemplates', deleteTemplateId));
      toast.success('Receipt template deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting receipt template:', error);
      toast.error('Failed to delete receipt template');
    } finally {
      setDeleteTemplateId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Receipt Templates
          </div>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Receipt Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Thermal Receipt, A4 Receipt"
                    value={newReceiptTemplate.name}
                    onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Input
                    id="template-description"
                    placeholder="Description for this template"
                    value={newReceiptTemplate.description}
                    onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Template Type</Label>
                  <select
                    id="template-type"
                    className="w-full p-2 border rounded"
                    value={newReceiptTemplate.type}
                    onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, type: e.target.value as 'thermal' | 'a4' })}
                  >
                    <option value="thermal">Thermal Printer</option>
                    <option value="a4">A4 Printer</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="template-content">HTML Template Content</Label>
                  <textarea
                    id="template-content"
                    className="w-full h-64 p-2 border rounded font-mono text-sm"
                    placeholder="Enter HTML template with placeholders like {{companyName}}, {{orderNumber}}, etc."
                    value={newReceiptTemplate.content}
                    onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, content: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Available placeholders: {'{{companyName}}'}, {'{{companyAddress}}'}, {'{{companyPhone}}'}, {'{{companyVat}}'}, {'{{orderNumber}}'}, {'{{orderDate}}'}, {'{{tableName}}'}, {'{{customerName}}'}, {'{{#each items}}...{{/each}}'}, {'{{subtotal}}'}, {'{{vatRate}}'}, {'{{vatAmount}}'}, {'{{total}}'}, {'{{paymentMethod}}'}
                  </p>
                </div>
                <Button onClick={handleAddReceiptTemplate} className="w-full">
                  Add Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {receiptTemplates.length === 0 ? (
          <p className="text-muted-foreground">No receipt templates added yet.</p>
        ) : (
          <div className="grid gap-2">
            {receiptTemplates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.isDefault && <Badge variant="default">Default</Badge>}
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefaultTemplate(template.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <AlertDialog open={deleteTemplateId === template.id} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the receipt template "{template.name}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTemplateId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}