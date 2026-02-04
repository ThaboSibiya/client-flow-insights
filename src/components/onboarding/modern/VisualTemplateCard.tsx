import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate } from '@/types/templates';
import { 
  Building2, 
  Printer, 
  Shield, 
  Home, 
  Car, 
  Monitor,
  Briefcase,
  Heart,
  Utensils,
  GraduationCap,
  Check
} from 'lucide-react';

interface VisualTemplateCardProps {
  template: IndustryTemplate;
  isSelected: boolean;
  onClick: () => void;
  fieldsCount?: number;
}

const INDUSTRY_CONFIG: Record<string, { 
  icon: React.ElementType; 
  gradient: string;
  bgPattern: string;
}> = {
  printer_services: { 
    icon: Printer, 
    gradient: 'from-blue-500 to-cyan-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 to-cyan-50'
  },
  printer_service: { 
    icon: Printer, 
    gradient: 'from-blue-500 to-cyan-500',
    bgPattern: 'bg-gradient-to-br from-blue-50 to-cyan-50'
  },
  insurance: { 
    icon: Shield, 
    gradient: 'from-emerald-500 to-teal-500',
    bgPattern: 'bg-gradient-to-br from-emerald-50 to-teal-50'
  },
  real_estate: { 
    icon: Home, 
    gradient: 'from-orange-500 to-amber-500',
    bgPattern: 'bg-gradient-to-br from-orange-50 to-amber-50'
  },
  automotive: { 
    icon: Car, 
    gradient: 'from-red-500 to-rose-500',
    bgPattern: 'bg-gradient-to-br from-red-50 to-rose-50'
  },
  it_services: { 
    icon: Monitor, 
    gradient: 'from-violet-500 to-purple-500',
    bgPattern: 'bg-gradient-to-br from-violet-50 to-purple-50'
  },
  general_business: { 
    icon: Briefcase, 
    gradient: 'from-slate-500 to-gray-500',
    bgPattern: 'bg-gradient-to-br from-slate-50 to-gray-50'
  },
  healthcare: { 
    icon: Heart, 
    gradient: 'from-pink-500 to-rose-500',
    bgPattern: 'bg-gradient-to-br from-pink-50 to-rose-50'
  },
  hospitality: { 
    icon: Utensils, 
    gradient: 'from-yellow-500 to-orange-500',
    bgPattern: 'bg-gradient-to-br from-yellow-50 to-orange-50'
  },
  education: { 
    icon: GraduationCap, 
    gradient: 'from-indigo-500 to-blue-500',
    bgPattern: 'bg-gradient-to-br from-indigo-50 to-blue-50'
  },
};

const DEFAULT_CONFIG = {
  icon: Building2,
  gradient: 'from-quikle-primary to-quikle-secondary',
  bgPattern: 'bg-gradient-to-br from-quikle-crystal to-quikle-platinum'
};

const VisualTemplateCard: React.FC<VisualTemplateCardProps> = ({
  template,
  isSelected,
  onClick,
  fieldsCount = 0,
}) => {
  const config = INDUSTRY_CONFIG[template.industry] || DEFAULT_CONFIG;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        isSelected 
          ? "border-quikle-primary shadow-lg ring-2 ring-quikle-primary/20" 
          : "border-transparent hover:border-quikle-silver/50",
        config.bgPattern
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-quikle-primary flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
        `bg-gradient-to-br ${config.gradient}`
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-quikle-charcoal mb-1 line-clamp-1">
        {template.name}
      </h3>
      
      <p className="text-sm text-quikle-slate mb-3 line-clamp-2 min-h-[40px]">
        {template.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className={cn(
            "text-xs",
            isSelected ? "bg-quikle-primary/10 text-quikle-primary" : "bg-white/60"
          )}
        >
          {fieldsCount || template.version || 0} fields
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {template.industry.replace(/_/g, ' ')}
        </Badge>
      </div>
    </button>
  );
};

export default VisualTemplateCard;
