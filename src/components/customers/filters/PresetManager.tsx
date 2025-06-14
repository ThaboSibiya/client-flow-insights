
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';

interface FilterPreset {
  id: string;
  name: string;
  filters: any;
}

interface PresetManagerProps {
  savedPresets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
  onSavePreset: (name: string) => void;
  activeFiltersCount: number;
}

const PresetManager = ({ 
  savedPresets, 
  onApplyPreset, 
  onSavePreset, 
  activeFiltersCount 
}: PresetManagerProps) => {
  const [presetName, setPresetName] = React.useState('');
  const [showPresetInput, setShowPresetInput] = React.useState(false);

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetInput(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-quikle-charcoal">Presets:</span>
        {savedPresets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset(preset)}
            className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal hover:text-quikle-primary"
          >
            {preset.name}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        {showPresetInput ? (
          <>
            <Input
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-32 border-quikle-silver/50 text-quikle-charcoal"
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <Button size="sm" onClick={handleSavePreset} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
              <Save className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setShowPresetInput(false);
                setPresetName('');
              }}
              className="text-quikle-slate hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresetInput(true)}
            disabled={activeFiltersCount === 0}
            className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal disabled:text-quikle-neutral"
          >
            <Save className="h-3 w-3 mr-1" />
            Save Preset
          </Button>
        )}
      </div>
    </div>
  );
};

export default PresetManager;
