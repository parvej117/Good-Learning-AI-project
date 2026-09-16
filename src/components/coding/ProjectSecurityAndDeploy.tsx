import React, { useState } from 'react';
import { FullStackProject } from '../../types/index.ts';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
  Terminal,
  Copy,
  Check,
  FileText,
  TestTube,
} from 'lucide-react';

interface ProjectSecurityAndDeployProps {
  project: FullStackProject;
}

export const ProjectSecurityAndDeploy: React.FC<ProjectSecurityAndDeployProps> = ({ project }) => {
  const [activeDeploy, setActiveDeploy] = useState<'vercel' | 'cloudRun' | 'docker' | 'vps'>('cloudRun');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Change Summary Card */}
      {project.changeSummary && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl text-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">Project Change Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <div className="font-semibold text-emerald-400">✨ Features Implemented:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {project.changeSummary.featuresAdded.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <div className="font-semibold text-blue-400">🚀 Next Steps to Run:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                {project.changeSummary.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Security Audit Checklist */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl text-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Production Security & Hardening Audit</h3>
            <p className="text-[11px] text-slate-400">
              OWASP Top 10 compliance and architectural protection layers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {project.securityChecks?.map((check, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-100">{check.item}</div>
                <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                  {check.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Guides */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl text-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Production Deployment Assistant</h3>
              <p className="text-[11px] text-slate-400">
                Ready commands and configuration recipes for your preferred cloud host
              </p>
            </div>
          </div>

          {/* Deployment platform picker */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveDeploy('cloudRun')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeDeploy === 'cloudRun'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cloud Run
            </button>
            <button
              onClick={() => setActiveDeploy('vercel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeDeploy === 'vercel'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vercel
            </button>
            <button
              onClick={() => setActiveDeploy('docker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeDeploy === 'docker'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Docker
            </button>
            <button
              onClick={() => setActiveDeploy('vps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeDeploy === 'vps'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VPS / Linux
            </button>
          </div>
        </div>

        {/* Selected Deploy Guide */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Terminal / Shell Commands:</span>
            <button
              onClick={() =>
                handleCopy(project.deploymentGuides[activeDeploy] || '', activeDeploy)
              }
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 text-slate-300 transition"
            >
              {copied === activeDeploy ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied === activeDeploy ? 'Copied' : 'Copy Commands'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
            <code>{project.deploymentGuides[activeDeploy] || '# Deployment configuration'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
