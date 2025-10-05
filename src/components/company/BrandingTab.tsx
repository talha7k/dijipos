'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { updateOrganizationBranding } from '@/lib/firebase/firestore/organizations';
import { toast } from 'sonner';

interface BrandingTabProps {
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  stampUrl: string;
  setStampUrl: (value: string) => void;
  handleRemoveLogo: () => void;
  handleRemoveStamp: () => void;
  organizationId?: string;
}

export function BrandingTab({
  logoUrl,
  setLogoUrl,
  stampUrl,
  setStampUrl,
  handleRemoveLogo,
  handleRemoveStamp,
  organizationId,
}: BrandingTabProps) {
  const handleLogoChange = async (url: string | null) => {
    const newLogoUrl = url || '';
    setLogoUrl(newLogoUrl);

    if (organizationId) {
      try {
        await updateOrganizationBranding(organizationId, newLogoUrl, stampUrl);
        toast.success('Logo updated successfully!');
      } catch (error) {
        console.error('Error updating logo:', error);
        toast.error('Failed to update logo.');
        // Revert local state on error
        setLogoUrl(logoUrl);
      }
    }
  };

  const handleStampChange = async (url: string | null) => {
    const newStampUrl = url || '';
    setStampUrl(newStampUrl);

    if (organizationId) {
      try {
        await updateOrganizationBranding(organizationId, logoUrl, newStampUrl);
        toast.success('Stamp updated successfully!');
      } catch (error) {
        console.error('Error updating stamp:', error);
        toast.error('Failed to update stamp.');
        // Revert local state on error
        setStampUrl(stampUrl);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Company Logo</Label>
            <div className="flex flex-col items-center space-y-4">
              {logoUrl ? (
                <div className="relative">
                  <Image
                    src={logoUrl}
                    alt="Company Logo"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-contain border rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Logo</span>
                </div>
              )}
              <ImageUpload
                value={logoUrl}
                onChange={handleLogoChange}
                path={`organizations/${organizationId}`}
                placeholder="Upload company logo"
                maxSize={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Company Stamp</Label>
            <div className="flex flex-col items-center space-y-4">
              {stampUrl ? (
                <div className="relative">
                  <Image
                    src={stampUrl}
                    alt="Company Stamp"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-contain border rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={handleRemoveStamp}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Stamp</span>
                </div>
              )}
              <ImageUpload
                value={stampUrl}
                onChange={handleStampChange}
                path={`organizations/${organizationId}`}
                placeholder="Upload company stamp"
                maxSize={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}