
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpPanel from './HelpPanel';

const HelpButton = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full w-12 h-12 bg-quikle-primary hover:bg-quikle-primary/90 shadow-lg"
        title="Get Help"
      >
        <HelpCircle className="h-5 w-5 text-white" />
      </Button>
      
      <HelpPanel
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};

export default HelpButton;
