import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';

type Currency = 'ZAR' | 'USD';

interface PlanCardProps {
  name: string;
  icon: React.ReactNode;
  priceLabel: string;
  priceAmount: number;
  currency: Currency;
  badge?: string;
  highlighted?: boolean;
  isCurrent: boolean;
  isLoading: boolean;
  features: string[];
  cta: string;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  icon,
  priceLabel,
  badge,
  highlighted,
  isCurrent,
  isLoading,
  features,
  cta,
  onSelect,
}) => {
  return (
    <Card
      className={`relative flex flex-col transition-all duration-300 ${
        highlighted
          ? 'border-quikle-primary/40 shadow-luxury ring-1 ring-quikle-primary/20 scale-[1.02]'
          : ''
      } ${isCurrent ? 'border-green-400/50 ring-1 ring-green-400/30' : ''}`}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
        {badge && (
          <Badge className="bg-quikle-primary text-white shadow-md text-xs px-3">
            {badge}
          </Badge>
        )}
        {isCurrent && (
          <Badge className="bg-green-600 text-white shadow-md text-xs px-3">
            Current Plan
          </Badge>
        )}
      </div>

      <CardHeader className="text-center pt-8 pb-4 border-b-0">
        <div className="mx-auto mb-2 p-2.5 rounded-xl bg-quikle-platinum text-quikle-primary w-fit">
          {icon}
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        <div className="mt-3">
          <span className="text-3xl font-bold text-quikle-charcoal">{priceLabel}</span>
          <span className="text-sm text-quikle-slate/70">/mo</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-4">
        <ul className="space-y-2.5 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                  i < 5 ? 'text-green-500' : 'text-quikle-slate/50'
                }`}
              />
              <span className={i < 5 ? 'font-medium text-quikle-charcoal' : 'text-quikle-slate'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full mt-6"
          variant={isCurrent ? 'outline' : highlighted ? 'default' : 'secondary'}
          disabled={isCurrent || isLoading}
          onClick={onSelect}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : isCurrent ? (
            'Current Plan'
          ) : (
            cta
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
