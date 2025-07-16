
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useCRM } from '@/context/CRMContext';
import StatusCard from '@/components/dashboard/StatusCard';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardLayoutManager from '@/components/dashboard/DashboardLayoutManager';
import RealtimeActivityFeed from '@/components/dashboard/RealtimeActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import InteractiveMetrics from '@/components/dashboard/InteractiveMetrics';
import DraggableWidget from '@/components/dashboard/DraggableWidget';
import SwipeableMetricsCards from '@/components/dashboard/SwipeableMetricsCards';
import ProgressiveDisclosure from '@/components/dashboard/ProgressiveDisclosure';
import ThemeToggle from '@/components/dashboard/ThemeToggle';
import { Users, Clock, CircleCheck, Database } from 'lucide-react';
import { generateMonthlyActivityData } from '@/utils/chart-utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { customers } = useCRM();
  const isMobile = useIsMobile();
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState([
    'metrics',
    'chart-interactive',
    'activity-actions'
  ]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Count customers by status
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const existingCustomers = customers.filter(c => c.status === 'existing').length;
  const pendingCustomers = customers.filter(c => c.status === 'pending').length;
  const finalisedCustomers = customers.filter(c => c.status === 'finalised').length;
  
  // Generate monthly data from actual customer records
  const chartData = generateMonthlyActivityData(customers);

  // Prepare metrics for mobile swipeable cards
  const metricsData = [
    {
      id: 'new',
      title: 'New Customers',
      value: newCustomers,
      icon: <Users size={24} className="text-white" />,
      color: 'bg-gradient-to-br from-quikle-primary to-quikle-accent',
      change: { value: 12, isPositive: true }
    },
    {
      id: 'existing',
      title: 'Existing Customers',
      value: existingCustomers,
      icon: <Database size={24} className="text-white" />,
      color: 'bg-gradient-to-br from-quikle-blue to-quikle-secondary',
      change: { value: 8, isPositive: true }
    },
    {
      id: 'pending',
      title: 'Pending Customers',
      value: pendingCustomers,
      icon: <Clock size={24} className="text-white" />,
      color: 'bg-gradient-to-br from-quikle-purple to-quikle-accent',
      change: { value: 3, isPositive: false }
    },
    {
      id: 'finalised',
      title: 'Finalised Deals',
      value: finalisedCustomers,
      icon: <CircleCheck size={24} className="text-white" />,
      color: 'bg-gradient-to-br from-quikle-success to-emerald-600',
      change: { value: 15, isPositive: true }
    }
  ];

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'metrics':
        return (
          <DraggableWidget key="metrics" id="metrics" isEditMode={isEditMode}>
            {isMobile ? (
              <SwipeableMetricsCards metrics={metricsData} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metricsData.map((metric) => (
                  <StatusCard
                    key={metric.id}
                    title={metric.title}
                    count={metric.value}
                    icon={metric.icon}
                    color={metric.color}
                  />
                ))}
              </div>
            )}
          </DraggableWidget>
        );

      case 'chart-interactive':
        return (
          <DraggableWidget key="chart-interactive" id="chart-interactive" isEditMode={isEditMode}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                {isMobile ? (
                  <ProgressiveDisclosure
                    title="Customer Activity"
                    summary={
                      <div className="text-sm text-gray-600">
                        View detailed analytics and trends
                      </div>
                    }
                    details={<CustomerActivityChart data={chartData} />}
                  />
                ) : (
                  <CustomerActivityChart data={chartData} />
                )}
              </div>
              <div>
                <InteractiveMetrics />
              </div>
            </div>
          </DraggableWidget>
        );

      case 'activity-actions':
        return (
          <DraggableWidget key="activity-actions" id="activity-actions" isEditMode={isEditMode}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                {isMobile ? (
                  <ProgressiveDisclosure
                    title="Live Activity"
                    summary={
                      <div className="text-sm text-gray-600">
                        Recent system activities and updates
                      </div>
                    }
                    details={<RealtimeActivityFeed />}
                  />
                ) : (
                  <RealtimeActivityFeed />
                )}
              </div>
              <div>
                {isMobile ? (
                  <ProgressiveDisclosure
                    title="Recent Activity"
                    summary={
                      <div className="text-sm text-gray-600">
                        Latest customer interactions
                      </div>
                    }
                    details={<RecentActivity customers={customers} />}
                  />
                ) : (
                  <RecentActivity customers={customers} />
                )}
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </DraggableWidget>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm quikle-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-quikle drop-shadow-sm">Dashboard Overview</h1>
            <p className="text-quikle-slate mt-1">Monitor your business performance at a glance</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <DashboardLayoutManager 
        isEditMode={isEditMode} 
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      >
        {isEditMode && !isMobile ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {widgetOrder.map(renderWidget)}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-6">
            {widgetOrder.map(renderWidget)}
          </div>
        )}
      </DashboardLayoutManager>
    </div>
  );
};

export default Dashboard;
