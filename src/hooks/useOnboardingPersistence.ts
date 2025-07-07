
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'onboarding-form-data';

export const useOnboardingPersistence = <T extends Record<string, any>>(
  formKey: string,
  defaultValues: T
) => {
  const [persistedData, setPersistedData] = useState<T>(defaultValues);

  const fullKey = `${STORAGE_KEY}-${formKey}`;

  // Load persisted data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPersistedData({ ...defaultValues, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load persisted onboarding data:', error);
      localStorage.removeItem(fullKey);
    }
  }, [fullKey]);

  // Save data to localStorage
  const saveData = (data: Partial<T>) => {
    try {
      const updatedData = { ...persistedData, ...data };
      setPersistedData(updatedData);
      localStorage.setItem(fullKey, JSON.stringify(updatedData));
    } catch (error) {
      console.warn('Failed to persist onboarding data:', error);
    }
  };

  // Clear persisted data
  const clearData = () => {
    try {
      localStorage.removeItem(fullKey);
      setPersistedData(defaultValues);
    } catch (error) {
      console.warn('Failed to clear persisted data:', error);
    }
  };

  return {
    persistedData,
    saveData,
    clearData,
  };
};
