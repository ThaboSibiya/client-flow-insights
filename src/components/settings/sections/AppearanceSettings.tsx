import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const AppearanceSettings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme || 'system';

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for daytime use' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for reduced eye strain' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow your system preferences' },
  ];

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance of your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl border-2 border-border animate-pulse bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize the appearance of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentTheme} onValueChange={setTheme} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isSelected = currentTheme === t.value;
              return (
                <Label
                  key={t.value}
                  htmlFor={t.value}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-accent/30"
                  )}
                >
                  <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                  <div className={cn(
                    "p-3 rounded-lg transition-colors",
                    isSelected 
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.description}
                    </p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-6 p-4 bg-accent border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Current theme:</strong> {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              {currentTheme === 'system' && ' (following system preference)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Preview</CardTitle>
          <CardDescription>
            See how your selected theme looks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-primary shadow-md" />
              <span className="text-xs text-muted-foreground">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-secondary shadow-md" />
              <span className="text-xs text-muted-foreground">Secondary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-accent shadow-md" />
              <span className="text-xs text-muted-foreground">Accent</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-muted shadow-md" />
              <span className="text-xs text-muted-foreground">Muted</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-background border border-border shadow-md" />
              <span className="text-xs text-muted-foreground">Background</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-card border border-border shadow-md" />
              <span className="text-xs text-muted-foreground">Card</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
