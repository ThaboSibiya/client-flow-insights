
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
  const trigger = triggerType === 'simple' ? simpleTrigger : { type: 'advanced', conditionGroups };

  return (
    <AutomationPreview
      automationName={automationName}
      automationType={automationType}
      triggerType={triggerType}
      trigger={trigger}
      actions={actions}
      conditionGroups={conditionGroups}
      simpleTrigger={simpleTrigger}
    />
  );
};

export default AutomationPreviewTab;
