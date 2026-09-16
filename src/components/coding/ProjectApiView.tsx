import React, { useState } from 'react';
import { ProjectApiEndpoint } from '../../types/index.ts';
import { Network, Lock, Unlock, Copy, Check, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface ProjectApiViewProps {
  apis: ProjectApiEndpoint[];
}

export const ProjectApiView: React.FC<ProjectApiViewProps> = ({ apis }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [testResponse, setTestResponse] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleTestCall = (idx: number, api: ProjectApiEndpoint) => {
    setTestResponse((prev) => ({
      ...prev,
      [idx]: `HTTP/1.1 200 OK\nContent-Type: application/json\nX-Response-Time: 18ms\n\n${api.responseSample}`,
    }));
  };

  const handleCopyEndpoint = (idx: number, path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>REST API Endpoints & Request Inspector</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                {apis.length} Endpoints
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              OpenAPI-compliant REST endpoints with request/response schemas
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="p-4 space-y-3">
        {apis.map((api, idx) => {
          const isExpanded = expandedIndex === idx;
          const res = testResponse[idx];

          return (
            <div
              key={idx}
              className="bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden transition"
            >
              {/* Endpoint Header Row */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/50 transition"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-black border ${getMethodBadge(
                      api.method
                    )}`}
                  >
                    {api.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-200 truncate">{api.path}</span>
                  <span className="text-[11px] text-slate-400 hidden md:inline truncate">
                    — {api.description}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {api.authRequired ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>Bearer JWT</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyEndpoint(idx, api.path);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition"
                    title="Copy path"
                  >
                    {copied === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 space-y-3 font-mono text-xs animate-in fade-in duration-150">
                  <div className="text-[11px] text-slate-400 font-sans">{api.description}</div>

                  {api.requestBody && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-400">Request Payload (JSON):</div>
                      <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto">
                        <code>{api.requestBody}</code>
                      </pre>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">Response Sample:</div>
                      <button
                        onClick={() => handleTestCall(idx, api)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3" />
                        <span>Send Test Request</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto">
                      <code>{res || api.responseSample}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
