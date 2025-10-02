import React from 'react';
import { maskEmail, maskPhone, shouldMaskPII } from '@/utils/piiMaskingUtils';
import { usePIIAccessLogger } from '@/hooks/usePIIAccessLogger';
import { useSecurePrivileges } from '@/hooks/useSecurePrivileges';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MaskedPIIDisplayProps {
  value: string;
  type: 'email' | 'phone';
  resourceType: 'customer' | 'employee';
  resourceId: string;
  className?: string;
  allowUnmask?: boolean;
}

/**
 * Component that automatically masks PII based on user privileges
 * and logs when PII is accessed
 */
const MaskedPIIDisplay: React.FC<MaskedPIIDisplayProps> = ({
  value,
  type,
  resourceType,
  resourceId,
  className = '',
  allowUnmask = true
}) => {
  const { hasPrivilege } = useSecurePrivileges();
  const { logPIIAccess } = usePIIAccessLogger();
  const [isUnmasked, setIsUnmasked] = React.useState(false);

  const canAccessPII = hasPrivilege('can_access_customer_pii');
  const shouldMask = shouldMaskPII(canAccessPII);

  const handleUnmask = React.useCallback(() => {
    if (!isUnmasked) {
      // Log PII access
      logPIIAccess(resourceType, resourceId, [type], 'view');
    }
    setIsUnmasked(!isUnmasked);
  }, [isUnmasked, logPIIAccess, resourceType, resourceId, type]);

  const displayValue = React.useMemo(() => {
    if (!shouldMask || isUnmasked) return value;
    return type === 'email' ? maskEmail(value) : maskPhone(value);
  }, [shouldMask, isUnmasked, value, type]);

  if (!shouldMask) {
    return <span className={className}>{value}</span>;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className={className}>{displayValue}</span>
      {allowUnmask && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleUnmask}
              >
                {isUnmasked ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isUnmasked ? 'Hide' : 'Show'} full {type}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default MaskedPIIDisplay;
