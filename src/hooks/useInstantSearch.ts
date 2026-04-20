import { useState, useEffect, useMemo, useCallback } from 'react';

// Lightweight debounce to avoid the lodash dependency
function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };
  return debounced as T & { cancel: () => void };
}

export interface SearchOptions<T> {
  searchFields: (keyof T)[];
  filterFunctions?: { [key: string]: (item: T, value: any) => boolean };
  sortOptions?: { [key: string]: (a: T, b: T) => number };
  debounceMs?: number;
}

export interface SearchState<T> {
  query: string;
  filters: { [key: string]: any };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const useInstantSearch = <T>(
  items: T[],
  options: SearchOptions<T>
) => {
  const [searchState, setSearchState] = useState<SearchState<T>>({
    query: '',
    filters: {},
    sortBy: '',
    sortOrder: 'asc',
    page: 1,
    pageSize: 20,
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => {
      setDebouncedQuery(query);
    }, options.debounceMs || 300),
    [options.debounceMs]
  );

  useEffect(() => {
    debouncedSetQuery(searchState.query);
    return () => debouncedSetQuery.cancel();
  }, [searchState.query, debouncedSetQuery]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply text search
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim();
      result = result.filter(item => {
        return options.searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          if (typeof value === 'number') {
            return value.toString().includes(query);
          }
          return false;
        });
      });
    }

    // Apply filters
    Object.entries(searchState.filters).forEach(([filterKey, filterValue]) => {
      if (filterValue !== undefined && filterValue !== '' && filterValue !== null) {
        const filterFn = options.filterFunctions?.[filterKey];
        if (filterFn) {
          result = result.filter(item => filterFn(item, filterValue));
        } else {
          // Default filter behavior
          result = result.filter(item => {
            const itemValue = (item as any)[filterKey];
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue);
            }
            return itemValue === filterValue;
          });
        }
      }
    });

    // Apply sorting
    if (searchState.sortBy && options.sortOptions?.[searchState.sortBy]) {
      const sortFn = options.sortOptions[searchState.sortBy];
      result.sort((a, b) => {
        const sortResult = sortFn(a, b);
        return searchState.sortOrder === 'desc' ? -sortResult : sortResult;
      });
    }

    return result;
  }, [items, debouncedQuery, searchState.filters, searchState.sortBy, searchState.sortOrder, options]);

  // Paginated results
  const paginatedItems = useMemo(() => {
    const startIndex = (searchState.page - 1) * searchState.pageSize;
    const endIndex = startIndex + searchState.pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, searchState.page, searchState.pageSize]);

  // Search controls
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query, page: 1 }));
  }, []);

  const setFilter = useCallback((key: string, value: any) => {
    setSearchState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1,
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setSearchState(prev => {
      const newFilters = { ...prev.filters };
      delete newFilters[key];
      return { ...prev, filters: newFilters, page: 1 };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchState(prev => ({ ...prev, filters: {}, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    setSearchState(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setSearchState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setSearchState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Search stats
  const searchStats = useMemo(() => ({
    totalItems: items.length,
    filteredItems: filteredItems.length,
    currentPage: searchState.page,
    totalPages: Math.ceil(filteredItems.length / searchState.pageSize),
    hasResults: filteredItems.length > 0,
    isSearching: debouncedQuery.trim().length > 0,
    hasFilters: Object.keys(searchState.filters).length > 0,
  }), [items.length, filteredItems.length, searchState.page, searchState.pageSize, debouncedQuery, searchState.filters]);

  // Quick search presets
  const saveSearchPreset = useCallback((name: string) => {
    const preset = {
      name,
      query: searchState.query,
      filters: searchState.filters,
      sortBy: searchState.sortBy,
      sortOrder: searchState.sortOrder,
    };
    
    // Save to localStorage
    const presets = JSON.parse(localStorage.getItem('searchPresets') || '[]');
    const existingIndex = presets.findIndex((p: any) => p.name === name);
    
    if (existingIndex >= 0) {
      presets[existingIndex] = preset;
    } else {
      presets.push(preset);
    }
    
    localStorage.setItem('searchPresets', JSON.stringify(presets));
    return preset;
  }, [searchState]);

  const loadSearchPreset = useCallback((preset: any) => {
    setSearchState(prev => ({
      ...prev,
      query: preset.query || '',
      filters: preset.filters || {},
      sortBy: preset.sortBy || '',
      sortOrder: preset.sortOrder || 'asc',
      page: 1,
    }));
  }, []);

  const getSearchPresets = useCallback(() => {
    return JSON.parse(localStorage.getItem('searchPresets') || '[]');
  }, []);

  // Highlight search terms in results
  const highlightText = useCallback((text: string, highlight?: string) => {
    if (!highlight || !highlight.trim()) return text;
    
    const query = highlight.toLowerCase().trim();
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === query 
        ? { text: part, highlighted: true, key: index }
        : { text: part, highlighted: false, key: index }
    );
  }, []);

  return {
    // Data
    items: paginatedItems,
    allFilteredItems: filteredItems,
    
    // State
    searchState,
    searchStats,
    
    // Controls
    setQuery,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    setPage,
    setPageSize,
    
    // Presets
    saveSearchPreset,
    loadSearchPreset,
    getSearchPresets,
    
    // Utilities
    highlightText,
  };
};