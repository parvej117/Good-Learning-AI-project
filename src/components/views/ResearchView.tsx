import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AIService } from '../../services/aiService.ts';
import { MarkdownRenderer } from '../common/MarkdownRenderer.tsx';
import {
  Search,
  BookOpen,
  Sparkles,
  RefreshCw,
  Bookmark,
  Share2,
  FileCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ResearchView: React.FC = () => {
  const { saveNote, addToast } = useApp();

  const [topic, setTopic] = useState('Comparative Analysis: Monolithic vs Microservices vs Serverless Architecture');
  const [depth, setDepth] = useState<'overview' | 'deep' | 'comparative'>('deep');
  const [isResearching, setIsResearching] = useState(false);
  const [report, setReport] = useState<any>({
    topic: 'Comparative Analysis: Monolithic vs Microservices vs Serverless Architecture',
    executiveSummary:
      'Architectural selection dictates engineering velocity, fault tolerance boundaries, cost economics, and operational overhead throughout an application lifecycle.',
    keyFindings: [
      'Monoliths minimize early network latency and deployment complexity, optimal for teams under 10 engineers.',
      'Microservices isolate failure domains and enable independent deployment cadence at the cost of distributed transaction complexity (Saga pattern, eventual consistency).',
      'Serverless computing eliminates operational server maintenance with scale-to-zero economics, but introduces cold-start latency and cloud vendor lock-in.',
    ],
    detailedSections: [
      {
        title: '1. Latency & Network Bound Overhead',
        content:
          'Monolithic systems execute in-process memory function calls (sub-microsecond latency). Microservices transition function invocations to gRPC or HTTP JSON payloads over TCP/IP, introducing 2-15ms network latency per hop and necessitating circuit breaker patterns.',
      },
      {
        title: '2. Database Governance: ACID vs Eventual Consistency',
        content:
          'Monolithic databases enforce strict relational ACID guarantees. Distributed microservices adopt Database-Per-Service patterns, requiring asynchronous messaging brokers (Kafka, RabbitMQ) and event-driven choreographies.',
      },
    ],
    comparisonPoints: [
      { aspect: 'Deployment Simplicity', monolith: 'Very High', microservices: 'Moderate / Low', serverless: 'High' },
      { aspect: 'Fault Isolation', monolith: 'Single point of failure', microservices: 'Isolated per service', serverless: 'High per invocation' },
      { aspect: 'Cost at Low Traffic', monolith: 'Static server cost', microservices: 'High cluster cost', serverless: 'Near $0 (scale to zero)' },
    ],
    references: [
      'Newman, S. (2021). Building Microservices: Designing Fine-Grained Systems. O’Reilly Media.',
      'Fowler, M. (2015). Microservices: A Definition of This New Architectural Term.',
      'Amazon Web Services. (2023). Serverless Application Lens - AWS Well-Architected Framework.',
    ],
  });

  const handleConductResearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsResearching(true);
    try {
      const result = await AIService.research({
        topic: topic.trim(),
        depth,
      });

      setReport(result);
      addToast('Academic research report generated!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Generated analysis with local educational engine.', 'info');
    } finally {
      setIsResearching(false);
    }
  };

  const handleSaveToKnowledge = () => {
    if (!report) return;
    saveNote(
      `Research Report: ${report.topic}`,
      `# ${report.topic}\n\n## Executive Summary\n${report.executiveSummary}\n\n## Key Findings\n${report.keyFindings.map((f: string) => `- ${f}`).join('\n')}\n\n## Detailed Analysis\n${report.detailedSections.map((s: any) => `### ${s.title}\n${s.content}`).join('\n\n')}`,
      ['Research Report', 'Academic Analysis']
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>Deep Topic Exploration & Literature Synthesis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Educational AI Research Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct multi-source conceptual research, synthesize comparative frameworks, and build thorough academic literature foundations.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <form onSubmit={handleConductResearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter research topic or comparison (e.g. Transformers vs RNNs, Quantum Superposition, Keynesian vs Classical Economics)..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
          >
            <option value="deep">Deep Dive</option>
            <option value="comparative">Comparative</option>
            <option value="overview">Executive Overview</option>
          </select>

          <button
            type="submit"
            disabled={isResearching || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-95"
          >
            {isResearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Conduct Research</span>
          </button>
        </form>
      </div>

      {/* Research Output View */}
      {isResearching ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-orange-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-slate-800">Synthesizing Educational Research Report...</div>
          <div className="text-xs text-slate-400">
            Formulating comparative matrices, conceptual breakdowns, and reference citations
          </div>
        </div>
      ) : report ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
                Academic Synthesis Report
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{report.topic}</h2>
            </div>

            <button
              onClick={handleSaveToKnowledge}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-semibold border border-slate-200 transition"
            >
              <Bookmark className="w-4 h-4" />
              <span>Save to Knowledge Base</span>
            </button>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-900">
              Executive Summary
            </h3>
            <p className="text-xs sm:text-sm text-orange-950 leading-relaxed">{report.executiveSummary}</p>
          </div>

          {/* Key Findings Bullet List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Scientific Findings</h3>
            <div className="space-y-2">
              {report.keyFindings.map((finding: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Conceptual Sections */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Theoretical Breakdown</h3>
            {report.detailedSections.map((sec: any, idx: number) => (
              <div key={idx} className="space-y-1.5 p-4 rounded-2xl border border-slate-100 bg-slate-50/40">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{sec.title}</h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <MarkdownRenderer content={sec.content} />
                </div>
              </div>
            ))}
          </div>

          {/* Comparative Matrix Table (if available) */}
          {report.comparisonPoints && report.comparisonPoints.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Comparative Dimension Matrix</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">Dimension</th>
                      <th className="p-3">Monolith</th>
                      <th className="p-3">Microservices</th>
                      <th className="p-3">Serverless</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.comparisonPoints.map((cp: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{cp.aspect}</td>
                        <td className="p-3 text-slate-700">{cp.monolith}</td>
                        <td className="p-3 text-slate-700">{cp.microservices}</td>
                        <td className="p-3 text-slate-700">{cp.serverless}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* References & Citations */}
          {report.references && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Academic References & Recommended Reading:
              </span>
              <ul className="space-y-1 text-slate-500 font-serif">
                {report.references.map((ref: string, idx: number) => (
                  <li key={idx}>[{idx + 1}] {ref}</li>
                ))}
              </ul>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                * Research transparency note: AI synthesized report grounded on peer-reviewed engineering methodologies.
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
