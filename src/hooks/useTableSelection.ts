
import { useState } from 'react';

export const useTableSelection = <T extends { id: string }>(items: T[]) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const clearSelection = () => setSelectedItems(new Set());

  const isAllSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));
  const isPartiallySelected = items.some(item => selectedItems.has(item.id)) && !isAllSelected;

  return {
    selectedItems,
    setSelectedItems,
    handleSelectAll,
    handleSelectItem,
    clearSelection,
    isAllSelected,
    isPartiallySelected,
  };
};
