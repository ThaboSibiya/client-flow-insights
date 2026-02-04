import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, FileSpreadsheet, Palette, ArrowRight, Sparkles } from 'lucide-react';
import { OnboardingMode } from '@/hooks/useOnboardingWizard';

interface OnboardingEntrySelectorProps {
  onSelectMode: (mode: OnboardingMode) => void;
}

interface EntryOption {
  mode: OnboardingMode;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
}

const ENTRY_OPTIONS: EntryOption[] = [
  {
    mode: 'individual',
    icon: User,
    title: 'Add Individual',
    description: 'Add a single customer with a guided step-by-step wizard',
    gradient: 'from-quikle-primary to-quikle-secondary',
    badge: 'Recommended',
  },
  {
    mode: 'bulk',
    icon: FileSpreadsheet,
    title: 'Bulk Import',
    description: 'Import multiple customers from CSV or Excel files',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    mode: 'template',
    icon: Palette,
    title: 'Manage Templates',
    description: 'Create and customize industry-specific templates',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const OnboardingEntrySelector: React.FC<OnboardingEntrySelectorProps> = ({
  onSelectMode,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-quikle-primary to-quikle-secondary mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent mb-2">
          Customer Onboarding
        </h1>
        <p className="text-quikle-slate max-w-md mx-auto">
          Choose how you'd like to add customers to your CRM
        </p>
      </div>

      {/* Entry Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {ENTRY_OPTIONS.map((option) => {
          const Icon = option.icon;
          
          return (
            <Card
              key={option.mode}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300",
                "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                "border-quikle-silver/30 bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum"
              )}
              onClick={() => onSelectMode(option.mode)}
            >
              {/* Badge */}
              {option.badge && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white border-0">
                    {option.badge}
                  </Badge>
                </div>
              )}

              <CardContent className="p-6">
                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                  `bg-gradient-to-br ${option.gradient}`
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg text-quikle-charcoal mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-quikle-slate mb-4 min-h-[40px]">
                  {option.description}
                </p>

                {/* Action */}
                <Button
                  variant="ghost"
                  className="w-full justify-between group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMode(option.mode);
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 pt-4 text-sm text-quikle-slate">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>Industry templates available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span>CSV & Excel supported</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingEntrySelector;
