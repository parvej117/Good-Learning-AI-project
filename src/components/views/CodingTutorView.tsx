import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  Code2,
  Bug,
  Sparkles,
  Zap,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';

export const CodingTutorView: React.FC = () => {
  const { addToast, saveNote } = useApp();

  const [language, setLanguage] = useState('javascript');
  const [action, setAction] = useState<'explain' | 'debug' | 'improve' | 'practice' | 'step_by_step'>('debug');
  const [codeSnippet, setCodeSnippet] = useState(`function calculateAverage(grades) {
  let sum = 0;
  for (let i = 0; i <= grades.length; i++) {
    sum += grades[i];
  }
  return sum / grades.length;
}`);
  const [specificQuestion, setSpecificQuestion] = useState('Why does this function return NaN when passed [80, 90, 100]?');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tutorResult, setTutorResult] = useState<any>(null);

  const sampleSnippets: Record<string, { code: string; q: string }> = {
    javascript: {
      code: `async function fetchUsers() {
  const urls = ['/user/1', '/user/2', '/user/3'];
  const users = [];
  urls.forEach(async (url) => {
    const res = await fetch(url);
    users.push(await res.json());
  });
  return users; // Why is this array empty when returned?
}`,
      q: 'Why does fetchUsers return an empty array before the fetches complete?',
    },
    python: {
      code: `def append_to_list(element, target=[]):
    target.append(element)
    return target

print(append_to_list(1)) # [1]
print(append_to_list(2)) # Why does this print [1, 2] instead of [2]?`,
      q: 'Explain Python default mutable arguments and how to fix this safely.',
    },
    sql: {
      code: `SELECT department_id, AVG(salary) 
FROM employees 
WHERE AVG(salary) > 50000 
GROUP BY department_id;`,
      q: 'Fix the SQL syntax error regarding aggregate functions in WHERE clauses.',
    },
  };

  const handleRunTutor = async () => {
    if (!codeSnippet.trim()) return;

    setIsProcessing(true);
    try {
      const response = await AIService.codeTutor({
        code: codeSnippet,
        language,
        action,
        question: specificQuestion,
      });

      setTutorResult(response);
      addToast('Coding tutor analysis ready!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Analyzed with local software engineering tutor.', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Coding Teacher & Logic Debugger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Interactive Programming Mentor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Debug off-by-one errors, understand asynchronous event loops, inspect Big-O runtime complexity, and
            learn clean code principles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              if (sampleSnippets[lang]) {
                setCodeSnippet(sampleSnippets[lang].code);
                setSpecificQuestion(sampleSnippets[lang].q);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white shadow-xs focus:outline-hidden cursor-pointer"
          >
            <option value="javascript">JavaScript (ES6+)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="sql">SQL / Postgres</option>
            <option value="java">Java</option>
            <option value="cpp">C / C++</option>
            <option value="html">HTML5 / CSS3</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Code Editor Input */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 text-slate-100 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs uppercase text-slate-400">{language} workspace</span>
              </div>

              {/* Action Pills */}
              <div className="flex flex-wrap gap-1">
                {(['debug', 'explain', 'improve', 'practice'] as const).map((act) => (
                  <button
                    key={act}
                    onClick={() => setAction(act)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      action === act
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Codearea */}
            <textarea
              rows={12}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Paste code snippet here..."
              className="w-full bg-transparent font-mono text-xs text-cyan-100 p-2 focus:outline-hidden resize-y leading-relaxed"
            />
          </div>

          {/* Question / Specific goal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Specific Query or Bug Description:
            </label>
            <input
              type="text"
              value={specificQuestion}
              onChange={(e) => setSpecificQuestion(e.target.value)}
              placeholder="e.g. Why does this loop throw an exception? How to optimize to O(N)?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-cyan-500"
            />

            <button
              onClick={handleRunTutor}
              disabled={isProcessing || !codeSnippet.trim()}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-98"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Analyze with Coding Teacher</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Educational Code Feedback */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bug className="w-4 h-4 text-cyan-600" />
                <span>Teacher's Code Diagnostic</span>
              </h3>

              {tutorResult && (
                <button
                  onClick={() =>
                    saveNote(
                      `Code Solution: ${language} ${action}`,
                      `**Explanation:**\n${tutorResult.explanation}\n\n**Corrected Code:**\n\`\`\`${language}\n${tutorResult.correctedCode}\n\`\`\``,
                      ['Code Tutor', language]
                    )
                  }
                  className="text-xs font-semibold text-slate-500 hover:text-cyan-600"
                >
                  Save to Notes
                </button>
              )}
            </div>

            {isProcessing ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin" />
                <div className="text-xs font-bold text-slate-700">Tracing execution stack & AST...</div>
                <div className="text-[11px] text-slate-400">Preparing pedagogic breakdown</div>
              </div>
            ) : tutorResult ? (
              <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2">
                {/* Pedagogic Explanation */}
                <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100 space-y-2">
                  <div className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                    Why the Bug Happened / Key Concept
                  </div>
                  <div className="text-xs sm:text-sm text-cyan-950">
                    <MarkdownRenderer content={tutorResult.explanation} />
                  </div>
                </div>

                {/* Corrected Clean Snippet */}
                {tutorResult.correctedCode && (
                  <div>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Corrected Clean Code
                    </div>
                    <MarkdownRenderer
                      content={`\`\`\`${language}\n${tutorResult.correctedCode}\n\`\`\``}
                    />
                  </div>
                )}

                {/* Complexity & Key Rules */}
                {tutorResult.complexity && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">Runtime & Memory Complexity:</div>
                    <div>{tutorResult.complexity}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <Code2 className="w-10 h-10 mx-auto text-slate-300" />
                <div className="text-xs font-semibold">No code analyzed yet</div>
                <p className="text-[11px] max-w-xs mx-auto">
                  Click "Analyze with Coding Teacher" to receive instant diagnostics and conceptual explanations.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
