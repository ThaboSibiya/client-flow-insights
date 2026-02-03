
import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAnalyticsData, AnalyticsMetrics, TimeSeriesData, CustomerStatusData, ImportedDataset } from '@/hooks/useAnalyticsData';

interface AnalyticsContextType {
  // Real data from database
  isLoading: boolean;
  error: string | null;
  metrics: AnalyticsMetrics | null;
  customerTimeSeries: TimeSeriesData[];
  revenueTimeSeries: TimeSeriesData[];
  ticketTimeSeries: TimeSeriesData[];
  customerStatusData: CustomerStatusData[];
  
  // Imported datasets
  importedDatasets: ImportedDataset[];
  addImportedDataset: (dataset: ImportedDataset) => void;
  removeImportedDataset: (id: string) => void;
  
  // Active dataset for analysis
  activeDataset: ImportedDataset | null;
  setActiveDataset: (dataset: ImportedDataset | null) => void;
  
  // Refresh data
  refetch: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const analyticsData = useAnalyticsData();
  const [activeDataset, setActiveDataset] = useState<ImportedDataset | null>(null);

  return (
    <AnalyticsContext.Provider
      value={{
        ...analyticsData,
        activeDataset,
        setActiveDataset,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
