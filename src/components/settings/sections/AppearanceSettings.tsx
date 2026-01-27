
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const AppearanceSettings = () => {
  const [theme, setTheme] = React.useState('system');

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for daytime use' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for reduced eye strain' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow your system preferences' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-quikle-primary" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize the appearance of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <Label
                  key={t.value}
                  htmlFor={t.value}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    theme === t.value
                      ? "border-quikle-primary bg-quikle-primary/5 shadow-md"
                      : "border-quikle-silver/30 hover:border-quikle-primary/50 hover:bg-quikle-crystal/30"
                  )}
                >
                  <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                  <div className={cn(
                    "p-3 rounded-lg transition-colors",
                    theme === t.value 
                      ? "bg-quikle-primary text-white"
                      : "bg-quikle-crystal/50 text-quikle-slate"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "font-medium",
                      theme === t.value ? "text-quikle-primary" : "text-quikle-charcoal"
                    )}>
                      {t.label}
                    </p>
                    <p className="text-xs text-quikle-slate/60 mt-1">
                      {t.description}
                    </p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Dark mode is coming soon. The application currently uses a light theme optimized for the Quikle brand.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Accent Colors Preview - Future Enhancement */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>
            Your workspace uses the Quikle brand palette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-quikle-primary shadow-md" />
              <span className="text-xs text-quikle-slate/70">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-quikle-secondary shadow-md" />
              <span className="text-xs text-quikle-slate/70">Secondary</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-quikle-accent shadow-md" />
              <span className="text-xs text-quikle-slate/70">Accent</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-quikle-crystal shadow-md" />
              <span className="text-xs text-quikle-slate/70">Crystal</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
