import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  threshold: number;
  icon: React.ElementType;
  title: string;
  color: string;
  bgColor: string;
}

const MILESTONES: Milestone[] = [
  { threshold: 25, icon: Star, title: 'Getting Started', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { threshold: 50, icon: Sparkles, title: 'Half Way!', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { threshold: 75, icon: Award, title: 'Almost There!', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { threshold: 100, icon: Crown, title: 'Profile Master!', color: 'text-green-600', bgColor: 'bg-green-100' },
];

interface ProfileCompletionMilestoneProps {
  percentage: number;
  showAnimation?: boolean;
}

const ProfileCompletionMilestone: React.FC<ProfileCompletionMilestoneProps> = ({ 
  percentage,
  showAnimation = false 
}) => {
  const currentMilestone = MILESTONES.filter(m => percentage >= m.threshold).pop();
  const nextMilestone = MILESTONES.find(m => percentage < m.threshold);

  if (!currentMilestone && !nextMilestone) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Milestone badges */}
      <div className="flex -space-x-1">
        {MILESTONES.map((milestone, index) => {
          const isAchieved = percentage >= milestone.threshold;
          const Icon = milestone.icon;
          
          return (
            <div
              key={milestone.threshold}
              className={cn(
                "relative w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-all duration-500",
                isAchieved ? milestone.bgColor : "bg-quikle-crystal",
                isAchieved && showAnimation && "animate-bounce",
                !isAchieved && "opacity-40"
              )}
              style={{ 
                zIndex: MILESTONES.length - index,
                animationDelay: `${index * 100}ms`
              }}
            >
              <Icon className={cn(
                "h-3 w-3",
                isAchieved ? milestone.color : "text-quikle-slate"
              )} />
            </div>
          );
        })}
      </div>

      {/* Current achievement */}
      {currentMilestone && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] font-medium transition-all",
            currentMilestone.bgColor,
            currentMilestone.color,
            "border-transparent"
          )}
        >
          {currentMilestone.title}
        </Badge>
      )}

      {/* Next milestone hint */}
      {nextMilestone && percentage > 0 && (
        <span className="text-[10px] text-quikle-slate hidden sm:inline">
          {nextMilestone.threshold - percentage}% to {nextMilestone.title}
        </span>
      )}
    </div>
  );
};

export default ProfileCompletionMilestone;
