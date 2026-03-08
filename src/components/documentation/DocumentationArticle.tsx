import React, { useState } from 'react';
import { DocArticle, DocCategory } from './DocumentationSidebar';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Copy, Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentationArticleProps {
  category: DocCategory;
  article: DocArticle;
}

const DocumentationArticle = ({ category, article }: DocumentationArticleProps) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Docs</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{category.label}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{article.title}</span>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-primary border-primary/30">
            {category.label}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{article.title}</h1>
      </div>

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed text-base">
        {article.content}
      </p>

      {/* Steps */}
      {article.steps && article.steps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Steps / Details</h3>
          <ol className="space-y-2">
            {article.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips */}
      {article.tips && (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-semibold text-foreground">Tip</span>
            <p className="text-sm text-muted-foreground mt-1">{article.tips}</p>
          </div>
        </div>
      )}

      {/* Code Snippets */}
      {article.codeSnippet && article.codeSnippet.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Code Examples</h3>
          {article.codeSnippet.map((snippet) => (
            <div key={snippet.label} className="rounded-lg border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground">{snippet.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => handleCopy(snippet.code, snippet.label)}
                >
                  {copiedSnippet === snippet.label ? (
                    <><Check className="h-3 w-3" /> Copied</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Copy</>
                  )}
                </Button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed whitespace-pre">
                {snippet.code}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationArticle;
