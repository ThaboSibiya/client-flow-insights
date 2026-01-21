import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ImageUploadDropzone from './ImageUploadDropzone';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp,
  User,
  Camera,
  Phone,
  Building2,
  Image,
  MapPin,
  Mail,
  Briefcase,
  Loader2,
  Pencil,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStep {
  id: string;
  label: string;
  completed: boolean;
  field: string;
  priority: 'required' | 'recommended' | 'optional';
}

interface ProfileCompletionStepProps {
  step: ProfileStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (field: string, value: string) => Promise<void>;
  currentValue?: string;
}

const FIELD_ICONS: Record<string, React.ElementType> = {
  name: User,
  first_name: User,
  last_name: User,
  avatar_url: Camera,
  phone: Phone,
  company: Building2,
  company_logo_url: Image,
  industry: Briefcase,
  company_address: MapPin,
  company_email: Mail,
  company_phone: Phone,
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  name: 'Enter your full name',
  first_name: 'Enter your first name',
  last_name: 'Enter your last name',
  phone: 'Enter your phone number',
  company: 'Enter your company name',
  industry: 'Enter your industry',
  company_address: 'Enter your business address',
  company_email: 'Enter company email',
  company_phone: 'Enter company phone',
};

const FIELD_TIPS: Record<string, string> = {
  name: 'Your name helps personalize your experience and appears on invoices.',
  avatar_url: 'A profile photo helps your team recognize you.',
  phone: 'Add a phone number for account recovery and notifications.',
  company: 'Your company name appears on all customer-facing documents.',
  company_logo_url: 'Upload your logo to brand invoices and quotes.',
  industry: 'Helps us provide relevant features and insights.',
  company_address: 'Required for professional invoices and quotes.',
  company_email: 'Business contact email for customer communications.',
  company_phone: 'Business phone number for customer support.',
};

const ProfileCompletionStep: React.FC<ProfileCompletionStepProps> = ({
  step,
  index,
  isExpanded,
  onToggle,
  onSave,
  currentValue = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);

  const Icon = FIELD_ICONS[step.field] || User;
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'required': 
        return { 
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: 'text-red-500',
          ring: 'ring-red-200'
        };
      case 'recommended': 
        return { 
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: 'text-amber-500',
          ring: 'ring-amber-200'
        };
      default: 
        return { 
          badge: 'bg-quikle-crystal text-quikle-slate border-quikle-silver/30',
          icon: 'text-quikle-slate',
          ring: 'ring-quikle-silver/30'
        };
    }
  };

  const styles = getPriorityStyles(step.priority);

  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSaving(true);
    try {
      await onSave(step.field, value.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(currentValue);
    setIsEditing(false);
  };

  const isImageField = step.field === 'avatar_url' || step.field === 'company_logo_url';

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-300 overflow-hidden",
        step.completed 
          ? "bg-green-50/50 border-green-200" 
          : "bg-white border-quikle-silver/20 hover:border-quikle-primary/30",
        isExpanded && !step.completed && `ring-2 ${styles.ring}`
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left group"
        disabled={step.completed}
      >
        <div className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
          step.completed 
            ? "bg-green-100 text-green-600" 
            : `bg-quikle-crystal/50 ${styles.icon}`
        )}>
          {step.completed ? (
            <CheckCircle2 className="h-4 w-4 animate-scale-in" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium transition-colors",
            step.completed ? "text-green-700" : "text-quikle-charcoal group-hover:text-quikle-primary"
          )}>
            {step.label}
          </p>
        </div>

        <Badge 
          variant="outline" 
          className={cn("text-[9px] px-1.5 py-0", step.completed ? "bg-green-100 text-green-700 border-green-200" : styles.badge)}
        >
          {step.completed ? 'Done' : step.priority}
        </Badge>

        {!step.completed && (
          <div className="flex-shrink-0 text-quikle-slate">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && !step.completed && (
        <div className="px-3 pb-3 pt-0 animate-fade-in">
          <div className="ml-9 space-y-3">
            {/* Tip */}
            <p className="text-xs text-quikle-slate">
              {FIELD_TIPS[step.field] || 'Complete this step to enhance your profile.'}
            </p>

            {/* Inline Edit */}
            {!isImageField && (
              <div className="space-y-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={FIELD_PLACEHOLDERS[step.field] || 'Enter value...'}
                      className="h-8 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 bg-quikle-primary hover:bg-quikle-primary/90"
                      onClick={handleSave}
                      disabled={isSaving || !value.trim()}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-quikle-primary/30 text-quikle-primary hover:bg-quikle-primary hover:text-white"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Add {step.label.replace('Add ', '').replace('Set ', '').replace('Upload ', '')}
                  </Button>
                )}
              </div>
            )}

            {/* Image upload with drag-and-drop */}
            {isImageField && (
              <ImageUploadDropzone
                field={step.field as 'avatar_url' | 'company_logo_url'}
                currentValue={currentValue}
                onUploadComplete={(url) => onSave(step.field, url)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionStep;
