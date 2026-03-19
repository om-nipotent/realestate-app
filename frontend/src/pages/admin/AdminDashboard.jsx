/**
 * AdminDashboard — Premium Redesign
 * Command-bar style header, animated stat grid, pulsing fraud alert,
 * animated platform progress bars, staggered recent-data cards.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Building2, Shield, Eye, AlertTriangle, Activity,
  CheckCircle2, Clock, Star, TrendingUp, MessageSquare,
  Calendar, RefreshCw, Settings, BarChart3, UserCheck, ArrowUpRight
} from 'lucide-react';
import { getDashboardStats, getPlatformActivity, togglePropertyFeaturedAdmin } from '../../api/admin.api';
import { formatRelativeTime, getStatusBadgeClass, formatPriceShort } from '../../utils/formatters';
import toast from 'react-hot-toast';

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ to, duration = 800 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    const start = Date.now();
    const tick  = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(to * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span>{val?.toLocaleString('en-IN') ?? 0}</span>;
};

// ── Premium Stat Card ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub, trend, delay = 0, topBar }) => {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   bar: '#C026D3' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  bar: '#22c55e' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: '#a855f7' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: '#f97316' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600',    bar: '#ef4444' },
    gray:   { bg: 'bg-gray-50',   text: 'text-gray-600',   bar: '#6b7280' },
    pink:   { bg: 'bg-premium-50',   text: 'text-premium-600',   bar: '#D97706' },
    teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   bar: '#14b8a6' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card overflow-hidden"
    >
      {/* Top color bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.6 }}
        style={{ background: c.bar, height: 3, transformOrigin: 'left', borderRadius: '0 0 4px 4px' }}
        className="absolute top-0 left-0 right-0"
      />
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            <ArrowUpRight className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 font-display">
        <Counter to={value} />
      </p>
      <p className="text-sm text-gray-600 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [stats,      setStats]      = useState(null);
  const [activity,   setActivity]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh,setLastRefresh]= useState(new Date());

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        getDashboardStats(),
        getPlatformActivity({ limit: 8 }),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
      setLastRefresh(new Date());
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleToggleFeatured = async (id, current) => {
    try {
      await togglePropertyFeaturedAdmin(id);
      toast.success(current ? 'Removed from featured' : 'Marked as featured');
      load(false);
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded-xl w-48 mb-8 skeleton" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const overview = stats?.stats || {};
  const recent   = stats?.recentActivity || {};
  const verifiedPct = overview.totalUsers     > 0 ? Math.round((overview.verifiedUsers    / overview.totalUsers)     * 100) : 0;
  const activePct   = overview.totalProperties> 0 ? Math.round((overview.activeProperties / overview.totalProperties)* 100) : 0;

  const userStats = [
    { icon: Users,     label: 'Total Users',    value: overview.totalUsers,    color: 'blue',   sub: `+${overview.newUsersThisMonth || 0} this month`, delay: 0.06 },
    { icon: UserCheck, label: 'Verified Users', value: overview.verifiedUsers, color: 'green',  sub: `${verifiedPct}% verified`,                       delay: 0.10 },
    { icon: Users,     label: 'Total Buyers',   value: overview.totalBuyers,   color: 'teal',                                                           delay: 0.14 },
    { icon: Users,     label: 'Total Sellers',  value: overview.totalSellers,  color: 'purple',                                                          delay: 0.18 },
  ];

  const propertyStats = [
    { icon: Building2,    label: 'Total Properties', value: overview.totalProperties,  color: 'orange', sub: `+${overview.newPropertiesThisMonth || 0} this month`, delay: 0.22 },
    { icon: CheckCircle2, label: 'Active Listings',  value: overview.activeProperties, color: 'green',  sub: `${activePct}% of total`,                              delay: 0.26 },
    { icon: Star,         label: 'Featured',         value: overview.featuredProperties,color: 'pink',  sub: 'Shown on homepage',                                   delay: 0.30 },
    { icon: MessageSquare,label: 'Total Inquiries',  value: overview.totalInquiries,   color: 'gray',                                                               delay: 0.34 },
  ];

  const platformBars = [
    { label: 'User Verification Rate', value: overview.verifiedUsers,    max: Math.max(overview.totalUsers, 1),      color: 'bg-green-500',   display: `${overview.verifiedUsers || 0}/${overview.totalUsers || 0}` },
    { label: 'Active Listings Rate',   value: overview.activeProperties,  max: Math.max(overview.totalProperties, 1), color: 'bg-primary-500', display: `${overview.activeProperties || 0}/${overview.totalProperties || 0}` },
    { label: 'Featured Properties',    value: overview.featuredProperties,max: Math.max(overview.activeProperties, 1),color: 'bg-premium-500',    display: `${overview.featuredProperties || 0} featured` },
    { label: 'Total Inquiries',        value: overview.totalInquiries,    max: Math.max(overview.totalInquiries, 1),  color: 'bg-purple-500',  display: (overview.totalInquiries || 0).toLocaleString('en-IN') },
    { label: 'Total Visits',           value: overview.totalVisits,       max: Math.max(overview.totalVisits, 1),     color: 'bg-orange-500',  display: (overview.totalVisits || 0).toLocaleString('en-IN') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Command Bar Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Admin Command Center</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live · Last updated {formatRelativeTime(lastRefresh)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => load(true)}
              disabled={refreshing}
              className="btn-ghost py-2 px-3 text-sm flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </motion.button>
            <Link to="/admin/verifications" className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Verifications
              {(overview.pendingVerifications || 0) > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-pulse-ring"
                >
                  {overview.pendingVerifications}
                </motion.span>
              )}
            </Link>
            <Link to="/admin/properties" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Properties
            </Link>
            <Link to="/admin/settings" className="btn-ghost py-2 px-3 text-sm">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* ── Fraud Alert Banner (only when relevant) ──────────────── */}
        <AnimatePresence>
          {(overview.pendingVerifications || 0) > 0 && (
            <motion.div
              key="fraud-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="rounded-2xl p-4 border-2 border-red-200 bg-red-50 flex items-center gap-4"
                style={{ animation: 'glowPulse 2s ease-in-out infinite' }}>
                <div className="bg-red-100 text-red-600 p-2.5 rounded-xl flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-800 text-sm">
                    {overview.pendingVerifications} Verification{overview.pendingVerifications > 1 ? 's' : ''} Pending Review
                  </p>
                  <p className="text-red-600 text-xs mt-0.5">Users are waiting for identity approval. Please review as soon as possible.</p>
                </div>
                <Link to="/admin/verifications?status=pending"
                  className="flex-shrink-0 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5">
                  Review Now <Shield className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── User Stats ───────────────────────────────────────────── */}
        <div className="mb-3">
          <p className="dash-section-label"><Users className="w-3.5 h-3.5" /> User Statistics</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userStats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        </div>

        {/* ── Property Stats ───────────────────────────────────────── */}
        <div className="mb-8">
          <p className="dash-section-label"><Building2 className="w-3.5 h-3.5" /> Property & Platform</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyStats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        </div>

        {/* ── Quick Action Tiles ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { to: '/admin/verifications?status=pending', icon: Clock,         label: 'Pending Verifications', count: overview.pendingVerifications, bg: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
            { to: '/admin/properties?status=active',     icon: Building2,     label: 'Manage Properties',    count: overview.activeProperties,      bg: 'bg-blue-50 text-blue-600 hover:bg-blue-100'       },
            { to: '/admin/properties?featured=true',     icon: Star,          label: 'Featured Listings',    count: overview.featuredProperties,    bg: 'bg-premium-50 text-premium-600 hover:bg-premium-100'       },
            { to: '/admin/properties?fraud=true',        icon: AlertTriangle, label: 'Fraud Review',         count: 0,                              bg: 'bg-red-50 text-red-600 hover:bg-red-100'          },
          ].map(({ to, icon: Icon, label, count, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.38 + i * 0.06 }}>
              <Link to={to} className={`card p-4 cursor-pointer flex items-center gap-3 ${bg} transition-colors duration-200`}>
                <div className="p-2 rounded-xl bg-white/50">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  {count > 0 && <p className="text-xs opacity-80">{count} items</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Main Content Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Platform Summary with animated bars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-5"
          >
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4 text-primary-600" /> Platform Summary
            </h3>
            <div className="space-y-5">
              {platformBars.map(({ label, value, max, color, display }, i) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                    <span className="font-medium">{label}</span>
                    <span className="font-bold text-gray-800">{display}</span>
                  </div>
                  <div className="progress-bar-outer">
                    <motion.div
                      className={`progress-bar-inner ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }}
                      transition={{ delay: 0.55 + i * 0.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Verifications */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-yellow-500" /> Pending Verifications
              </h3>
              <Link to="/admin/verifications" className="text-xs text-primary-600 font-semibold hover:text-primary-800">View All →</Link>
            </div>
            {!recent.recentVerifications?.length ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">All clear! No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.recentVerifications.map((v, i) => (
                  <motion.div
                    key={v._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.06 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)' }}>
                      {v.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{v.user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{v.user?.role} · {formatRelativeTime(v.createdAt)}</p>
                    </div>
                    <Link to="/admin/verifications"
                      className="text-xs text-primary-600 font-bold bg-primary-50 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors whitespace-nowrap">
                      Review
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* New Users */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.60 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" /> New Users
              </h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                +{overview.newUsersThisMonth || 0} this month
              </span>
            </div>
            {!recent.recentUsers?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent users</p>
            ) : (
              <div className="space-y-2">
                {recent.recentUsers.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)' }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize truncate">{u.role} · {u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(u.verificationStatus)}`}>
                      {u.verificationStatus}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Properties with Featured Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="card p-5 lg:col-span-3"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-orange-500" /> Recent Listings
                <span className="text-xs text-gray-400 font-normal">— click ⭐ to feature on homepage</span>
              </h3>
              <Link to="/admin/properties" className="text-xs text-primary-600 font-semibold hover:text-primary-800">Manage All →</Link>
            </div>
            {!recent.recentProperties?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent listings</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recent.recentProperties.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-gray-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {p.images?.[0]?.url
                        ? <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 capitalize truncate">{p.seller?.name} · {p.location?.city}</p>
                      <p className="text-xs font-bold text-primary-600">{formatPriceShort(p.price)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleToggleFeatured(p._id, p.featured)}
                        className={`p-1 rounded-lg transition-colors ${p.featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                        title={p.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
