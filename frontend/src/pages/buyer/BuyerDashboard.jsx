/**
 * BuyerDashboard — Premium Redesign
 * Features: gradient header, animated stat counters, visual verification timeline,
 * smooth tab transitions with Framer Motion, staggered card reveals.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, MessageSquare, Calendar, Shield, Search, TrendingUp,
  Clock, AlertCircle, CheckCircle2, Heart, Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBuyerInquiries } from '../../api/inquiry.api';
import { getBuyerVisits } from '../../api/visit.api';
import { getRecommendations, getMyVerificationStatus } from '../../api/verification.api';
import InquiryList from '../../components/dashboard/InquiryList';
import VisitCalendar from '../../components/dashboard/VisitCalendar';
import PropertyCard from '../../components/property/PropertyCard';
import { CardSkeleton } from '../../components/common/Loader';

// ── Animated counter for numbers ─────────────────────────────────────────────
const Counter = ({ to, duration = 1000 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (to === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setVal(Math.round(to * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span>{val}</span>;
};

// ── Verification status config ────────────────────────────────────────────────
const VER_CONFIG = {
  approved: {
    icon: CheckCircle2, bg: 'from-green-500 to-emerald-600',
    text: 'Identity Verified', sub: 'Full access enabled', cta: null, ctaTo: null,
  },
  pending: {
    icon: Clock, bg: 'from-amber-400 to-orange-500',
    text: 'Under Review', sub: 'Documents submitted — usually 24h', cta: 'Check Status', ctaTo: '/buyer/verification',
  },
  rejected: {
    icon: AlertCircle, bg: 'from-red-500 to-rose-600',
    text: 'Documents Rejected', sub: 'Please re-upload clearer images', cta: 'Re-submit', ctaTo: '/buyer/verification',
  },
  unsubmitted: {
    icon: Shield, bg: 'from-primary-500 to-primary-700',
    text: 'Verify Your Identity', sub: 'Unlock scheduling, inquiries and more', cta: 'Verify Now', ctaTo: '/buyer/verification',
  },
};

// ── Step progress indicator ───────────────────────────────────────────────────
const VerSteps = ({ status }) => {
  const steps = [
    { key: 'submit',  label: 'Submit Docs' },
    { key: 'review',  label: 'Under Review' },
    { key: 'verified',label: 'Verified' },
  ];
  const activeIdx = status === 'approved' ? 2 : status === 'pending' ? 1 : 0;
  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1 min-w-0">
            <motion.div
              animate={{ scale: i === activeIdx ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.6, repeat: i === activeIdx && status !== 'approved' ? Infinity : 0, repeatDelay: 1.5 }}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                i < activeIdx  ? 'bg-green-500 border-green-500 text-white' :
                i === activeIdx ? 'bg-primary-500 border-primary-500 text-white' :
                'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {i < activeIdx ? '✓' : i + 1}
            </motion.div>
            <span className={`text-[9px] font-medium text-center leading-tight ${i <= activeIdx ? 'text-gray-700' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 transition-all duration-700 ${i < activeIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inquiries');
  const [verRecord, setVerRecord] = useState(undefined);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [inquiryRes, visitRes, recRes, verRes] = await Promise.allSettled([
          getBuyerInquiries({ limit: 10 }),
          getBuyerVisits({ limit: 10 }),
          getRecommendations(4),
          getMyVerificationStatus(),
        ]);
        if (inquiryRes.status === 'fulfilled') setInquiries(inquiryRes.value.data || []);
        if (visitRes.status   === 'fulfilled') setVisits(visitRes.value.data || []);
        if (recRes.status     === 'fulfilled') setRecommendations(recRes.value.data || []);
        setVerRecord(verRes.status === 'fulfilled' ? (verRes.value.data || null) : null);
      } catch {}
      setLoading(false);
    };
    loadData();
  }, []);

  const verStatus = verRecord?.status;
  const verCfg    = VER_CONFIG[verStatus] || VER_CONFIG.unsubmitted;
  const VerIcon   = verCfg.icon;

  const stats = [
    { icon: MessageSquare, label: 'Inquiries Sent',  value: inquiries.length,                                   color: 'text-blue-600 bg-blue-50',    glow: 'rgba(59,130,246,0.15)' },
    { icon: Calendar,      label: 'Visits Scheduled', value: visits.length,                                     color: 'text-green-600 bg-green-50',  glow: 'rgba(16,185,129,0.15)' },
    { icon: Clock,         label: 'Pending Visits',   value: visits.filter((v) => v.status === 'pending').length, color: 'text-amber-600 bg-amber-50',  glow: 'rgba(245,158,11,0.15)' },
  ];

  const tabs = [
    { key: 'inquiries', label: 'My Inquiries', count: inquiries.length },
    { key: 'visits',    label: 'My Visits',    count: visits.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Hero Header ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C026D3 0%, #A21CAF 50%, #86198F 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-10 w-48 h-48 bg-white rounded-full blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
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
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/75 text-sm mt-0.5"
                >
                  Here's your activity overview
                </motion.p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/properties" className="flex items-center gap-1.5 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold rounded-xl border border-white/30 hover:bg-white/25 transition-colors">
                <Search className="w-4 h-4" /> Browse Properties
              </Link>
              {verStatus !== 'approved' && (
                <Link to="/buyer/verification" className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary-700 text-sm font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
                  <Shield className="w-4 h-4" /> {verStatus === 'pending' ? 'View Status' : 'Verify Identity'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 -mt-6 relative z-10">
          {stats.map(({ icon: Icon, label, value, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.1 }}
              className="stat-card"
              style={{ boxShadow: `0 4px 20px ${glow}, 0 1px 4px rgba(0,0,0,0.04)` }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="stat-card__value">{loading ? '–' : <Counter to={value} />}</p>
                  <p className="stat-card__label">{label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Tabs */}
          <div className="lg:col-span-2">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5 w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 ${
                    activeTab === tab.key ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {activeTab === tab.key && (
                    <motion.span
                      layoutId="buyer-tab-pill"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22 }}
              >
                {activeTab === 'inquiries'
                  ? <InquiryList inquiries={inquiries} role="buyer" loading={loading} />
                  : <VisitCalendar visits={visits} role="buyer" loading={loading} />
                }
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Verification Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${verCfg.bg.split(' ')[1] === 'from-green-500' ? '#22c55e, #059669' : verCfg.bg.split(' ')[1] === 'from-amber-400' ? '#f59e0b, #f97316' : verCfg.bg.split(' ')[1] === 'from-red-500' ? '#ef4444, #e11d48' : '#C026D3, #86198F'})` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="flex items-center gap-3 mb-2">
                <VerIcon className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-bold">{verCfg.text}</p>
                  <p className="text-xs opacity-80">{verCfg.sub}</p>
                </div>
              </div>
              <VerSteps status={verStatus} />
              {verCfg.cta && (
                <Link to={verCfg.ctaTo} className="mt-4 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors w-fit">
                  {verCfg.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="card p-5"
            >
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary-500" /> Quick Actions
              </h3>
              <div className="space-y-1">
                {[
                  { to: '/properties',              label: '🔍 Browse Properties',    sub: 'Discover new listings' },
                  { to: '/properties?sort=newest',  label: '🆕 Newest Listings',      sub: 'Just added today' },
                  { to: '/properties?sort=popular', label: '🔥 Popular Properties',   sub: 'Trending this week' },
                  { to: '/buyer/verification',       label: '🛡️ Verification Status', sub: verStatus || 'Not submitted' },
                ].map(({ to, label, sub }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{label}</p>
                      <p className="text-xs text-gray-400 capitalize">{sub}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Recommendations ──────────────────────────────────────────────── */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 font-display">
                <TrendingUp className="w-5 h-5 text-primary-600" /> Recommended for You
              </h2>
              <Link to="/properties" className="text-sm text-primary-600 font-semibold hover:text-primary-800 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading
                ? [1,2,3,4].map((i) => <CardSkeleton key={i} />)
                : recommendations.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <PropertyCard property={p} />
                    </motion.div>
                  ))
              }
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
