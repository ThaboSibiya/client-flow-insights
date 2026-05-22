import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SnippetBlockProps {
  label: string;
  code: string;
}

const SnippetBlock: React.FC<SnippetBlockProps> = ({ label, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${label} snippet copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="px-3 py-2 text-[11px] leading-relaxed text-foreground whitespace-pre-wrap font-mono overflow-x-auto">
        {code}
      </pre>
    </div>
  );
};

export default SnippetBlock;
