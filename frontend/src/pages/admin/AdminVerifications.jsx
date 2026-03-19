import React, { useEffect, useState } from 'react';
import {
  Shield, CheckCircle2, XCircle, Clock, Eye, RefreshCw,
  User, Calendar, CreditCard, Image, X, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAllVerifications, approveVerification, rejectVerification } from '../../api/verification.api';
import toast from 'react-hot-toast';

// Status badge helper
const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: 'bg-amber-100 text-amber-700', label: 'Pending Review', icon: Clock },
    approved: { cls: 'bg-primary-900 text-primary-300 border border-primary-700', label: 'Approved', icon: CheckCircle2 },
    rejected: { cls: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {cfg.label}
    </span>
  );
};

// Detail modal
const DetailModal = ({ v, onClose, onApprove, onReject, loading }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!v) return null;

  const handleReject = () => {
    if (!rejectionReason.trim()) return toast.error('Enter a rejection reason');
    onReject(v._id, rejectionReason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verification Details</h2>
            <p className="text-sm text-gray-400 mt-0.5">Review submitted identity documents</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seller Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seller Information</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Full Name</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{v.seller?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${v.userRole === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'}`}>
                    {v.userRole === 'buyer' ? 'Buyer' : 'Seller'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-semibold text-gray-800 truncate">{v.seller?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="font-semibold text-gray-800">{v.seller?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Submitted</p>
                <p className="font-semibold text-gray-800">
                  {new Date(v.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Aadhar Number */}
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-2">Aadhar Number</p>
            <p className="text-2xl font-mono font-bold text-primary-700 tracking-widest">
              {v.aadharNumber?.replace(/(\d{4})(?=\d)/g, '$1 ')}
            </p>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Uploaded Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aadhar Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600">Aadhar Card</p>
                  <p className="text-xs text-gray-400 truncate">{v.documents?.aadharCard?.filename}</p>
                </div>
                {v.documents?.aadharCard?.url?.match(/\.(jpg|jpeg|png)$/i) ? (
                  <img
                    src={v.documents.aadharCard.url}
                    alt="Aadhar Card"
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center bg-gray-50">
                    <Image className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="p-3">
                  <a
                    href={v.documents?.aadharCard?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View / Download
                  </a>
                </div>
              </div>

              {/* Selfie */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-600">Selfie with Aadhar</p>
                  <p className="text-xs text-gray-400 truncate">{v.documents?.selfieWithAadhar?.filename}</p>
                </div>
                {v.documents?.selfieWithAadhar?.url?.match(/\.(jpg|jpeg|png)$/i) ? (
                  <img
                    src={v.documents.selfieWithAadhar.url}
                    alt="Selfie with Aadhar"
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-32 flex items-center justify-center bg-gray-50">
                    <Image className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="p-3">
                  <a
                    href={v.documents?.selfieWithAadhar?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View / Download
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection reason (if rejected) */}
          {v.status === 'rejected' && v.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{v.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          {v.status === 'pending' && (
            <div className="border-t border-gray-100 pt-5">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => onApprove(v._id)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40" style={{ background: '#C026D3', color: '#ffffff' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Approve Verification'}
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Enter Rejection Reason <span className="text-red-500">*</span></p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Document is blurry, Aadhar number mismatch, Selfie not matching..."
                    className="form-input resize-none"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={loading || !rejectionReason.trim()}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-95 disabled:opacity-60"
                    >
                      {loading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {v.status === 'approved' && (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(192,38,211,0.08)', border: '1px solid rgba(192,38,211,0.25)' }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#C026D3' }} />
              <p className="text-sm font-medium" style={{ color: '#C026D3' }}>This verification has been approved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Admin Verifications Page ─────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All Requests' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  const load = async (tab = activeTab, p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (tab !== 'all') params.status = tab;
      const res = await getAllVerifications(params);
      setVerifications(res.data || []);
      setMeta(res.meta || null);
      setPage(p);

      if (p === 1) {
        const [a, b, c, d] = await Promise.allSettled([
          getAllVerifications({ limit: 1 }),
          getAllVerifications({ limit: 1, status: 'pending' }),
          getAllVerifications({ limit: 1, status: 'approved' }),
          getAllVerifications({ limit: 1, status: 'rejected' }),
        ]);
        setCounts({
          all:      a.status === 'fulfilled' ? (a.value.meta?.total || 0) : 0,
          pending:  b.status === 'fulfilled' ? (b.value.meta?.total || 0) : 0,
          approved: c.status === 'fulfilled' ? (c.value.meta?.total || 0) : 0,
          rejected: d.status === 'fulfilled' ? (d.value.meta?.total || 0) : 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load verifications');
    }
    setLoading(false);
  };

  useEffect(() => { load(activeTab, 1); }, [activeTab]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await approveVerification(id);
      toast.success('✅ Verification approved!');
      setSelected(null);
      load(activeTab, page);
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
    setActionLoading(false);
  };

  const handleReject = async (id, reason) => {
    setActionLoading(true);
    try {
      await rejectVerification(id, reason);
      toast.success('Verification rejected.');
      setSelected(null);
      load(activeTab, page);
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
    setActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary-600" /> Identity Verifications
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Review and approve seller & buyer identity documents</p>
          </div>
          <button
            onClick={() => load(activeTab, page)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Count cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'all', label: 'Total', color: 'bg-gray-50 border-gray-200 text-gray-700' },
            { key: 'pending', label: 'Pending', color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { key: 'approved', label: 'Approved', color: 'bg-primary-50 border-primary-200 text-primary-600' },
            { key: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200 text-red-700' },
          ].map(({ key, label, color }) => (
            <div key={key} className={`rounded-xl border p-4 ${color}`}>
              <p className="text-2xl font-bold">{counts[key]}</p>
              <p className="text-xs font-semibold opacity-70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No verification requests found</p>
              <p className="text-gray-300 text-sm mt-1">
                {activeTab === 'pending' ? 'No sellers have submitted documents yet' : `No ${activeTab} verifications`}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-surface-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="col-span-3">Seller</div>
                <div className="col-span-3">Aadhar Number</div>
                <div className="col-span-2">Submitted</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {/* Rows */}
              {verifications.map((v) => (
                <div key={v._id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {v.seller?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-800 truncate">{v.seller?.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${v.userRole === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'}`}>
                            {v.userRole === 'buyer' ? 'Buyer' : 'Seller'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{v.seller?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm font-mono text-gray-700">
                      {v.aadharNumber?.replace(/(\d{4})(?=\d)/g, '$1 ')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">
                      {new Date(v.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => setSelected(v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, meta.total)} of {meta.total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => load(activeTab, page - 1)}
                      disabled={!meta.hasPrevPage}
                      className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => load(activeTab, page + 1)}
                      disabled={!meta.hasNextPage}
                      className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          v={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
