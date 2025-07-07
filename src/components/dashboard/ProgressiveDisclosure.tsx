
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ProgressiveDisclosureProps {
  title: string;
  summary: React.ReactNode;
  details: React.ReactNode;
  defaultOpen?: boolean;
}

const ProgressiveDisclosure = ({ 
  title, 
  summary, 
  details, 
  defaultOpen = false 
}: ProgressiveDisclosureProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {summary}
          
          <CollapsibleContent className="mt-4">
            <div className="border-t pt-4">
              {details}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default ProgressiveDisclosure;
