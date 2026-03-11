import { useCallback, useEffect, useState, useMemo } from 'react';
import { useCompanySetting } from '@/hooks/useCompanySettings';

// ── Type definitions ──────────────────────────────────────────────────────────

export interface StaleLeadConfig {
  enabled: boolean;
  staleDays: number;
  staleAction: 'flag' | 'notify' | 'move';
  notifyOwner: boolean;
  autoReassign: boolean;
}

export interface LeadRoutingConfig {
  autoAssign: boolean;
  routingMethod: 'round-robin' | 'load-balanced' | 'manual';
  maxLeadsPerEmployee: number;
  assignBySource: boolean;
}

export interface StageAutomationConfig {
  entryNotification: boolean;
  exitNotification: boolean;
  autoTaskCreation: boolean;
  autoFollowUp: boolean;
  followUpDays: number;
  followUpChannel: 'email' | 'sms';
}

export interface WinLossConfig {
  requireLossReason: boolean;
  trackRevenue: boolean;
  showWinProbability: boolean;
  lossReasons: string[];
}

export interface DisplayConfig {
  defaultView: 'kanban' | 'list' | 'table';
  showMetrics: boolean;
  compactCards: boolean;
  showCardSource: boolean;
  showCardValue: boolean;
  showStageCount: boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const STALE_LEAD_DEFAULTS: StaleLeadConfig = {
  enabled: true,
  staleDays: 7,
  staleAction: 'flag',
  notifyOwner: true,
  autoReassign: false,
};

export const LEAD_ROUTING_DEFAULTS: LeadRoutingConfig = {
  autoAssign: false,
  routingMethod: 'round-robin',
  maxLeadsPerEmployee: 50,
  assignBySource: false,
};

export const STAGE_AUTOMATION_DEFAULTS: StageAutomationConfig = {
  entryNotification: true,
  exitNotification: false,
  autoTaskCreation: false,
  autoFollowUp: false,
  followUpDays: 3,
  followUpChannel: 'email',
};

export const WIN_LOSS_DEFAULTS: WinLossConfig = {
  requireLossReason: true,
  trackRevenue: true,
  showWinProbability: false,
  lossReasons: [
    'Price too high',
    'Chose competitor',
    'No budget',
    'Timing not right',
    'No response',
    'Not a fit',
  ],
};

export const DISPLAY_DEFAULTS: DisplayConfig = {
  defaultView: 'kanban',
  showMetrics: true,
  compactCards: false,
  showCardSource: true,
  showCardValue: false,
  showStageCount: true,
};

// ── Generic hook for a single pipeline settings slice ─────────────────────────

export function usePipelineSetting<T extends object>(
  settingKey: string,
  defaults: T,
) {
  const { setting, isLoading, updateSetting, isUpdating } = useCompanySetting(settingKey);
  const [local, setLocal] = useState<T>(defaults);
  const [initialised, setInitialised] = useState(false);

  // Seed local state from DB once loaded
  useEffect(() => {
    if (!isLoading && !initialised) {
      setLocal(setting ? { ...defaults, ...setting } : defaults);
      setInitialised(true);
    }
  }, [isLoading, setting, initialised, defaults]);

  const isDirty = useMemo(() => {
    if (!initialised) return false;
    const baseline = setting ? { ...defaults, ...setting } : defaults;
    return JSON.stringify(local) !== JSON.stringify(baseline);
  }, [local, setting, defaults, initialised]);

  const save = useCallback(async () => {
    await updateSetting(local);
  }, [local, updateSetting]);

  const update = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { config: local, update, save, isDirty, isLoading: !initialised, isSaving: isUpdating };
}

// ── Convenience hooks ─────────────────────────────────────────────────────────

export const useStaleLeadSettings = () =>
  usePipelineSetting<StaleLeadConfig>('pipeline_stale_leads', STALE_LEAD_DEFAULTS);

export const useLeadRoutingSettings = () =>
  usePipelineSetting<LeadRoutingConfig>('pipeline_routing', LEAD_ROUTING_DEFAULTS);

export const useStageAutomationSettings = () =>
  usePipelineSetting<StageAutomationConfig>('pipeline_automations', STAGE_AUTOMATION_DEFAULTS);

export const useWinLossSettings = () =>
  usePipelineSetting<WinLossConfig>('pipeline_win_loss', WIN_LOSS_DEFAULTS);

export const useDisplaySettings = () =>
  usePipelineSetting<DisplayConfig>('pipeline_display', DISPLAY_DEFAULTS);
