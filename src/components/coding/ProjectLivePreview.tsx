import React, { useState } from 'react';
import { FullStackProject } from '../../types/index.ts';
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  ShieldCheck,
  Check,
  ExternalLink,
  Award,
} from 'lucide-react';

interface ProjectLivePreviewProps {
  project: FullStackProject;
}

export const ProjectLivePreview: React.FC<ProjectLivePreviewProps> = ({ project }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeRoute, setActiveRoute] = useState(
    project.interactivePreview?.routes?.[0]?.path || '/dashboard'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Initial mock items from project
  const initialRecords =
    project.interactivePreview?.mockRecords?.students ||
    project.interactivePreview?.mockRecords?.inventory ||
    project.interactivePreview?.mockRecords?.courses ||
    [
      { id: '1', title: 'Primary Item A', status: 'Active', category: 'Standard', metric: '98%' },
      { id: '2', title: 'Secondary Item B', status: 'Active', category: 'Advanced', metric: '84%' },
      { id: '3', title: 'Auxiliary Item C', status: 'Pending', category: 'General', metric: '72%' },
    ];

  const [records, setRecords] = useState<any[]>(initialRecords);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSecondary, setNewItemSecondary] = useState('');
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newRecord = {
      id: Date.now().toString(),
      name: newItemTitle,
      title: newItemTitle,
      customer: newItemTitle,
      roll: 'REC-' + Math.floor(100 + Math.random() * 900),
      class: newItemSecondary || 'Class 10-A',
      stock: parseInt(newItemSecondary) || 50,
      due: parseInt(newItemSecondary) || 350,
      students: 120,
      price: 3500,
      lessons: 16,
      gpa: 3.8,
      status: 'Active',
    };

    setRecords([newRecord, ...records]);
    setNewItemTitle('');
    setNewItemSecondary('');
    setShowAddModal(false);
    showToast('Record added successfully to virtual database!');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
    showToast('Record deleted from simulated store.');
  };

  const handleReset = () => {
    setRecords(initialRecords);
    setCertificateIssued(false);
    showToast('Reset sandbox to default seed records.');
  };

  const filteredRecords = records.filter((r) => {
    const text = (r.name || r.title || r.customer || '').toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[400px]';
      case 'tablet':
        return 'max-w-[740px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 space-y-4">
      {/* Device Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Interactive Live Sandbox Preview</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Test clicks, forms & CRUD operations in real time
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 rounded-xl p-1 border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (740px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (400px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            title="Reset Sandbox State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated Browser Frame */}
      <div className="flex justify-center transition-all duration-300">
        <div
          className={`${getViewportWidth()} bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col min-h-[520px] transition-all`}
        >
          {/* Mock Browser Header Bar */}
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="px-3 py-0.5 bg-white rounded-md border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center gap-1">
              <span>https://{project.slug || 'app'}.local</span>
              <span className="text-emerald-600 font-bold font-sans">✓ SSL</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Sandbox Mode</div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{toastMessage}</span>
              </div>
            </div>
          )}

          {/* Applet Top Navbar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs">
                {project.name ? project.name[0] : 'A'}
              </div>
              <div>
                <div className="font-bold text-xs truncate leading-tight">{project.name}</div>
                <div className="text-[10px] text-blue-300">Live Web Applet</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {project.interactivePreview?.routes?.map((r) => {
                const isActive = activeRoute === r.path;
                return (
                  <button
                    key={r.path}
                    onClick={() => setActiveRoute(r.path)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Applet Body Content */}
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto bg-slate-50/50">
            {/* KPI Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {project.interactivePreview?.adminStats?.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1"
                >
                  <div className="text-[11px] font-semibold text-slate-500 truncate">{stat.label}</div>
                  <div className="text-base sm:text-lg font-black text-slate-900">{stat.value}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Interactive Work Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search records live..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Record</span>
                  </button>

                  {/* Contextual Action Button */}
                  {project.slug?.includes('lms') || project.name?.toLowerCase().includes('course') ? (
                    <button
                      onClick={() => {
                        setCertificateIssued(true);
                        showToast('Certificate generated with unique verification serial!');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Issue Certificate</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Certificate Banner (if triggered) */}
              {certificateIssued && (
                <div className="m-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-amber-900">
                        Official Certificate of Completion Issued
                      </div>
                      <div className="text-[11px] text-amber-700">
                        Serial: <span className="font-mono font-bold">CERT-2026-9874X</span> • Verified on Blockchain / Database
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg">
                    Verified
                  </span>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Record / Title</th>
                      <th className="p-3">Identifier / Info</th>
                      <th className="p-3">Metrics / Value</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((item) => {
                        const title = item.name || item.title || item.customer || 'Item #' + item.id;
                        const sub = item.roll || item.phone || item.instructor || item.category || 'STD-01';
                        const metric =
                          item.gpa !== undefined
                            ? `GPA ${item.gpa}`
                            : item.stock !== undefined
                            ? `Stock: ${item.stock}`
                            : item.due !== undefined
                            ? `Due: ৳${item.due}`
                            : item.metric || 'Active';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-semibold text-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                                  {title[0]}
                                </div>
                                <span>{title}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-600 text-[11px]">{sub}</td>
                            <td className="p-3 font-semibold text-blue-600">{metric}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>{item.status || 'Active'}</span>
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteRecord(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                          No matching records found. Click &quot;Add Record&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900">Add New Record to Database</h3>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Mahmud or New Product"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Detail / Secondary Info</label>
                <input
                  type="text"
                  placeholder="e.g. Class 10-A, or Phone number, or Stock"
                  value={newItemSecondary}
                  onChange={(e) => setNewItemSecondary(e.target.value)}
                  className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
