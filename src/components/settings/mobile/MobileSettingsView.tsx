
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Search, Shield, ArrowLeft } from 'lucide-react';
import SettingsImportExport from '../SettingsImportExport';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  requiredPrivilege?: string;
  description: string;
}

interface MobileSettingsViewProps {
  categories: SettingsCategory[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const MobileSettingsView = ({ categories, searchQuery, onSearchChange }: MobileSettingsViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  if (selectedCategory && selectedCategoryData) {
    const Component = selectedCategoryData.component;
    
    return (
      <div className="space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-quikle-silver/20">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <selectedCategoryData.icon className="h-5 w-5 text-quikle-primary" />
            <h1 className="text-lg font-semibold text-quikle-charcoal">
              {selectedCategoryData.label}
            </h1>
            {selectedCategoryData.requiredPrivilege && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Settings Component */}
        <Card>
          <CardContent className="p-4">
            <Component />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main mobile settings list
  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-bold text-quikle-charcoal">Settings</h1>
            <p className="text-quikle-slate text-sm">Manage your preferences</p>
          </div>
          <SettingsImportExport />
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Settings Categories */}
      <div className="space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isHighlighted = searchQuery && (
            category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all ${isHighlighted ? 'ring-2 ring-quikle-primary/20 bg-quikle-crystal/30' : 'hover:shadow-md'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-quikle-crystal">
                      <Icon className="h-5 w-5 text-quikle-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-quikle-charcoal truncate">
                          {category.label}
                        </h3>
                        {category.requiredPrivilege && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-quikle-slate mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-quikle-slate flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {searchQuery && categories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No Results Found</h3>
            <p className="text-quikle-slate">Try searching with different keywords</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileSettingsView;
