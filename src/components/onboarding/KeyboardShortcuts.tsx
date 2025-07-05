import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  shortcuts = [],
  onNext,
  onBack,
  onSubmit,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Built-in shortcuts
      if (event.key === '?' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setShowHelp(!showHelp);
        return;
      }

      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSubmit?.();
        return;
      }

      if (event.key === 'ArrowRight' && event.altKey) {
        event.preventDefault();
        onNext?.();
        return;
      }

      if (event.key === 'ArrowLeft' && event.altKey) {
        event.preventDefault();
        onBack?.();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setShowHelp(false);
        return;
      }

      // Custom shortcuts
      shortcuts.forEach(shortcut => {
        if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, onNext, onBack, onSubmit, showHelp]);

  const allShortcuts = [
    { key: 'Cmd/Ctrl + ?', description: 'Show/hide this help' },
    { key: 'Cmd/Ctrl + Enter', description: 'Submit form' },
    { key: 'Alt + →', description: 'Next step' },
    { key: 'Alt + ←', description: 'Previous step' },
    { key: 'Escape', description: 'Close help' },
    ...shortcuts.map(s => ({ key: s.key, description: s.description })),
  ];

  if (!showHelp) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 left-4 text-quikle-slate hover:text-quikle-primary"
        title="Show keyboard shortcuts (Cmd/Ctrl + ?)"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-72 glass-effect shadow-luxury border-quikle-primary/30 z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-quikle-primary" />
            <CardTitle className="text-sm font-semibold">Keyboard Shortcuts</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Navigate faster with these shortcuts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {allShortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <span className="text-xs text-quikle-slate flex-1">{shortcut.description}</span>
            <Badge variant="outline" className="text-xs font-mono">
              {shortcut.key}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default KeyboardShortcuts;