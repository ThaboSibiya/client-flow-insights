
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { Building2, Shield, Heart, Scale, DollarSign, Printer, Search, Eye, Download, Star } from 'lucide-react';

const TemplateLibrary = () => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const industryIcons = {
    real_estate: Building2,
    insurance: Shield,
    healthcare: Heart,
    legal: Scale,
    finance: DollarSign,
    printer_service: Printer
  };

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'legal', label: 'Legal' },
    { value: 'finance', label: 'Finance' },
    { value: 'printer_service', label: 'Printer Service' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await CustomDataService.getIndustryTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const previewTemplate = async (template: IndustryTemplate) => {
    try {
      const fields = await CustomDataService.getTemplateFields(template.id);
      toast({
        title: "Template Preview",
        description: `This template contains ${fields.length} fields`,
      });
    } catch (error) {
      console.error('Error previewing template:', error);
      toast({
        title: "Error",
        description: "Failed to preview template",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse">Loading template library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-slate" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {industries.map(industry => (
                <Button
                  key={industry.value}
                  variant={selectedIndustry === industry.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIndustry(industry.value)}
                  className="whitespace-nowrap"
                >
                  {industry.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => {
              const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
              
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-quikle-primary" />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {template.industry.replace('_', ' ')}
                          </Badge>
                          {template.is_active && (
                            <Badge variant="default" className="bg-green-600">
                              <Star className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-quikle-slate/70 mb-4">
                      {template.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewTemplate(template)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No templates found</h3>
              <p className="text-quikle-slate">Try adjusting your search terms or industry filter.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateLibrary;
