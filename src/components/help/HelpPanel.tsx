
import React, { useState } from 'react';
import { X, Search, Book, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { helpContent } from './helpContent';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  page: string;
  pageTitle: string;
  sectionTitle: string;
  content: string;
  tips?: string;
}

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'contextual' | 'global'>('contextual');
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  const currentPageHelp = helpContent[currentPage] || helpContent.dashboard;
  
  // Global search across all pages
  const globalResults: SearchResult[] = [];
  if (searchTerm.trim() && searchMode === 'global') {
    const searchLower = searchTerm.toLowerCase();
    Object.entries(helpContent).forEach(([page, pageHelp]) => {
      pageHelp.sections.forEach(section => {
        const matches =
          section.title.toLowerCase().includes(searchLower) ||
          section.content.toLowerCase().includes(searchLower) ||
          (section.steps?.some(s => s.toLowerCase().includes(searchLower)) ?? false) ||
          (section.tips?.toLowerCase().includes(searchLower) ?? false);
        
        if (matches) {
          globalResults.push({
            page,
            pageTitle: pageHelp.title,
            sectionTitle: section.title,
            content: section.content,
            tips: section.tips,
          });
        }
      });
    });
  }

  // Contextual search (current page only)
  const filteredItems = currentPageHelp.sections.filter(section => {
    if (!searchTerm.trim() || searchMode === 'global') return !searchTerm.trim();
    const searchLower = searchTerm.toLowerCase();
    return (
      section.title.toLowerCase().includes(searchLower) ||
      section.content.toLowerCase().includes(searchLower) ||
      (section.steps?.some(s => s.toLowerCase().includes(searchLower)) ?? false) ||
      (section.tips?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-96 bg-card shadow-xl h-full flex flex-col border-l">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Help & Support</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Page Info */}
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30">
              {currentPageHelp.title}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{currentPageHelp.description}</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm.trim() && (
            <div className="flex gap-1">
              <Button
                variant={searchMode === 'contextual' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSearchMode('contextual')}
              >
                This page
              </Button>
              <Button
                variant={searchMode === 'global' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSearchMode('global')}
              >
                All pages
              </Button>
            </div>
          )}
        </div>

        {/* Help Content */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Global search results */}
            {searchTerm.trim() && searchMode === 'global' ? (
              globalResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                  <Button variant="link" onClick={() => setSearchTerm('')} className="text-primary">
                    Clear search
                  </Button>
                </div>
              ) : (
                globalResults.map((result, index) => (
                  <div key={index} className="space-y-1 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {result.pageTitle}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-foreground text-sm">{result.sectionTitle}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{result.content}</p>
                  </div>
                ))
              )
            ) : (
              /* Contextual results */
              <>
                {filteredItems.length === 0 && searchTerm ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No help topics found for "{searchTerm}"</p>
                    <Button variant="link" onClick={() => setSearchMode('global')} className="text-primary">
                      Search all pages instead
                    </Button>
                  </div>
                ) : (
                  filteredItems.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-medium text-foreground flex items-center gap-2">
                        {section.icon && <section.icon className="h-4 w-4" />}
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                      {section.steps && (
                        <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                          {section.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="list-decimal">
                              {step}
                            </li>
                          ))}
                        </ol>
                      )}
                      {section.tips && (
                        <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                          <p className="text-sm text-foreground">
                            <strong>💡 Tip:</strong> {section.tips}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => { navigate('/documentation'); onClose(); }}
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
