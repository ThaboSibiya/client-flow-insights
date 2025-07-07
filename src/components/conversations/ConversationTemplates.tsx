
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Search, Star, Clock, MessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface Template {
  id: string;
  title: string;
  content: string;
  category: 'greeting' | 'support' | 'followup' | 'closing' | 'technical';
  tags: string[];
  isStarred?: boolean;
  lastUsed?: string;
}

interface ConversationTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const ConversationTemplates = ({ onSelectTemplate }: ConversationTemplatesProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: Template[] = [
    {
      id: '1',
      title: 'Welcome & Greeting',
      content: "Hello! Thank you for contacting us. I'm here to help you with any questions or concerns you may have. How can I assist you today?",
      category: 'greeting',
      tags: ['welcome', 'hello', 'greeting'],
      isStarred: true,
      lastUsed: '2024-01-15',
    },
    {
      id: '2',
      title: 'Technical Issue Acknowledgment',
      content: "I understand you're experiencing a technical issue. Let me gather some information to help resolve this quickly. Can you please describe what happened and when you first noticed the problem?",
      category: 'technical',
      tags: ['technical', 'issue', 'troubleshooting'],
      lastUsed: '2024-01-14',
    },
    {
      id: '3',
      title: 'Escalation Notice',
      content: "I'm escalating your case to our technical specialist team who will be better equipped to handle your specific situation. You can expect to hear from them within 2-4 hours. Your case reference number is #[CASE_ID].",
      category: 'support',
      tags: ['escalation', 'specialist', 'case'],
    },
    {
      id: '4',
      title: 'Follow-up Check',
      content: "I wanted to follow up on the solution we provided earlier. How is everything working for you now? Please let me know if you need any additional assistance.",
      category: 'followup',
      tags: ['followup', 'check', 'solution'],
    },
    {
      id: '5',
      title: 'Resolution & Closing',
      content: "I'm glad we were able to resolve your issue! If you have any other questions or concerns in the future, please don't hesitate to reach out. Have a great day!",
      category: 'closing',
      tags: ['resolution', 'closing', 'thanks'],
      isStarred: true,
    },
    {
      id: '6',
      title: 'Request More Information',
      content: "To better assist you, could you please provide the following information: [LIST REQUIRED INFO]. This will help me understand the situation better and provide you with the most accurate solution.",
      category: 'support',
      tags: ['information', 'details', 'clarification'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'greeting', label: 'Greetings', icon: MessageSquare },
    { id: 'support', label: 'Support', icon: FileText },
    { id: 'technical', label: 'Technical', icon: FileText },
    { id: 'followup', label: 'Follow-up', icon: Clock },
    { id: 'closing', label: 'Closing', icon: MessageSquare },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: Template) => {
    onSelectTemplate(template.content);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Conversation Templates</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-quikle-neutral" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-4">
            {/* Categories */}
            <div className="w-48 shrink-0">
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Templates */}
            <div className="flex-1">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{template.title}</h4>
                            {template.isStarred && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-quikle-neutral line-clamp-2 mb-2">
                          {template.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {template.lastUsed && (
                            <span className="text-xs text-quikle-neutral">
                              Last used: {template.lastUsed}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationTemplates;
