// Pipeline-specific type definitions for improved TypeScript safety

import { Customer, CustomerTicket } from './customer';

// Base pipeline interfaces
export interface PipelineItem {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer-specific pipeline item (uses Customer directly)
export type CustomerPipelineItem = Customer;

// Ticket-specific pipeline item (uses CustomerTicket directly)  
export type TicketPipelineItem = CustomerTicket;

// Pipeline stage interfaces
export interface BasePipelineStage {
  id: string;
  name: string;
  color: string;
  automationEnabled: boolean;
  target?: number;
}

export interface CustomerPipelineStage extends BasePipelineStage {
  customers: CustomerPipelineItem[];
}

export interface TicketPipelineStage extends BasePipelineStage {
  tickets: TicketPipelineItem[];
}

// Union type for pipeline stages
export type PipelineStage = CustomerPipelineStage | TicketPipelineStage;

// Pipeline hook return types
export interface PipelineHookReturn<T extends BasePipelineStage> {
  stages: T[];
  isAddStageOpen: boolean;
  setIsAddStageOpen: (open: boolean) => void;
  activeItem: CustomerPipelineItem | TicketPipelineItem | null;
  handleDragStart: (event: import('@dnd-kit/core').DragStartEvent) => void;
  handleDragEnd: (event: import('@dnd-kit/core').DragEndEvent) => void;
  addStage: (stageName: string, color: string) => void;
  handleStageEdit: (stageId: string, name: string, color: string) => void;
  handleStageDelete: (stageId: string) => void;
  handleSetTarget: (stageId: string, target: number | undefined) => void;
  handleSetAutomation: (stageId: string, automationEnabled: boolean) => void;
}

export interface CustomerPipelineHookReturn extends PipelineHookReturn<CustomerPipelineStage> {
  activeItem: CustomerPipelineItem | null;
  handleCustomerMove: (customerId: string, fromStageId: string, toStageId: string) => void;
  handleAddCustomer: (stageId: string) => void;
}

export interface TicketPipelineHookReturn extends PipelineHookReturn<TicketPipelineStage> {
  activeItem: TicketPipelineItem | null;
  handleTicketMove: (ticketId: string, fromStageId: string, toStageId: string) => void;
  handleAddTicket: (stageId: string) => void;
}

// Component prop interfaces
export interface PipelineCardProps {
  item: CustomerPipelineItem | TicketPipelineItem;
  type: 'customer' | 'ticket';
  stageId: string;
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onEdit?: (item: CustomerPipelineItem | TicketPipelineItem) => void;
  onDelete?: (item: CustomerPipelineItem | TicketPipelineItem) => void;
  onView?: (item: CustomerPipelineItem | TicketPipelineItem) => void;
}

export interface PipelineStageProps {
  stage: CustomerPipelineStage | TicketPipelineStage;
  onCustomerMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onStageEdit: (stageId: string, name: string, color: string) => void;
  onStageDelete: (stageId: string) => void;
  onAddItem: (stageId: string) => void;
  onSetTarget: (stageId: string, target: number | undefined) => void;
  onSetAutomation: (stageId: string, automationEnabled: boolean) => void;
  type: 'customer' | 'ticket';
}

export interface PipelineMetricsProps {
  type: 'customer' | 'ticket';
  stages: (CustomerPipelineStage | TicketPipelineStage)[];
}

// Automation interfaces
export interface AutomationAction {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  enabled: boolean;
}

export interface AutomationConditionGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: AutomationCondition[];
}

export interface AutomationCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
}

export interface AutomationData {
  automationName: string;
  automationType: 'customer' | 'ticket';
  triggerType: 'simple' | 'advanced';
  simpleTrigger: string;
  conditionGroups: AutomationConditionGroup[];
  actions: AutomationAction[];
  workflow?: {
    nodes: any[];
    edges: any[];
  };
}

// Priority and status enums
export type PipelinePriority = 'low' | 'medium' | 'high' | 'urgent';
export type PipelineStatus = 'active' | 'inactive' | 'archived';

// Event handlers
export type PipelineEventHandler<T = void> = () => T;
export type PipelineEventHandlerWithParam<P, T = void> = (param: P) => T;

// Error handling
export interface PipelineError {
  code: string;
  message: string;
  context?: Record<string, any>;
}

export interface PipelineValidationResult {
  isValid: boolean;
  errors: PipelineError[];
}