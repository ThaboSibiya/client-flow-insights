
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, Settings, Save, Building, FileText, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCompanyProfile } from '@/hooks/useCompanyProfile';

const QuoteSettings = () => {
  const { profile, loading, isLoading, updateCompanyProfile, updateCompanyLogo } = useCompanyProfile();
  const [formData, setFormData] = useState({
    company: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    default_terms: '',
    default_notes: '',
    auto_numbering: true,
    include_logo: true,
    tax_rate: 0,
    currency: 'USD'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company: profile.company || '',
        company_address: profile.company_address || '',
        company_phone: profile.company_phone || '',
        company_email: profile.company_email || '',
        default_terms: '',
        default_notes: '',
        auto_numbering: true,
        include_logo: true,
        tax_rate: 0,
        currency: 'USD'
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateCompanyProfile({
        company: formData.company,
        company_address: formData.company_address,
        company_phone: formData.company_phone,
        company_email: formData.company_email
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // In a real implementation, you would upload to Supabase storage
      // For now, we'll simulate the process
      toast({
        title: "Logo Upload",
        description: "Logo upload functionality coming soon.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary mx-auto"></div>
          <p className="mt-2 text-quikle-slate">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-quikle-primary" />
        <h1 className="text-2xl font-bold text-quikle-charcoal">Quote & Invoice Settings</h1>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <Label htmlFor="company_email">Company Email</Label>
              <Input
                id="company_email"
                type="email"
                value={formData.company_email}
                onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                placeholder="contact@company.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_phone">Company Phone</Label>
              <Input
                id="company_phone"
                value={formData.company_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, company_phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company_address">Company Address</Label>
            <Textarea
              id="company_address"
              value={formData.company_address}
              onChange={(e) => setFormData(prev => ({ ...prev, company_address: e.target.value }))}
              placeholder="123 Business Street, City, State 12345"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Company Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="include_logo"
                checked={formData.include_logo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_logo: checked }))}
              />
              <Label htmlFor="include_logo">Include logo in quotes and invoices</Label>
            </div>
          </div>
          
          {formData.include_logo && (
            <div className="border-2 border-dashed border-quikle-silver rounded-lg p-6 text-center">
              {profile?.company_logo_url ? (
                <div className="space-y-4">
                  <img 
                    src={profile.company_logo_url} 
                    alt="Company Logo" 
                    className="max-h-24 mx-auto"
                  />
                  <p className="text-sm text-quikle-slate">Current logo</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-quikle-slate mx-auto" />
                  <p className="text-quikle-slate">No logo uploaded</p>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" className="mt-4">
                  {profile?.company_logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Default Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="default_terms">Default Terms & Conditions</Label>
            <Textarea
              id="default_terms"
              value={formData.default_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, default_terms: e.target.value }))}
              rows={4}
              placeholder="Enter your standard terms and conditions..."
            />
          </div>
          
          <div>
            <Label htmlFor="default_notes">Default Notes</Label>
            <Textarea
              id="default_notes"
              value={formData.default_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, default_notes: e.target.value }))}
              rows={3}
              placeholder="Enter default notes for quotes and invoices..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Numbering & Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Numbering & Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-generate numbers</Label>
              <p className="text-sm text-quikle-slate">Automatically generate quote and invoice numbers</p>
            </div>
            <Switch
              checked={formData.auto_numbering}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_numbering: checked }))}
            />
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              step="0.01"
              value={formData.tax_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-quikle-primary hover:bg-quikle-secondary"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default QuoteSettings;
