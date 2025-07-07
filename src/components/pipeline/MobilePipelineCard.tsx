
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Mail, Phone, AlertCircle, ChevronRight } from "lucide-react";
import { format } from 'date-fns';
import StageSelectionModal from './StageSelectionModal';

interface MobilePipelineCardProps {
  item: any;
  type: 'customer' | 'ticket';
  stageId: string;
  stages: any[];
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
}

const MobilePipelineCard = ({ 
  item, 
  type, 
  stageId, 
  stages,
  onMove, 
  onEdit, 
  onView 
}: MobilePipelineCardProps) => {
  const [showStageModal, setShowStageModal] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-quikle-accent';
      case 'low': return 'bg-quikle-success';
      default: return 'bg-quikle-neutral';
    }
  };

  const handleStageMove = (newStageId: string) => {
    onMove(item.id, stageId, newStageId);
    setShowStageModal(false);
  };

  const currentStage = stages.find(s => s.id === stageId);

  if (type === 'customer') {
    return (
      <>
        <Card className="mb-3 border-quikle-silver/30 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-quikle-crystal text-quikle-primary text-sm">
                    {item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-quikle-charcoal truncate">{item.name}</p>
                  <div className="flex items-center gap-1 text-xs text-quikle-slate">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{item.email}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStageModal(true)}
                className="shrink-0 text-quikle-slate hover:text-quikle-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-quikle-slate">
                  <Phone className="h-3 w-3" />
                  <span>{item.phone}</span>
                </div>
                <Badge variant="outline" className="text-xs border-quikle-silver/50 text-quikle-slate">
                  {item.ticketCount || 0} tickets
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-quikle-slate">
                <span>Added {format(new Date(item.createdAt), 'MMM dd')}</span>
                {item.lastContact && (
                  <span>Last contact: {format(new Date(item.lastContact), 'MMM dd')}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-quikle-crystal text-quikle-primary"
                  style={{ backgroundColor: `${currentStage?.color}20`, color: currentStage?.color }}
                >
                  {currentStage?.name}
                </Badge>
                <div className="flex gap-1">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(item)}
                      className="text-xs h-7 px-2"
                    >
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="text-xs h-7 px-2"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StageSelectionModal
          open={showStageModal}
          onOpenChange={setShowStageModal}
          currentStageId={stageId}
          stages={stages}
          itemName={item.name}
          onMoveToStage={handleStageMove}
        />
      </>
    );
  }

  return (
    <>
      <Card className="mb-3 border-quikle-silver/30 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm truncate text-quikle-charcoal">{item.subject}</p>
                <div className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(item.priority)}`} />
              </div>
              <p className="text-xs text-quikle-slate">
                #{item.ticketNumber}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStageModal(true)}
              className="shrink-0 text-quikle-slate hover:text-quikle-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-quikle-silver/50 text-quikle-slate">
                {item.priority}
              </Badge>
              {item.assignedTo && (
                <Badge variant="secondary" className="text-xs bg-quikle-crystal text-quikle-primary">
                  {item.assignedTo.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-quikle-slate">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.round((item.totalTimeSpent || 0) / 60)}h</span>
              </div>
              <span>{format(new Date(item.createdAt), 'MMM dd')}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="secondary" 
                className="text-xs bg-quikle-crystal text-quikle-primary"
                style={{ backgroundColor: `${currentStage?.color}20`, color: currentStage?.color }}
              >
                {currentStage?.name}
              </Badge>
              <div className="flex gap-1">
                {onView && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(item)}
                    className="text-xs h-7 px-2"
                  >
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                    className="text-xs h-7 px-2"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StageSelectionModal
        open={showStageModal}
        onOpenChange={setShowStageModal}
        currentStageId={stageId}
        stages={stages}
        itemName={item.subject || item.ticketNumber}
        onMoveToStage={handleStageMove}
      />
    </>
  );
};

export default MobilePipelineCard;
