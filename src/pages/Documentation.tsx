import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Book, FileText, Users, Settings, BarChart3, MessageSquare, Workflow } from 'lucide-react';

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const documentationSections = [
    {
      title: "Getting Started",
      icon: Book,
      articles: [
        { title: "Welcome to Quikle CRM", content: "Learn the basics of your new CRM system and how to get started." },
        { title: "User Setup & Login", content: "Set up your account and understand the login process." },
        { title: "Dashboard Overview", content: "Navigate your main dashboard and understand key metrics." }
      ]
    },
    {
      title: "Customer Management",
      icon: Users,
      articles: [
        { title: "Adding New Customers", content: "Learn how to add and manage customer information effectively." },
        { title: "Customer Status Management", content: "Understand different customer statuses and how to update them." },
        { title: "Customer Communication", content: "Best practices for communicating with customers through the system." }
      ]
    },
    {
      title: "Conversations & Communication",
      icon: MessageSquare,
      articles: [
        { title: "Managing Conversations", content: "How to handle customer conversations and messages." },
        { title: "Message Threading", content: "Understanding conversation threads and organization." },
        { title: "Communication Automation", content: "Set up automated responses and workflows." }
      ]
    },
    {
      title: "Pipeline Management",
      icon: Workflow,
      articles: [
        { title: "Sales Pipeline Setup", content: "Configure your sales pipeline stages and workflows." },
        { title: "Ticket Management", content: "Handle support tickets through the pipeline system." },
        { title: "Automation Rules", content: "Create automated actions based on pipeline changes." }
      ]
    },
    {
      title: "Analytics & Reporting",
      icon: BarChart3,
      articles: [
        { title: "Dashboard Analytics", content: "Understand your dashboard metrics and KPIs." },
        { title: "Customer Reports", content: "Generate and analyze customer performance reports." },
        { title: "Revenue Tracking", content: "Monitor revenue streams and financial performance." }
      ]
    },
    {
      title: "Employee Management",
      icon: Settings,
      articles: [
        { title: "Adding Team Members", content: "Invite and manage team members in your CRM." },
        { title: "Role & Permissions", content: "Set up roles and control access permissions." },
        { title: "Employee Productivity", content: "Track and manage team productivity metrics." }
      ]
    }
  ];

  const filteredSections = documentationSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      !searchTerm.trim() ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.articles.length > 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal">Quikle CRM Documentation</h1>
          <p className="text-quikle-slate mt-1">Complete guide to using your Quikle CRM system</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-neutral" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentation Sections */}
      <div className="grid gap-6">
        {filteredSections.length === 0 && searchTerm ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-quikle-neutral">No documentation found for "{searchTerm}"</p>
            </CardContent>
          </Card>
        ) : (
          filteredSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
                  <section.icon className="h-5 w-5 text-quikle-primary" />
                  {section.title}
                  <Badge variant="outline" className="ml-auto">
                    {section.articles.length} articles
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.articles.map((article, articleIndex) => (
                    <div key={articleIndex} className="border-l-4 border-quikle-primary pl-4 py-2">
                      <h4 className="font-medium text-quikle-charcoal flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {article.title}
                      </h4>
                      <p className="text-sm text-quikle-neutral mt-1 leading-relaxed">
                        {article.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-quikle-charcoal">Quick Access Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-quikle-crystal rounded-lg">
              <h4 className="font-medium text-quikle-charcoal mb-2">Need Help?</h4>
              <p className="text-sm text-quikle-neutral">
                Use the help button (?) in the bottom right corner for contextual help on any page.
              </p>
            </div>
            <div className="p-4 bg-quikle-crystal rounded-lg">
              <h4 className="font-medium text-quikle-charcoal mb-2">Support Contact</h4>
              <p className="text-sm text-quikle-neutral">
                For additional support, contact your system administrator or support team.
              </p>
            </div>
            <div className="p-4 bg-quikle-crystal rounded-lg">
              <h4 className="font-medium text-quikle-charcoal mb-2">Cancellation Policy</h4>
              <p className="text-sm text-quikle-neutral">
                Review our subscription cancellation and data retention policy before making changes.
              </p>
              <a href="/cancellation-policy" className="text-sm text-quikle-primary hover:underline mt-1 inline-block">
                Read cancellation policy →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documentation;
