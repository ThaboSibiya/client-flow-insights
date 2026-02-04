import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, FileSpreadsheet, Palette, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { OnboardingMode } from '@/hooks/useOnboardingWizard';

interface MobileEntrySelectorProps {
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
    title: 'Add Customer',
    description: 'Step-by-step guided wizard',
    gradient: 'from-quikle-primary to-quikle-secondary',
    badge: 'Recommended',
  },
  {
    mode: 'bulk',
    icon: FileSpreadsheet,
    title: 'Bulk Import',
    description: 'Import from CSV or Excel',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    mode: 'template',
    icon: Palette,
    title: 'Templates',
    description: 'Create & manage templates',
    gradient: 'from-violet-500 to-purple-500',
  },
];

const MobileEntrySelector: React.FC<MobileEntrySelectorProps> = ({
  onSelectMode,
}) => {
  return (
    <div className="space-y-6 px-1">
      {/* Header */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-quikle-primary to-quikle-secondary mb-3 shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-quikle-charcoal mb-1">
          Customer Onboarding
        </h1>
        <p className="text-sm text-quikle-slate">
          How would you like to add customers?
        </p>
      </div>

      {/* Entry Options */}
      <div className="space-y-3">
        {ENTRY_OPTIONS.map((option) => {
          const Icon = option.icon;
          
          return (
            <button
              key={option.mode}
              onClick={() => onSelectMode(option.mode)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl",
                "bg-white border border-quikle-silver/30 shadow-sm",
                "active:scale-[0.98] transition-transform"
              )}
            >
              {/* Icon */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                `bg-gradient-to-br ${option.gradient}`
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-quikle-charcoal">
                    {option.title}
                  </span>
                  {option.badge && (
                    <Badge className="bg-quikle-primary/10 text-quikle-primary text-xs border-0">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-quikle-slate">
                  {option.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-quikle-silver flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Quick Info */}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-quikle-slate">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Templates available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>CSV & Excel</span>
        </div>
      </div>
    </div>
  );
};

export default MobileEntrySelector;
