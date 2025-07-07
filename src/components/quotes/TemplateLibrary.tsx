
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Search, Star, Clock, FileText, Calculator, Palette, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: 'service' | 'product' | 'consultation' | 'maintenance' | 'custom';
  preview: {
    items: Array<{
      description: string;
      quantity: number;
      rate: number;
    }>;
    taxRate: number;
    terms: string;
    notes: string;
  };
  popular?: boolean;
  recentlyUsed?: boolean;
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: QuoteTemplate) => void;
  type: 'quote' | 'invoice';
}

const TemplateLibrary = ({ onSelectTemplate, type }: TemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<QuoteTemplate | null>(null);

  const templates: QuoteTemplate[] = [
    {
      id: '1',
      name: 'Basic Service Quote',
      description: 'Standard service quote with labor and materials',
      category: 'service',
      popular: true,
      preview: {
        items: [
          { description: 'Labor (Hours)', quantity: 4, rate: 150 },
          { description: 'Materials and Parts', quantity: 1, rate: 200 },
          { description: 'Travel Expenses', quantity: 1, rate: 50 }
        ],
        taxRate: 15,
        terms: 'Payment due within 30 days of completion. Materials warranty: 12 months.',
        notes: 'Quote includes standard labor and material costs. Additional charges may apply for emergency services.'
      }
    },
    {
      id: '2',
      name: 'Product Sales Invoice',
      description: 'Invoice template for product sales with bulk pricing',
      category: 'product',
      recentlyUsed: true,
      preview: {
        items: [
          { description: 'Product A - Premium Model', quantity: 2, rate: 599 },
          { description: 'Product B - Standard Model', quantity: 5, rate: 299 },
          { description: 'Installation Service', quantity: 1, rate: 150 }
        ],
        taxRate: 15,
        terms: 'Payment terms: Net 30. Bulk discount applied for orders over R2000.',
        notes: 'All products include 24-month warranty. Installation included for orders over R1500.'
      }
    },
    {
      id: '3',
      name: 'Consultation & Advisory',
      description: 'Professional consultation services with hourly rates',
      category: 'consultation',
      preview: {
        items: [
          { description: 'Initial Consultation (2 hours)', quantity: 1, rate: 400 },
          { description: 'Technical Assessment', quantity: 1, rate: 300 },
          { description: 'Report and Recommendations', quantity: 1, rate: 250 }
        ],
        taxRate: 15,
        terms: 'Consultation fees are due upon completion. Follow-up sessions charged separately.',
        notes: 'Includes detailed technical report and implementation roadmap.'
      }
    },
    {
      id: '4',
      name: 'Maintenance Contract',
      description: 'Recurring maintenance services with monthly rates',
      category: 'maintenance',
      popular: true,
      preview: {
        items: [
          { description: 'Monthly Maintenance Fee', quantity: 12, rate: 250 },
          { description: 'Emergency Call-out (Included: 2)', quantity: 2, rate: 0 },
          { description: 'Parts and Materials (Estimate)', quantity: 1, rate: 500 }
        ],
        taxRate: 15,
        terms: 'Annual maintenance contract. Monthly payments in advance. Emergency support included.',
        notes: 'Contract includes 2 emergency call-outs per year. Additional call-outs charged separately.'
      }
    },
    {
      id: '5',
      name: 'Custom Project Quote',
      description: 'Flexible template for custom projects and bespoke solutions',
      category: 'custom',
      preview: {
        items: [
          { description: 'Project Planning and Design', quantity: 1, rate: 800 },
          { description: 'Implementation Phase 1', quantity: 1, rate: 1500 },
          { description: 'Testing and Quality Assurance', quantity: 1, rate: 600 }
        ],
        taxRate: 15,
        terms: 'Project payments: 50% upfront, 30% at milestone, 20% on completion.',
        notes: 'Timeline: 4-6 weeks. Regular progress updates provided. Change requests may affect pricing.'
      }
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates', icon: FileText },
    { value: 'service', label: 'Service', icon: Calculator },
    { value: 'product', label: 'Product', icon: Building2 },
    { value: 'consultation', label: 'Consultation', icon: Eye },
    { value: 'maintenance', label: 'Maintenance', icon: Clock },
    { value: 'custom', label: 'Custom', icon: Palette }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: QuoteTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied to your ${type}.`
    });
  };

  const calculateTemplateTotal = (template: QuoteTemplate) => {
    const subtotal = template.preview.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = (subtotal * template.preview.taxRate) / 100;
    return subtotal + tax;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-slate" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-quikle-silver"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="whitespace-nowrap"
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="border border-quikle-silver/30 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-quikle-charcoal flex items-center gap-2">
                    {template.name}
                    {template.popular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}
                    {template.recentlyUsed && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Recent
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-quikle-slate">{template.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="bg-quikle-crystal p-3 rounded-lg">
                <div className="text-sm font-medium text-quikle-charcoal mb-2">Preview:</div>
                <div className="space-y-1 text-xs text-quikle-slate">
                  {template.preview.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate pr-2">{item.description}</span>
                      <span>R{(item.quantity * item.rate).toFixed(0)}</span>
                    </div>
                  ))}
                  {template.preview.items.length > 2 && (
                    <div className="text-center text-quikle-slate/70">
                      +{template.preview.items.length - 2} more items
                    </div>
                  )}
                  <div className="border-t border-quikle-silver/20 pt-2 flex justify-between font-medium">
                    <span>Estimated Total:</span>
                    <span>R{calculateTemplateTotal(template).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{template.name} - Full Preview</DialogTitle>
                    </DialogHeader>
                    {previewTemplate && (
                      <div className="space-y-4">
                        <div className="bg-quikle-crystal p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Items:</h4>
                          <div className="space-y-2">
                            {previewTemplate.preview.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="flex-1">{item.description}</span>
                                <span className="w-16 text-center">{item.quantity}</span>
                                <span className="w-20 text-right">R{item.rate.toFixed(2)}</span>
                                <span className="w-24 text-right font-medium">
                                  R{(item.quantity * item.rate).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Terms:</h4>
                            <p className="text-sm text-quikle-slate bg-white p-3 rounded border">
                              {previewTemplate.preview.terms}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Notes:</h4>
                            <p className="text-sm text-quikle-slate bg-white p-3 rounded border">
                              {previewTemplate.preview.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  onClick={() => handleSelectTemplate(template)}
                  className="flex-1 bg-quikle-primary hover:bg-quikle-secondary"
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No templates found</h3>
          <p className="text-quikle-slate">Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
