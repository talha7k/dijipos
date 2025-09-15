'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { InvoiceTemplate, TemplateField, TemplateStyle, TemplateFieldType } from '@/types';
import { InvoiceTemplateType } from '@/types/enums';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';

const defaultFields: TemplateField[] = [
  {
    id: 'clientName',
    name: 'clientName',
    type: TemplateFieldType.TEXT,
    label: 'Client Name',
    required: true,
    visible: true,
  },
  {
    id: 'clientEmail',
    name: 'clientEmail',
    type: TemplateFieldType.TEXT,
    label: 'Client Email',
    required: true,
    visible: true,
  },
  {
    id: 'clientAddress',
    name: 'clientAddress',
    type: TemplateFieldType.TEXT,
    label: 'Client Address',
    required: false,
    visible: true,
  },
  {
    id: 'clientVAT',
    name: 'clientVAT',
    type: TemplateFieldType.TEXT,
    label: 'Client VAT Number',
    required: false,
    visible: true,
  },
  {
    id: 'dueDate',
    name: 'dueDate',
    type: TemplateFieldType.DATE,
    label: 'Due Date',
    required: true,
    visible: true,
  },
  {
    id: 'notes',
    name: 'notes',
    type: TemplateFieldType.TEXT,
    label: 'Notes',
    required: false,
    visible: true,
  },
];

const defaultStyle: TemplateStyle = {
  primaryColor: '#000000',
  secondaryColor: '#666666',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  showLogo: false,
  showWatermark: false,
};

function TemplatesContent() {
  const { organizationId } = useAuth();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: InvoiceTemplateType.ENGLISH,
    isDefault: false,
    fields: defaultFields,
    style: defaultStyle,
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual Firestore calls
      const mockTemplates: InvoiceTemplate[] = [
        {
          id: '1',
          organizationId: organizationId!,
          name: 'English Standard',
          description: 'Standard English invoice template',
          type: InvoiceTemplateType.ENGLISH,
          isDefault: true,
          fields: defaultFields,
          style: defaultStyle,
          content: defaultEnglishInvoiceTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          organizationId: organizationId!,
          name: 'Arabic Standard',
          description: 'Standard Arabic invoice template',
          type: InvoiceTemplateType.ARABIC,
          isDefault: false,
          fields: defaultFields,
          style: { ...defaultStyle, fontFamily: 'Amiri, serif' },
          content: defaultArabicInvoiceTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchTemplates();
    }
  }, [organizationId, fetchTemplates]);

  const handleCreateTemplate = async () => {
    if (!organizationId || !newTemplate.name.trim()) return;

    try {
      const template: InvoiceTemplate = {
        id: Date.now().toString(),
        organizationId,
        name: newTemplate.name,
        description: newTemplate.description,
        type: newTemplate.type,
        isDefault: newTemplate.isDefault,
        fields: newTemplate.fields,
        style: newTemplate.style,
        content: newTemplate.type === InvoiceTemplateType.ARABIC ? defaultArabicInvoiceTemplate : defaultEnglishInvoiceTemplate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Replace with actual Firestore save
      setTemplates([...templates, template]);
      setIsCreateDialogOpen(false);
      resetNewTemplate();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      // Replace with actual Firestore update
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Replace with actual Firestore delete
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleDuplicateTemplate = (template: InvoiceTemplate) => {
    const duplicated: InvoiceTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates([...templates, duplicated]);
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '',
      description: '',
      type: InvoiceTemplateType.ENGLISH,
      isDefault: false,
      fields: defaultFields,
      style: defaultStyle,
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Templates</h1>
          <p className="text-muted-foreground">Manage and customize your invoice templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a custom invoice template for your business needs.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="My Custom Template"
                  />
                </div>
                <div>
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select
                    value={newTemplate.type}
                     onValueChange={(value: string) =>
                       setNewTemplate({ ...newTemplate, type: value as InvoiceTemplateType })
                     }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InvoiceTemplateType.ENGLISH}>English</SelectItem>
                      <SelectItem value={InvoiceTemplateType.ARABIC}>Arabic</SelectItem>
                      <SelectItem value={InvoiceTemplateType.CUSTOM}>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="templateDescription">Description</Label>
                <Textarea
                  id="templateDescription"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description of this template..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={newTemplate.isDefault}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Set as default template</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                {template.isDefault && (
                  <Badge variant="default">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Type: <span className="font-medium capitalize">{template.type}</span></p>
                <p>Fields: <span className="font-medium">{template.fields.filter(f => f.visible).length}</span></p>
                <p>Created: <span className="font-medium">{template.createdAt.toLocaleDateString()}</span></p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewTemplate(template);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!template.isDefault && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{template.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Customize your invoice template settings and appearance.
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTemplateName">Template Name</Label>
                  <Input
                    id="editTemplateName"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editInvoiceTemplateType">Template Type</Label>
                  <Select
                    value={editingTemplate.type}
                     onValueChange={(value: string) =>
                       setEditingTemplate({ ...editingTemplate!, type: value as InvoiceTemplateType })
                     }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={InvoiceTemplateType.ENGLISH}>English</SelectItem>
                      <SelectItem value={InvoiceTemplateType.ARABIC}>Arabic</SelectItem>
                      <SelectItem value={InvoiceTemplateType.CUSTOM}>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editTemplateDescription">Description</Label>
                <Textarea
                  id="editTemplateDescription"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="editIsDefault"
                  checked={editingTemplate.isDefault}
                  onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, isDefault: checked })}
                />
                <Label htmlFor="editIsDefault">Set as default template</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of &quot;{previewTemplate?.name}&quot; template
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Preview functionality will be implemented with actual template rendering
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {previewTemplate.name}</p>
                <p><strong>Type:</strong> {previewTemplate.type}</p>
                <p><strong>Fields:</strong> {previewTemplate.fields.filter(f => f.visible).length} visible</p>
                <p><strong>Style:</strong> {previewTemplate.style.fontFamily}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TemplatesPage() {
  return <TemplatesContent />;
}