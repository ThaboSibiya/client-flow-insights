import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Building2, 
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfileCompletionTracker: React.FC = () => {
  const navigate = useNavigate();
  const { 
    loading, 
    completionPercentage, 
    incompleteSteps, 
    isComplete 
  } = useProfileCompletion();

  if (loading) {
    return (
      <Card className="shadow-luxury glass-effect border-quikle-silver/20">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-quikle-silver/20 rounded w-1/2" />
            <div className="h-2 bg-quikle-silver/20 rounded" />
            <div className="space-y-2">
              <div className="h-3 bg-quikle-silver/20 rounded w-3/4" />
              <div className="h-3 bg-quikle-silver/20 rounded w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="shadow-luxury glass-effect border-quikle-silver/20 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">Profile Complete!</p>
              <p className="text-xs text-green-600">You've set up your account perfectly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'required': return 'text-red-500';
      case 'recommended': return 'text-amber-500';
      default: return 'text-quikle-slate';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'required': return 'bg-red-100 text-red-700 border-red-200';
      case 'recommended': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-quikle-crystal text-quikle-slate border-quikle-silver/30';
    }
  };

  return (
    <Card className="shadow-luxury glass-effect border-quikle-silver/20 overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 border-b border-quikle-silver/20 bg-gradient-to-r from-quikle-primary/5 to-quikle-secondary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-quikle-charcoal flex items-center gap-2">
            <User className="h-4 w-4 text-quikle-primary" />
            Complete Your Profile
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              completionPercentage >= 80 ? "bg-green-100 text-green-700" :
              completionPercentage >= 50 ? "bg-amber-100 text-amber-700" :
              "bg-red-100 text-red-700"
            )}
          >
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <Progress 
            value={completionPercentage} 
            className="h-2"
          />
          <p className="text-[10px] text-quikle-slate">
            {incompleteSteps.length} steps remaining
          </p>
        </div>

        {/* Next steps */}
        <div className="space-y-2">
          {incompleteSteps.slice(0, 3).map((step) => (
            <div 
              key={step.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-quikle-crystal/30 hover:bg-quikle-crystal/50 transition-colors cursor-pointer group"
              onClick={() => navigate('/settings')}
            >
              <Circle className={cn("h-3.5 w-3.5", getPriorityColor(step.priority))} />
              <span className="text-xs text-quikle-charcoal flex-1 group-hover:text-quikle-primary transition-colors">
                {step.label}
              </span>
              <Badge 
                variant="outline" 
                className={cn("text-[9px] px-1.5 py-0", getPriorityBadge(step.priority))}
              >
                {step.priority}
              </Badge>
            </div>
          ))}
        </div>

        {/* Complete profile button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full h-8 text-xs border-quikle-primary/30 text-quikle-primary hover:bg-quikle-primary hover:text-white transition-all"
          onClick={() => navigate('/settings')}
        >
          Complete Profile
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionTracker;
