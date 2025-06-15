
import React from 'react';
import AutomationPreview from '../AutomationPreview';

interface AutomationPreviewTabProps {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  simpleTrigger: string;
  conditionGroups: any[];
  actions: any[];
}

const AutomationPreviewTab = ({
  automationName,
  automationType,
  triggerType,
  simpleTrigger,
  conditionGroups,
  actions
}: AutomationPreviewTabProps) => {

  return (
    <AutomationPreview
      automationName={automationName}
      automationType={automationType}
      triggerType={triggerType}
      actions={actions}
      conditionGroups={conditionGroups}
      simpleTrigger={simpleTrigger}
    />
  );
};

export default AutomationPreviewTab;
