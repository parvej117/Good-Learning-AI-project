import React, { useState } from 'react';
import { ProjectDatabaseSchema } from '../../types/index.ts';
import { Database, Table, Key, Copy, Check, FileCode, Layers, Shield } from 'lucide-react';

interface ProjectDatabaseViewProps {
  database: ProjectDatabaseSchema;
}

export const ProjectDatabaseView: React.FC<ProjectDatabaseViewProps> = ({ database }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'relationships' | 'schema_sql' | 'migration' | 'seeds'>('tables');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
      {/* Navigation Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Database Schema & Migration Builder</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {database.tables?.length || 0} Tables
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Normalized relational schema with migrations and seeders
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'tables' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tables ({database.tables?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'relationships' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Relationships
          </button>
          <button
            onClick={() => setActiveTab('schema_sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'schema_sql' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Schema DDL
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'migration' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Migration Code
          </button>
          <button
            onClick={() => setActiveTab('seeds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'seeds' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Seed Data
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        {/* Tab 1: Tables List */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            {database.tables?.map((table) => (
              <div key={table.name} className="bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold text-xs text-blue-300">{table.name}</span>
                    <span className="text-[11px] text-slate-400">— {table.description}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                    {table.columns.length} columns
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Column Name</th>
                        <th className="p-2.5">Data Type</th>
                        <th className="p-2.5">Constraints</th>
                        <th className="p-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {table.columns.map((col) => {
                        const isPk = col.constraints?.toUpperCase().includes('PRIMARY KEY');
                        const isFk = col.constraints?.toUpperCase().includes('REFERENCES');

                        return (
                          <tr key={col.name} className="hover:bg-slate-900/40 transition">
                            <td className="p-2.5 font-bold text-slate-200 flex items-center gap-1.5">
                              {isPk && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                              {isFk && <Layers className="w-3 h-3 text-indigo-400 shrink-0" />}
                              <span>{col.name}</span>
                            </td>
                            <td className="p-2.5 text-cyan-300">{col.type}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300">
                                {col.constraints || 'NULLABLE'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-400 font-sans text-[11px]">{col.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Relationships */}
        {activeTab === 'relationships' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Foreign key constraints and entity relationships between tables:
            </div>
            {database.relationships?.map((rel, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-blue-400 font-bold">
                    {rel.fromTable}.{rel.fromColumn}
                  </span>
                  <span className="text-slate-500">━━━ ({rel.type}) ━━▶</span>
                  <span className="text-emerald-400 font-bold">
                    {rel.toTable}.{rel.toColumn}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                  CASCADE ON DELETE
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Schema DDL */}
        {activeTab === 'schema_sql' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">schema.sql (PostgreSQL / SQLite)</span>
              <button
                onClick={() => handleCopy(database.schemaSql, 'ddl')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 text-slate-300 transition"
              >
                {copied === 'ddl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'ddl' ? 'Copied' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <code>{database.schemaSql || '-- No schema SQL provided'}</code>
            </pre>
          </div>
        )}

        {/* Tab 4: Migration Code */}
        {activeTab === 'migration' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">database/migrations/001_create_tables.ts</span>
              <button
                onClick={() => handleCopy(database.migrationCode, 'migration')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 text-slate-300 transition"
              >
                {copied === 'migration' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'migration' ? 'Copied' : 'Copy Migration'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              <code>{database.migrationCode || '// Migration code'}</code>
            </pre>
          </div>
        )}

        {/* Tab 5: Seed Data */}
        {activeTab === 'seeds' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-mono">database/seeders/demo_data.sql</span>
              <button
                onClick={() => handleCopy(database.seedDataSql, 'seeds')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex items-center gap-1 text-slate-300 transition"
              >
                {copied === 'seeds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'seeds' ? 'Copied' : 'Copy Seeds'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
              <code>{database.seedDataSql || '-- Seed data script'}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
