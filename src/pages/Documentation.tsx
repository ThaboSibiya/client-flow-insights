import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Book, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import DocumentationSidebar, { documentationData, DocArticle, DocCategory } from '@/components/documentation/DocumentationSidebar';
import DocumentationArticle from '@/components/documentation/DocumentationArticle';

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(documentationData[0].id);
  const [activeArticle, setActiveArticle] = useState(documentationData[0].articles[0].id);

  const handleSelectArticle = (categoryId: string, articleId: string) => {
    setActiveCategory(categoryId);
    setActiveArticle(articleId);
  };

  const currentCategory = useMemo(() => {
    return documentationData.find(c => c.id === activeCategory) || documentationData[0];
  }, [activeCategory]);

  const currentArticle = useMemo(() => {
    return currentCategory.articles.find(a => a.id === activeArticle) || currentCategory.articles[0];
  }, [currentCategory, activeArticle]);

  // When search filters change and current article is hidden, jump to first visible
  const visibleCategories = useMemo(() => {
    if (!searchTerm.trim()) return documentationData;
    const s = searchTerm.toLowerCase();
    return documentationData.map(cat => ({
      ...cat,
      articles: cat.articles.filter(a =>
        a.title.toLowerCase().includes(s) ||
        a.content.toLowerCase().includes(s) ||
        cat.label.toLowerCase().includes(s) ||
        (a.steps?.some(step => step.toLowerCase().includes(s)) ?? false)
      )
    })).filter(cat => cat.articles.length > 0);
  }, [searchTerm]);

  // Auto-select first visible article if current is hidden
  React.useEffect(() => {
    if (visibleCategories.length === 0) return;
    const catVisible = visibleCategories.find(c => c.id === activeCategory);
    if (!catVisible) {
      setActiveCategory(visibleCategories[0].id);
      setActiveArticle(visibleCategories[0].articles[0].id);
    } else {
      const artVisible = catVisible.articles.find(a => a.id === activeArticle);
      if (!artVisible) {
        setActiveArticle(catVisible.articles[0].id);
      }
    }
  }, [visibleCategories, activeCategory, activeArticle]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Documentation</h1>
              <p className="text-sm text-muted-foreground">Complete user guide for Quikle CRM</p>
            </div>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 shrink-0 border-r bg-card/50">
          <DocumentationSidebar
            categories={documentationData}
            activeCategory={activeCategory}
            activeArticle={activeArticle}
            onSelectArticle={handleSelectArticle}
            searchTerm={searchTerm}
          />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <DocumentationArticle
              category={currentCategory}
              article={currentArticle}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Documentation;
