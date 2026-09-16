import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse markdown lines and code blocks
  const renderFormatted = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeContent: string[] = [];

    lines.forEach((line, idx) => {
      // Code block start or end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'code';
          codeContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeSnippet key={`code_${idx}`} language={codeLanguage} code={codeContent.join('\n')} />
          );
          codeLanguage = '';
          codeContent = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-base font-semibold text-slate-900 mt-4 mb-2 tracking-tight">
            {formatInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-lg font-bold text-slate-900 mt-5 mb-2.5 tracking-tight border-b border-slate-100 pb-1.5">
            {formatInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={idx} className="text-xl font-extrabold text-slate-900 mt-6 mb-3 tracking-tight">
            {formatInline(line.slice(2))}
          </h1>
        );
      }
      // Blockquotes / Callout notes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="border-l-4 border-blue-500 bg-blue-50/60 pl-3.5 pr-3 py-2 my-2.5 rounded-r-lg text-slate-700 text-sm italic">
            {formatInline(line.slice(2))}
          </blockquote>
        );
      }
      // Bullet items
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 my-1 pl-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <span>{formatInline(line.trim().slice(2))}</span>
          </div>
        );
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s(.*)/);
        if (match) {
          elements.push(
            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 my-1 pl-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 mt-0.5">
                {match[1]}
              </span>
              <span>{formatInline(match[2])}</span>
            </div>
          );
        }
      }
      // Standard paragraph or empty line
      else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-sm text-slate-700 leading-relaxed my-1.5">
            {formatInline(line)}
          </p>
        );
      }
    });

    if (inCodeBlock && codeContent.length > 0) {
      elements.push(
        <CodeSnippet key="code_unclosed" language={codeLanguage} code={codeContent.join('\n')} />
      );
    }

    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    // Replace bold **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 text-xs font-mono font-medium text-blue-700 bg-blue-50 rounded border border-blue-200/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1">{renderFormatted(content)}</div>;
};

const CodeSnippet: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/90 border-b border-slate-700/80 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono uppercase tracking-wider text-[11px] font-medium text-slate-300">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white px-2 py-0.5 rounded hover:bg-slate-700/60 transition"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto">
        <pre className="font-mono text-xs text-slate-100 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
