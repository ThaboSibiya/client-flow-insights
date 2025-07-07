
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, Star } from 'lucide-react';
import { FilterPreset } from '@/hooks/useCustomerFilters/types';

interface FilterPresetsProps {
  savedPresets: FilterPreset[];
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
}

const FilterPresets = ({ savedPresets, onApplyPreset, onSavePreset }: FilterPresetsProps) => {
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  const savePreset = React.useCallback(() => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetDialog(false);
    }
  }, [presetName, onSavePreset]);

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">Saved Presets</label>
        <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
              <Save className="w-4 h-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <Button onClick={savePreset} disabled={!presetName.trim()}>
                  Save Preset
                </Button>
                <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {savedPresets.map((preset) => (
          <Badge
            key={preset.id}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 border-blue-200 text-blue-800 transition-colors"
            onClick={() => onApplyPreset(preset.id)}
          >
            <Star className="w-3 h-3 mr-1" />
            {preset.name}
          </Badge>
        ))}
        {savedPresets.length === 0 && (
          <span className="text-sm text-slate-500 italic">No saved presets yet</span>
        )}
      </div>
    </div>
  );
};

export default FilterPresets;
