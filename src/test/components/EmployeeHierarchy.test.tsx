import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeHierarchy from '@/components/employees/EmployeeHierarchy';

// Mock ReactFlow components
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  useNodesState: (nodes: any[]) => [nodes, vi.fn(), vi.fn()],
  useEdgesState: (edges: any[]) => [edges, vi.fn(), vi.fn()],
  Position: { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' },
}));

describe('EmployeeHierarchy', () => {
  it('renders the search input', () => {
    const { getByPlaceholderText } = render(<EmployeeHierarchy />);
    expect(getByPlaceholderText('Search employees...')).toBeInTheDocument();
  });

  it('renders the ReactFlow component', () => {
    const { getByTestId } = render(<EmployeeHierarchy />);
    expect(getByTestId('react-flow')).toBeInTheDocument();
    expect(getByTestId('background')).toBeInTheDocument();
    expect(getByTestId('controls')).toBeInTheDocument();
    expect(getByTestId('minimap')).toBeInTheDocument();
  });
});