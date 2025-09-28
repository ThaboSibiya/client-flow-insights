import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerPipeline from '@/components/pipeline/CustomerPipeline';

// Mock the custom hook
const mockUseCustomerPipeline = vi.fn();
vi.mock('@/hooks/useCustomerPipeline', () => ({
  useCustomerPipeline: () => mockUseCustomerPipeline(),
}));

// Mock DND kit components
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: any) => (
    <div data-testid="dnd-context" data-drag-start={!!onDragStart} data-drag-end={!!onDragEnd}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
}));

// Mock child components
vi.mock('@/components/pipeline/AddStageDialog', () => ({
  default: ({ open, onAddStage }: any) => 
    open ? (
      <div data-testid="add-stage-dialog">
        <button onClick={() => onAddStage('New Stage', '#000000')}>Add Stage</button>
      </div>
    ) : null,
}));

vi.mock('@/components/pipeline/PipelineMetrics', () => ({
  default: ({ type, stages }: any) => (
    <div data-testid="pipeline-metrics">
      Metrics for {type}: {stages.length} stages
    </div>
  ),
}));

vi.mock('@/components/pipeline/DroppableStage', () => ({
  default: ({ stage, type, onStageEdit, onStageDelete }: any) => (
    <div data-testid={`droppable-stage-${stage.id}`} data-type={type}>
      <h3>{stage.name}</h3>
      <span>Customers: {stage.customers?.length || 0}</span>
      <button onClick={() => onStageEdit(stage.id, 'Updated Stage', '#333333')}>
        Edit Stage
      </button>
      <button onClick={() => onStageDelete(stage.id)}>Delete Stage</button>
    </div>
  ),
}));

interface MockStage {
  id: string;
  name: string;
  color: string;
  customers: any[];
  automationEnabled: boolean;
  target?: number;
}

describe('CustomerPipeline Component', () => {
  const mockStages: MockStage[] = [
    {
      id: 'new',
      name: 'New Leads',
      color: '#6B7280',
      customers: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      ],
      automationEnabled: false,
      target: 50,
    },
    {
      id: 'qualified',
      name: 'Qualified',
      color: '#059669',
      customers: [
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      ],
      automationEnabled: true,
      target: 20,
    },
  ];

  const mockHookReturn = {
    stages: mockStages,
    isAddStageOpen: false,
    setIsAddStageOpen: vi.fn(),
    activeItem: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleCustomerMove: vi.fn(),
    addStage: vi.fn(),
    handleStageEdit: vi.fn(),
    handleStageDelete: vi.fn(),
    handleAddCustomer: vi.fn(),
    handleSetTarget: vi.fn(),
    handleSetAutomation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCustomerPipeline.mockReturnValue(mockHookReturn);
  });

  it('renders pipeline title and description', () => {
    const { getByText } = render(<CustomerPipeline />);
    
    expect(getByText('Customer Pipeline')).toBeInTheDocument();
    expect(getByText('Drag customers between stages to update their status')).toBeInTheDocument();
  });

  it('renders pipeline action buttons', () => {
    const { getByText } = render(<CustomerPipeline />);
    
    expect(getByText('Pipeline Settings')).toBeInTheDocument();
    expect(getByText('Add Stage')).toBeInTheDocument();
  });

  it('renders pipeline metrics component', () => {
    const { getByTestId, getByText } = render(<CustomerPipeline />);
    
    const metrics = getByTestId('pipeline-metrics');
    expect(metrics).toBeInTheDocument();
    expect(getByText('Metrics for customer: 2 stages')).toBeInTheDocument();
  });

  it('renders all pipeline stages', () => {
    const { getByTestId } = render(<CustomerPipeline />);
    
    expect(getByTestId('droppable-stage-new')).toBeInTheDocument();
    expect(getByTestId('droppable-stage-qualified')).toBeInTheDocument();
  });

  it('displays correct customer counts in stages', () => {
    const { getByText } = render(<CustomerPipeline />);
    
    expect(getByText('Customers: 2')).toBeInTheDocument(); // New Leads stage
    expect(getByText('Customers: 1')).toBeInTheDocument(); // Qualified stage
  });

  it('renders DND context with proper event handlers', () => {
    const { getByTestId } = render(<CustomerPipeline />);
    
    const dndContext = getByTestId('dnd-context');
    expect(dndContext).toBeInTheDocument();
    expect(dndContext).toHaveAttribute('data-drag-start', 'true');
    expect(dndContext).toHaveAttribute('data-drag-end', 'true');
  });

  it('renders sortable context', () => {
    const { getByTestId } = render(<CustomerPipeline />);
    
    expect(getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('opens add stage dialog when add stage button is clicked', () => {
    const mockSetIsAddStageOpen = vi.fn();
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      setIsAddStageOpen: mockSetIsAddStageOpen,
    });

    const { getByText } = render(<CustomerPipeline />);
    
    const addStageButton = getByText('Add Stage');
    addStageButton.click();
    
    expect(mockSetIsAddStageOpen).toHaveBeenCalledWith(true);
  });

  it('shows add stage dialog when isAddStageOpen is true', () => {
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      isAddStageOpen: true,
    });

    const { getByTestId } = render(<CustomerPipeline />);
    
    expect(getByTestId('add-stage-dialog')).toBeInTheDocument();
  });

  it('calls addStage when stage is added from dialog', () => {
    const mockAddStage = vi.fn();
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      isAddStageOpen: true,
      addStage: mockAddStage,
    });

    const { getByText } = render(<CustomerPipeline />);
    
    const addButton = getByText('Add Stage');
    addButton.click();
    
    expect(mockAddStage).toHaveBeenCalledWith('New Stage', '#000000');
  });

  it('handles stage edit correctly', () => {
    const mockHandleStageEdit = vi.fn();
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      handleStageEdit: mockHandleStageEdit,
    });

    const { getByText } = render(<CustomerPipeline />);
    
    const editButtons = getByText('Edit Stage');
    editButtons.click();
    
    expect(mockHandleStageEdit).toHaveBeenCalledWith('new', 'Updated Stage', '#333333');
  });

  it('handles stage delete correctly', () => {
    const mockHandleStageDelete = vi.fn();
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      handleStageDelete: mockHandleStageDelete,
    });

    const { getAllByText } = render(<CustomerPipeline />);
    
    const deleteButtons = getAllByText('Delete Stage');
    deleteButtons[0].click();
    
    expect(mockHandleStageDelete).toHaveBeenCalledWith('new');
  });

  it('renders drag overlay when active item is present', () => {
    const activeItem = { 
      id: '1', 
      name: 'John Doe', 
      email: 'john@example.com' 
    };
    
    mockUseCustomerPipeline.mockReturnValue({
      ...mockHookReturn,
      activeItem,
    });

    const { getByTestId, getByText } = render(<CustomerPipeline />);
    
    expect(getByTestId('drag-overlay')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('john@example.com')).toBeInTheDocument();
  });

  it('does not render drag overlay when no active item', () => {
    const { getByTestId } = render(<CustomerPipeline />);
    
    const dragOverlay = getByTestId('drag-overlay');
    expect(dragOverlay).toBeInTheDocument();
    expect(dragOverlay).toBeEmptyDOMElement();
  });

  it('passes correct props to droppable stages', () => {
    const { getByTestId } = render(<CustomerPipeline />);
    
    const firstStage = getByTestId('droppable-stage-new');
    expect(firstStage).toHaveAttribute('data-type', 'customer');
  });

  it('renders stage names correctly', () => {
    const { getByText } = render(<CustomerPipeline />);
    
    expect(getByText('New Leads')).toBeInTheDocument();
    expect(getByText('Qualified')).toBeInTheDocument();
  });
});