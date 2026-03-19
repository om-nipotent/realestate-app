/**
 * SellerDashboard — Premium Redesign
 * Stripe-style metrics, animated analytics, image gallery property list,
 * tab system with Framer Motion, AI price suggestion callout.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, Eye, TrendingUp, Home, Shield,
  CheckCircle2, Clock, AlertCircle, ArrowRight, ArrowUpRight,
  Building2, MessageSquare, Calendar, Sparkles, BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSellerProperties, deleteProperty } from '../../api/property.api';
import { getSellerInquiries } from '../../api/inquiry.api';
import { getSellerVisits } from '../../api/visit.api';
import { getSellerAnalytics, getMyVerificationStatus } from '../../api/verification.api';
import InquiryList from '../../components/dashboard/InquiryList';
import VisitCalendar from '../../components/dashboard/VisitCalendar';
import { formatPriceShort, getStatusBadgeClass } from '../../utils/formatters';
import toast from 'react-hot-toast';

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ to, duration = 900 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(to * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span>{val}</span>;
};

// ── Stripe-style metric card ──────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, sub, trend, color = 'text-primary-600 bg-primary-50', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="stat-card"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend != null && (
        <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <ArrowUpRight className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="stat-card__value font-display text-2xl font-bold text-gray-900">
      {value != null ? <Counter to={value} /> : '—'}
    </p>
    <p className="stat-card__label text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </motion.div>
);

// ── Verification Banner ───────────────────────────────────────────────────────
const VerificationBanner = ({ status }) => {
  if (status === 'verified') return null;

  if (status === 'pending') return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-5 mb-6 text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12" />
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <p className="font-bold">Verification Under Review</p>
          <p className="text-amber-100 text-sm mt-0.5">Your documents are being reviewed. Usually 24h.</p>
        </div>
      </div>
    </motion.div>
  );

  if (status === 'rejected') return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-5 mb-6 text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12" />
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Verification Rejected</p>
          <p className="text-red-100 text-sm mt-0.5">Re-submit clearer documents to get the Verified badge.</p>
        </div>
        <Link to="/seller/verification" className="flex-shrink-0 bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5">
          Re-submit <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 p-5 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800">Get your Verified Seller badge</p>
          <p className="text-gray-500 text-sm mt-0.5">Upload your ID — once approved, a Verified badge appears on all your listings, boosting buyer trust.</p>
        </div>
        <Link to="/seller/verification" className="flex-shrink-0 btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
          <Shield className="w-4 h-4" /> Upload Documents <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [inquiries,  setInquiries]  = useState([]);
  const [visits,     setVisits]     = useState([]);
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState('properties');
  const [deletingId, setDeletingId] = useState(null);
  const [verRecord,  setVerRecord]  = useState(undefined);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propRes, inqRes, visRes, analyticsRes, verRes] = await Promise.allSettled([
        getSellerProperties({ limit: 20 }),
        getSellerInquiries({ limit: 10 }),
        getSellerVisits({ limit: 10 }),
        getSellerAnalytics(),
        getMyVerificationStatus(),
      ]);
      if (propRes.status      === 'fulfilled') setProperties(propRes.value.data || []);
      if (inqRes.status       === 'fulfilled') setInquiries(inqRes.value.data || []);
      if (visRes.status       === 'fulfilled') setVisits(visRes.value.data || []);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
      setVerRecord(verRes.status === 'fulfilled' ? (verRes.value.data || null) : null);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success('Property deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
    setDeletingId(null);
  };

  const overview = analytics?.overview || {};
  const tabs = [
    { key: 'properties', label: 'My Listings',    count: properties.length },
    { key: 'inquiries',  label: 'Inquiries',       count: inquiries.filter((i) => i.status === 'unread').length },
    { key: 'visits',     label: 'Visit Requests',  count: visits.filter((v) => v.status === 'pending').length },
  ];

  const metrics = [
    { icon: Building2,    label: 'Total Listings',   value: overview.totalProperties,   color: 'text-orange-600 bg-orange-50',  delay: 0.08 },
    { icon: Eye,          label: 'Total Views',       value: overview.totalViews,        color: 'text-blue-600 bg-blue-50',      delay: 0.14 },
    { icon: MessageSquare,label: 'Total Inquiries',   value: overview.totalInquiries,    color: 'text-purple-600 bg-purple-50',  delay: 0.20 },
    { icon: Calendar,     label: 'Visit Requests',    value: overview.totalVisits,       color: 'text-green-600 bg-green-50',    delay: 0.26 },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-2 border-white/20"
                style={{ background: 'rgba(192,38,211,0.3)', backdropFilter: 'blur(10px)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </motion.div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-white font-display"
                >
                  {user?.name?.split(' ')[0]}'s Seller Hub
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/60 text-sm mt-0.5"
                >
                  Manage listings, track performance & grow your portfolio
                </motion.p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/seller/properties/create" className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-50 transition-colors">
                <Plus className="w-4 h-4" /> List New Property
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        <VerificationBanner status={verRecord === undefined ? undefined : verRecord?.status === 'approved' ? 'verified' : verRecord?.status} />

        {/* ── Metrics Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-4 relative z-10">
          {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>

        {/* ── AI Price Suggestion callout ───────────────────────────────── */}
        {overview.avgListingPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-5 mb-6 flex items-center gap-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d0d1a, #1a0a2e)' }}
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600 rounded-full blur-3xl -mr-12 -mt-12" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500 rounded-full blur-2xl -ml-8 -mb-8" />
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0 relative z-10"
            >
              <Sparkles className="w-6 h-6 text-primary-400" />
            </motion.div>
            <div className="flex-1 relative z-10">
              <p className="text-white font-bold">AI Smart Price Insight</p>
              <p className="text-white/60 text-sm mt-0.5">
                Your average listing price is <span className="text-primary-400 font-bold">{formatPriceShort(overview.avgListingPrice)}</span>. 
                Use the AI prediction engine on individual listings to optimise your pricing strategy.
              </p>
            </div>
            <Link to="/properties" className="flex-shrink-0 relative z-10 flex items-center gap-1.5 bg-primary-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors">
              Explore AI <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 w-fit shadow-sm border border-gray-100 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 ${
                activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="seller-tab-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)', zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {activeTab === 'properties' && (
              <div>
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4 border border-gray-100">
                        <div className="w-20 h-16 bg-gray-100 rounded-xl" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-100 rounded w-1/3" />
                          <div className="h-3 bg-gray-50 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl mb-4">
                      <Home className="w-10 h-10 text-primary-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Properties Yet</h3>
                    <p className="text-gray-400 text-sm mb-6">Start building your portfolio</p>
                    <Link to="/seller/properties/create" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> List Your First Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {properties.map((property, idx) => {
                      const maxViews = Math.max(...properties.map((p) => p.views || 0), 1);
                      const viewPct  = ((property.views || 0) / maxViews) * 100;
                      return (
                        <motion.div
                          key={property._id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-200 group"
                        >
                          {/* Thumbnail */}
                          <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {property.images?.[0]?.url ? (
                              <img src={property.images[0].url} alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-gray-800 text-sm truncate">{property.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(property.status)}`}>
                                {property.status}
                              </span>
                              {property.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">⭐ Featured</span>}
                              {verRecord?.status === 'approved'
                                ? <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                                : verRecord?.status === 'pending'
                                ? <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold"><Clock className="w-3 h-3" /> Pending</span>
                                : null
                              }
                            </div>
                            <p className="text-xs text-gray-500 capitalize">{property.location?.city} · {property.propertyType} · {property.bedrooms} BHK</p>
                            <div className="flex items-center gap-4 mt-1.5">
                              <span className="text-sm font-bold text-primary-600">{formatPriceShort(property.price)}</span>
                              <div className="flex items-center gap-1.5 flex-1 max-w-32">
                                <Eye className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <div className="progress-bar-outer flex-1">
                                  <motion.div
                                    className="progress-bar-inner bg-gradient-to-r from-primary-400 to-primary-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${viewPct}%` }}
                                    transition={{ delay: 0.5 + idx * 0.05, duration: 0.8 }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{property.views || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions — hover reveal */}
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link to={`/properties/${property._id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/seller/properties/${property._id}/edit`}
                              className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(property._id, property.title)}
                              disabled={deletingId === property._id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'inquiries' && <InquiryList inquiries={inquiries} role="seller" onUpdate={loadData} loading={loading} />}
            {activeTab === 'visits'    && <VisitCalendar visits={visits}     role="seller" onUpdate={loadData} loading={loading} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerDashboard;
