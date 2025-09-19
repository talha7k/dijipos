'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanyInfoTabProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  companyNameAr: string;
  setCompanyNameAr: (value: string) => void;
  companyEmail: string;
  setCompanyEmail: (value: string) => void;
  companyAddress: string;
  setCompanyAddress: (value: string) => void;
  companyPhone: string;
  setCompanyPhone: (value: string) => void;
  vatNumber: string;
  setVatNumber: (value: string) => void;
  handleSaveCompanyInfo: () => void;
  saving: boolean;
}

export function CompanyInfoTab({
  companyName,
  setCompanyName,
  companyNameAr,
  setCompanyNameAr,
  companyEmail,
  setCompanyEmail,
  companyAddress,
  setCompanyAddress,
  companyPhone,
  setCompanyPhone,
  vatNumber,
  setVatNumber,
  handleSaveCompanyInfo,
  saving,
}: CompanyInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name (English)</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name in English"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
            <Input
              id="companyNameAr"
              value={companyNameAr}
              onChange={(e) => setCompanyNameAr(e.target.value)}
              placeholder="Enter company name in Arabic"
              dir="rtl"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="Enter company email"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Phone Number</Label>
            <Input
              id="companyPhone"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Input
              id="companyAddress"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Enter company address"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input
              id="vatNumber"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="Enter VAT number"
              className="w-full"
            />
          </div>
        </div>

        <Button onClick={handleSaveCompanyInfo} loading={saving}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}