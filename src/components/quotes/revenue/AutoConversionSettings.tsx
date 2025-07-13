
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Percent,
  Settings,
  Zap,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AutoConversionSettings = () => {
  const [settings, setSettings] = useState({
    enableAutoConversion: false,
    conversionThreshold: 75,
    priceOptimization: true,
    dynamicPricing: false,
    competitorTracking: false,
    seasonalAdjustments: false,
    minimumMargin: 20,
    maximumDiscount: 15,
    priceStrategy: 'competitive',
    autoApprovalLimit: 5000
  });

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSliderChange = (key: string, value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your auto-conversion settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto Conversion Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Auto Conversion Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-quikle-crystal rounded-lg">
              <TrendingUp className="h-8 w-8 text-quikle-primary mx-auto mb-2" />
              <h3 className="font-semibold">Current Rate</h3>
              <p className="text-2xl font-bold text-quikle-charcoal">68%</p>
            </div>
            <div className="text-center p-4 bg-quikle-crystal rounded-lg">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Avg. Value</h3>
              <p className="text-2xl font-bold text-quikle-charcoal">$2,150</p>
            </div>
            <div className="text-center p-4 bg-quikle-crystal rounded-lg">
              <Percent className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Margin</h3>
              <p className="text-2xl font-bold text-quikle-charcoal">24%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto Conversion Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto Conversion Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-auto-conversion">Enable Auto Conversion</Label>
              <p className="text-sm text-quikle-slate">Automatically convert quotes to invoices based on rules</p>
            </div>
            <Switch
              id="enable-auto-conversion"
              checked={settings.enableAutoConversion}
              onCheckedChange={(checked) => handleToggle('enableAutoConversion', checked)}
            />
          </div>

          {settings.enableAutoConversion && (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Conversion Threshold: {settings.conversionThreshold}%</Label>
                  <p className="text-sm text-quikle-slate mb-2">Minimum confidence score to auto-convert</p>
                  <Slider
                    value={[settings.conversionThreshold]}
                    onValueChange={(value) => handleSliderChange('conversionThreshold', value)}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="auto-approval-limit">Auto-approval Limit ($)</Label>
                  <Input
                    id="auto-approval-limit"
                    type="number"
                    value={settings.autoApprovalLimit}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoApprovalLimit: parseInt(e.target.value) }))}
                    min="0"
                  />
                  <p className="text-sm text-quikle-slate mt-1">Maximum amount for automatic approval</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important Notice</h4>
                    <p className="text-sm text-yellow-700">
                      Auto-conversion will only trigger for quotes that meet all specified criteria. 
                      Manual review is recommended for high-value transactions.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Price Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="price-optimization">Enable Price Optimization</Label>
              <p className="text-sm text-quikle-slate">AI-powered pricing suggestions</p>
            </div>
            <Switch
              id="price-optimization"
              checked={settings.priceOptimization}
              onCheckedChange={(checked) => handleToggle('priceOptimization', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dynamic-pricing">Dynamic Pricing</Label>
              <p className="text-sm text-quikle-slate">Adjust prices based on demand and competition</p>
            </div>
            <Switch
              id="dynamic-pricing"
              checked={settings.dynamicPricing}
              onCheckedChange={(checked) => handleToggle('dynamicPricing', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Minimum Margin: {settings.minimumMargin}%</Label>
              <Slider
                value={[settings.minimumMargin]}
                onValueChange={(value) => handleSliderChange('minimumMargin', value)}
                max={50}
                min={5}
                step={1}
                className="w-full mt-2"
              />
            </div>
            <div>
              <Label>Maximum Discount: {settings.maximumDiscount}%</Label>
              <Slider
                value={[settings.maximumDiscount]}
                onValueChange={(value) => handleSliderChange('maximumDiscount', value)}
                max={30}
                min={0}
                step={1}
                className="w-full mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price-strategy">Pricing Strategy</Label>
            <Select value={settings.priceStrategy} onValueChange={(value) => setSettings(prev => ({ ...prev, priceStrategy: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="competitive">Competitive</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="value">Value-based</SelectItem>
                <SelectItem value="cost-plus">Cost Plus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="competitor-tracking">Competitor Price Tracking</Label>
              <p className="text-sm text-quikle-slate">Monitor competitor pricing automatically</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Pro Feature</Badge>
              <Switch
                id="competitor-tracking"
                checked={settings.competitorTracking}
                onCheckedChange={(checked) => handleToggle('competitorTracking', checked)}
                disabled
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="seasonal-adjustments">Seasonal Price Adjustments</Label>
              <p className="text-sm text-quikle-slate">Automatic pricing adjustments based on seasons</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Pro Feature</Badge>
              <Switch
                id="seasonal-adjustments"
                checked={settings.seasonalAdjustments}
                onCheckedChange={(checked) => handleToggle('seasonalAdjustments', checked)}
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-quikle-primary hover:bg-quikle-secondary">
          <Settings className="h-4 w-4 mr-2" />
          Save Revenue Settings
        </Button>
      </div>
    </div>
  );
};

export default AutoConversionSettings;
