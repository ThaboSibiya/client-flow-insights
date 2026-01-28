
import React from 'react';
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play, Bot, MessageSquare, Tags, FileSearch, Clock, Mail, Phone, Database, Globe, Zap, Webhook } from "lucide-react";
import { WorkflowNodeType, NodeCategory } from './types';

export const getDefaultNodeName = (type: WorkflowNodeType): string => {
  const names: Record<WorkflowNodeType, string> = {
    trigger: 'Event Trigger',
    webhook: 'Webhook',
    ai_agent: 'AI Agent',
    ai_chat: 'AI Chat',
    ai_classify: 'AI Classify',
    ai_extract: 'AI Extract',
    condition: 'If/Else Branch',
    loop: 'For Each Loop',
    delay: 'Delay',
    error_handler: 'Error Handler',
    email: 'Send Email',
    sms: 'Send SMS',
    database: 'Database Action',
    api_call: 'API Call',
    action: 'Custom Action',
    approval: 'Approval Step',
  };
  return names[type] || 'Action Step';
};

export const getDefaultCategory = (type: WorkflowNodeType): NodeCategory => {
  const categories: Record<WorkflowNodeType, NodeCategory> = {
    trigger: 'triggers',
    webhook: 'triggers',
    ai_agent: 'ai_actions',
    ai_chat: 'ai_actions',
    ai_classify: 'ai_actions',
    ai_extract: 'ai_actions',
    condition: 'logic',
    loop: 'logic',
    delay: 'logic',
    error_handler: 'logic',
    email: 'integrations',
    sms: 'integrations',
    database: 'integrations',
    api_call: 'integrations',
    action: 'actions',
    approval: 'actions',
  };
  return categories[type] || 'actions';
};

export const getNodeIcon = (type: WorkflowNodeType, size: string = 'h-4 w-4') => {
  const iconProps = { className: size };
  const icons: Record<WorkflowNodeType, React.ReactElement> = {
    trigger: <Zap {...iconProps} />,
    webhook: <Webhook {...iconProps} />,
    ai_agent: <Bot {...iconProps} />,
    ai_chat: <MessageSquare {...iconProps} />,
    ai_classify: <Tags {...iconProps} />,
    ai_extract: <FileSearch {...iconProps} />,
    condition: <GitBranch {...iconProps} />,
    loop: <RefreshCw {...iconProps} />,
    delay: <Clock {...iconProps} />,
    error_handler: <AlertTriangle {...iconProps} />,
    email: <Mail {...iconProps} />,
    sms: <Phone {...iconProps} />,
    database: <Database {...iconProps} />,
    api_call: <Globe {...iconProps} />,
    action: <Play {...iconProps} />,
    approval: <UserCheck {...iconProps} />,
  };
  return icons[type] || <Play {...iconProps} />;
};
