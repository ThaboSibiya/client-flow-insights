
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Shield } from 'lucide-react';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  requiredPrivilege?: string;
}

interface SettingsSearchProps {
  query: string;
  categories: SettingsCategory[];
  onCategorySelect: (categoryId: string) => void;
}

const SettingsSearch = ({ query, categories, onCategorySelect }: SettingsSearchProps) => {
  if (!query || categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-quikle-slate">No settings found matching your search.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-quikle-charcoal">
        Search Results for "{query}"
      </h3>
      
      <div className="grid gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-quikle-primary" />
                    <div>
                      <h4 className="font-medium text-quikle-charcoal">{category.label}</h4>
                      <p className="text-sm text-quikle-slate">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {category.requiredPrivilege && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-quikle-slate" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsSearch;
