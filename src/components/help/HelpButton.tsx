
import React, { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpPanel from './HelpPanel';

const HelpButton = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  // Hide while the Quikle AI panel is open to avoid two stacked FABs.
  useEffect(() => {
    const update = () => setAgentOpen(document.body.dataset.quikleAgentOpen === 'true');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-quikle-agent-open'] });
    return () => observer.disconnect();
  }, []);

  if (agentOpen) return <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />;

  return (
    <>
      <Button
        onClick={() => setIsHelpOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-6 right-6 z-40 rounded-full h-10 w-10 bg-card hover:bg-accent shadow-md border-border"
        title="Get Help"
      >
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </Button>

      <HelpPanel
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
};

export default HelpButton;
