
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  return (
    <Button variant="outline" size="sm">
      <Sun size={16} />
    </Button>
  );
};

export default ThemeToggle;
