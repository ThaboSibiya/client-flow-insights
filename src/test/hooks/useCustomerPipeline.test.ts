import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomerPipeline } from '@/hooks/useCustomerPipeline';

// Mock the CRM context
const mockUseCRM = vi.fn();
vi.mock('@/context/CRMContext', () => ({
  useCRM: () => mockUseCRM(),
}));

// Mock DND kit utilities
vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (array: any[], oldIndex: number, newIndex: number) => {
    const newArray = [...array];
    const [movedItem] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, movedItem);
    return newArray;
  },
}));

interface MockCustomer {
  id: string;
  name: string;
  email: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
}

describe('useCustomerPipeline Hook', () => {
  const mockCustomers: MockCustomer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'new' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'existing' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'finalised' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCRM.mockReturnValue({
      customers: mockCustomers,
    });
  });

  it('initializes with default stages', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    expect(result.current.stages).toHaveLength(4);
    expect(result.current.stages[0].name).toBe('New Leads');
    expect(result.current.stages[1].name).toBe('Contacted');
    expect(result.current.stages[2].name).toBe('Qualified');
    expect(result.current.stages[3].name).toBe('Closed Won');
  });

  it('distributes customers to correct stages based on status', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const newStage = result.current.stages.find(s => s.id === 'new');
    const qualifiedStage = result.current.stages.find(s => s.id === 'qualified');
    const closedStage = result.current.stages.find(s => s.id === 'closed');
    
    expect(newStage?.customers).toHaveLength(1);
    expect(newStage?.customers[0].id).toBe('1');
    
    expect(qualifiedStage?.customers).toHaveLength(1);
    expect(qualifiedStage?.customers[0].id).toBe('2');
    
    expect(closedStage?.customers).toHaveLength(1);
    expect(closedStage?.customers[0].id).toBe('3');
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    expect(result.current.isAddStageOpen).toBe(false);
    expect(result.current.activeItem).toBe(null);
    expect(typeof result.current.handleDragStart).toBe('function');
    expect(typeof result.current.handleDragEnd).toBe('function');
    expect(typeof result.current.handleCustomerMove).toBe('function');
    expect(typeof result.current.addStage).toBe('function');
  });

  it('adds new stage correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const initialStageCount = result.current.stages.length;
    
    result.current.addStage('New Stage', '#FF0000');
    
    expect(result.current.stages).toHaveLength(initialStageCount + 1);
    
    const newStage = result.current.stages[result.current.stages.length - 1];
    expect(newStage.name).toBe('New Stage');
    expect(newStage.color).toBe('#FF0000');
    expect(newStage.customers).toHaveLength(0);
    expect(newStage.automationEnabled).toBe(false);
    expect(result.current.isAddStageOpen).toBe(false);
  });

  it('handles customer move between stages', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    // Move customer from 'new' to 'qualified'
    result.current.handleCustomerMove('1', 'new', 'qualified');
    
    const newStage = result.current.stages.find(s => s.id === 'new');
    const qualifiedStage = result.current.stages.find(s => s.id === 'qualified');
    
    // Customer should be removed from 'new' stage
    expect(newStage?.customers).toHaveLength(0);
    
    // Customer should be added to 'qualified' stage
    expect(qualifiedStage?.customers).toHaveLength(2);
    expect(qualifiedStage?.customers.some(c => c.id === '1')).toBe(true);
  });

  it('handles stage edit correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    result.current.handleStageEdit('new', 'Updated Name', '#00FF00');
    
    const newStage = result.current.stages.find(s => s.id === 'new');
    expect(newStage?.name).toBe('Updated Name');
    expect(newStage?.color).toBe('#00FF00');
  });

  it('handles stage delete correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const initialStageCount = result.current.stages.length;
    
    result.current.handleStageDelete('new');
    
    expect(result.current.stages).toHaveLength(initialStageCount - 1);
    expect(result.current.stages.find(s => s.id === 'new')).toBeUndefined();
  });

  it('handles target setting correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    result.current.handleSetTarget('new', 75);
    
    const newStage = result.current.stages.find(s => s.id === 'new');
    expect(newStage?.target).toBe(75);
  });

  it('handles automation setting correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    result.current.handleSetAutomation('new', true);
    
    const newStage = result.current.stages.find(s => s.id === 'new');
    expect(newStage?.automationEnabled).toBe(true);
  });

  it('handles drag start correctly', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const dragEvent = {
      active: { id: 'customer-1' }
    } as any;
    
    result.current.handleDragStart(dragEvent);
    
    expect(result.current.activeItem?.id).toBe('1');
  });

  it('clears active item on drag start for non-customer items', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const dragEvent = {
      active: { id: 'stage-1' }
    } as any;
    
    result.current.handleDragStart(dragEvent);
    
    expect(result.current.activeItem).toBe(null);
  });

  it('handles drag end with customer move', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    // Set up initial state by dragging customer-1
    const dragStartEvent = {
      active: { id: 'customer-1' }
    } as any;
    result.current.handleDragStart(dragStartEvent);
    
    const dragEndEvent = {
      active: { id: 'customer-1' },
      over: { id: 'qualified' }
    } as any;
    
    result.current.handleDragEnd(dragEndEvent);
    
    // Customer should be moved and active item cleared
    expect(result.current.activeItem).toBe(null);
    
    const qualifiedStage = result.current.stages.find(s => s.id === 'qualified');
    expect(qualifiedStage?.customers.some(c => c.id === '1')).toBe(true);
  });

  it('handles drag end without over target', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const dragEvent = {
      active: { id: 'customer-1' },
      over: null
    } as any;
    
    result.current.handleDragEnd(dragEvent);
    
    expect(result.current.activeItem).toBe(null);
  });

  it('provides correct default stage targets', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const stages = result.current.stages;
    expect(stages.find(s => s.id === 'new')?.target).toBe(50);
    expect(stages.find(s => s.id === 'contacted')?.target).toBe(30);
    expect(stages.find(s => s.id === 'qualified')?.target).toBe(20);
    expect(stages.find(s => s.id === 'closed')?.target).toBe(10);
  });

  it('provides correct stage colors', () => {
    const { result } = renderHook(() => useCustomerPipeline());
    
    const stages = result.current.stages;
    expect(stages.find(s => s.id === 'new')?.color).toBe('#6B7280');
    expect(stages.find(s => s.id === 'qualified')?.color).toBe('#059669');
    expect(stages.find(s => s.id === 'closed')?.color).toBe('#1F2937');
  });
});