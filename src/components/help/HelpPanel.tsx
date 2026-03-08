import React, { useState } from 'react';
import { X, Search, Book, ExternalLink, ChevronRight, Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import { helpContent } from './helpContent';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

type PanelView = 'help' | 'contact';

const HelpPanel = ({ isOpen, onClose }: HelpPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'contextual' | 'global'>('contextual');
  const [panelView, setPanelView] = useState<PanelView>('help');
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.replace('/', '') || 'dashboard';
  const currentPageHelp = helpContent[currentPage] || helpContent.dashboard;

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

  const handleSendMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      const mailtoLink = `mailto:support@quikle.com?subject=${encodeURIComponent(contactForm.subject)}&body=${encodeURIComponent(contactForm.message)}`;
      window.open(mailtoLink, '_blank');
      toast({ title: 'Message ready to send', description: 'Your email client has been opened.' });
      setContactForm({ subject: '', message: '' });
      setPanelView('help');
    } catch {
      toast({ title: 'Error', description: 'Please email support@quikle.com directly.', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop — click to close */}
      <div className="absolute inset-0 bg-black/50 animate-in fade-in-0 duration-200" onClick={onClose} />
      <div className="relative w-96 bg-card shadow-xl h-full flex flex-col border-l animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {panelView === 'help' ? 'Help & Support' : 'Contact Support'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex p-2 gap-1 border-b bg-muted/20">
          <button
            onClick={() => setPanelView('help')}
            className={cn(
              "flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors",
              panelView === 'help'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Help Articles
          </button>
          <button
            onClick={() => setPanelView('contact')}
            className={cn(
              "flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors",
              panelView === 'contact'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Contact Support
          </button>
        </div>

        {panelView === 'help' ? (
          <>
            {/* Current Page Info */}
            <div className="p-4 bg-muted/30 border-b">
              <Badge variant="outline" className="text-primary border-primary/30 mb-2">
                {currentPageHelp.title}
              </Badge>
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
                  <Button variant={searchMode === 'contextual' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setSearchMode('contextual')}>This page</Button>
                  <Button variant={searchMode === 'global' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setSearchMode('global')}>All pages</Button>
                </div>
              )}
            </div>

            {/* Help Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {searchTerm.trim() && searchMode === 'global' ? (
                  globalResults.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                      <Button variant="link" onClick={() => setSearchTerm('')} className="text-primary">Clear search</Button>
                    </div>
                  ) : (
                    globalResults.map((result, index) => (
                      <div key={index} className="space-y-1 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        <Badge variant="secondary" className="text-[10px] h-5">{result.pageTitle}</Badge>
                        <h3 className="font-medium text-foreground text-sm">{result.sectionTitle}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{result.content}</p>
                      </div>
                    ))
                  )
                ) : (
                  <>
                    {filteredItems.length === 0 && searchTerm ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No help topics found for "{searchTerm}"</p>
                        <Button variant="link" onClick={() => setSearchMode('global')} className="text-primary">Search all pages instead</Button>
                      </div>
                    ) : (
                      filteredItems.map((section, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-foreground flex items-center gap-2">
                            {section.icon && <section.icon className="h-4 w-4" />}
                            {section.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                          {section.steps && (
                            <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                              {section.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="list-decimal">{step}</li>
                              ))}
                            </ol>
                          )}
                          {section.tips && (
                            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg">
                              <p className="text-sm text-foreground"><strong>💡 Tip:</strong> {section.tips}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* CTA to contact support */}
                {!searchTerm.trim() && (
                  <div className="mt-6 p-4 rounded-lg border border-dashed border-border bg-muted/20 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Can't find what you're looking for?</p>
                    <Button variant="outline" size="sm" onClick={() => setPanelView('contact')} className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => { navigate('/documentation'); onClose(); }}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Documentation
              </Button>
            </div>
          </>
        ) : (
          /* Contact Support View */
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Quick contact */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Get in touch</p>
                <a
                  href="mailto:support@quikle.com"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Email Support</p>
                    <p className="text-xs text-muted-foreground truncate">support@quikle.com</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or send a message</span>
                </div>
              </div>

              {/* Contact form */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    placeholder="Describe what you need help with..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !contactForm.subject.trim() || !contactForm.message.trim()}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default HelpPanel;