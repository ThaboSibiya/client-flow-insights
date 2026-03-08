import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const AppearanceSettings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme || 'system';

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean and bright for daytime use',
      preview: {
        bg: 'bg-white',
        sidebar: 'bg-slate-50',
        card: 'bg-white border border-slate-200',
        text: 'bg-slate-800',
        textMuted: 'bg-slate-400',
        accent: 'bg-slate-900',
      },
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Reduced eye strain in low light',
      preview: {
        bg: 'bg-slate-900',
        sidebar: 'bg-slate-800',
        card: 'bg-slate-800 border border-slate-700',
        text: 'bg-slate-100',
        textMuted: 'bg-slate-500',
        accent: 'bg-blue-500',
      },
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Follow your OS preferences',
      preview: {
        bg: 'bg-gradient-to-br from-white to-slate-900',
        sidebar: 'bg-gradient-to-b from-slate-50 to-slate-800',
        card: 'bg-gradient-to-br from-white to-slate-800 border border-slate-300',
        text: 'bg-slate-600',
        textMuted: 'bg-slate-400',
        accent: 'bg-slate-700',
      },
    },
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
                <div key={i} className="h-40 rounded-xl border-2 border-border animate-pulse bg-muted" />
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
                    "relative flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-accent/30"
                  )}
                >
                  <RadioGroupItem value={t.value} id={t.value} className="sr-only" />

                  {/* Selected check badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}

                  {/* Mini preview mockup */}
                  <div className={cn("rounded-lg overflow-hidden h-20 w-full", t.preview.bg)}>
                    <div className="flex h-full">
                      <div className={cn("w-1/4 h-full", t.preview.sidebar)} />
                      <div className="flex-1 p-2 flex flex-col gap-1.5">
                        <div className={cn("h-2 w-3/4 rounded-full", t.preview.text)} />
                        <div className={cn("h-1.5 w-1/2 rounded-full", t.preview.textMuted)} />
                        <div className={cn("flex-1 rounded-md mt-1", t.preview.card)} />
                      </div>
                    </div>
                  </div>

                  {/* Label section */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {t.label}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          {/* Current theme indicator */}
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Active theme:</span>{' '}
              {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              {currentTheme === 'system' && ' (following system preference)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Live Color Palette</CardTitle>
          <CardDescription>
            See how your current theme renders key design tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[
              { name: 'Primary', cls: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', cls: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Accent', cls: 'bg-accent', text: 'text-accent-foreground' },
              { name: 'Muted', cls: 'bg-muted', text: 'text-muted-foreground' },
              { name: 'Background', cls: 'bg-background border border-border', text: 'text-foreground' },
              { name: 'Card', cls: 'bg-card border border-border', text: 'text-card-foreground' },
              { name: 'Destructive', cls: 'bg-destructive', text: 'text-destructive-foreground' },
              { name: 'Input', cls: 'bg-input', text: 'text-foreground' },
              { name: 'Ring', cls: 'bg-ring', text: 'text-primary-foreground' },
              { name: 'Border', cls: 'bg-border', text: 'text-foreground' },
              { name: 'Sidebar', cls: 'bg-sidebar border border-sidebar-border', text: 'text-sidebar-foreground' },
              { name: 'Popover', cls: 'bg-popover border border-border', text: 'text-popover-foreground' },
            ].map((swatch) => (
              <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-full aspect-square rounded-lg shadow-sm flex items-center justify-center",
                  swatch.cls
                )}>
                  <span className={cn("text-[10px] font-bold", swatch.text)}>Aa</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">{swatch.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Text & Field Readability Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Readability Preview</CardTitle>
          <CardDescription>
            Verify text and form elements are clearly visible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-foreground font-semibold">Primary text – should be clearly readable</p>
            <p className="text-muted-foreground">Secondary text – still visible but less prominent</p>
            <p className="text-primary font-medium">Accent/Primary color text – clear emphasis</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Sample Input</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm items-center">
                <span className="text-muted-foreground">Placeholder text...</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Filled Input</label>
              <div className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm items-center">
                user@example.com
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">Primary Button</div>
            <div className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium border border-border">Secondary</div>
            <div className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm font-medium">Destructive</div>
            <div className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm font-medium">Muted</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
