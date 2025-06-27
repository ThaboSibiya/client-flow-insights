
import React, { useState } from 'react';
import { X, Search, Book, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';
import { helpContent } from './helpContent';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Get current page context
  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  const currentPageHelp = helpContent[currentPage] || helpContent.dashboard;
  
  // Filter help items based on search - improved search functionality
  const filteredItems = currentPageHelp.sections.filter(section => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in title
    if (section.title.toLowerCase().includes(searchLower)) return true;
    
    // Search in content
    if (section.content.toLowerCase().includes(searchLower)) return true;
    
    // Search in steps
    if (section.steps && section.steps.some(step => 
      step.toLowerCase().includes(searchLower)
    )) return true;
    
    // Search in tips
    if (section.tips && section.tips.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-96 bg-white shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-quikle-silver">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-quikle-primary" />
            <h2 className="text-lg font-semibold text-quikle-charcoal">Help & Support</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Page Info */}
        <div className="p-4 bg-quikle-crystal border-b border-quikle-silver">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-quikle-primary border-quikle-primary">
              {currentPageHelp.title}
            </Badge>
          </div>
          <p className="text-sm text-quikle-neutral">{currentPageHelp.description}</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-quikle-silver">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-neutral" />
            <Input
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Help Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {filteredItems.length === 0 && searchTerm ? (
              <div className="text-center py-8">
                <p className="text-quikle-neutral">No help topics found for "{searchTerm}"</p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="text-quikle-primary"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              filteredItems.map((section, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium text-quikle-charcoal flex items-center gap-2">
                    {section.icon && <section.icon className="h-4 w-4" />}
                    {section.title}
                  </h3>
                  <p className="text-sm text-quikle-neutral leading-relaxed">
                    {section.content}
                  </p>
                  {section.steps && (
                    <ol className="text-sm text-quikle-neutral space-y-1 ml-4">
                      {section.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="list-decimal">
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                  {section.tips && (
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>💡 Tip:</strong> {section.tips}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-quikle-silver">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.open('/documentation', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpPanel;
