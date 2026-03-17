import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building2, Shield, Eye, AlertTriangle, Activity,
  CheckCircle2, Clock, Star, TrendingUp, MessageSquare,
  Calendar, RefreshCw, Settings, BarChart3, UserCheck
} from 'lucide-react';
import { getDashboardStats, getPlatformActivity, togglePropertyFeaturedAdmin } from '../../api/admin.api';
import { formatRelativeTime, getStatusBadgeClass, formatPriceShort } from '../../utils/formatters';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub, trend }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
    pink: 'bg-pink-50 text-pink-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString('en-IN') ?? 0}</p>
      <p className="text-sm text-gray-600 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

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
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const handleManualRefresh = () => load(true);

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const overview = stats?.stats || {};
  const recent = stats?.recentActivity || {};

  const verifiedPct = overview.totalUsers > 0
    ? Math.round((overview.verifiedUsers / overview.totalUsers) * 100)
    : 0;
  const activePct = overview.totalProperties > 0
    ? Math.round((overview.activeProperties / overview.totalProperties) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Housify Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Real-time platform overview · Last updated {formatRelativeTime(lastRefresh)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="btn-secondary py-2 px-3 text-sm flex items-center gap-1.5"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link to="/admin/verifications" className="btn-secondary py-2 px-4 text-sm">
              <Shield className="w-4 h-4 inline mr-1.5" />
              Verifications
              {overview.pendingVerifications > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {overview.pendingVerifications}
                </span>
              )}
            </Link>
            <Link to="/admin/properties" className="btn-primary py-2 px-4 text-sm">
              <Building2 className="w-4 h-4 inline mr-1.5" />
              Properties
            </Link>
            <Link to="/admin/settings" className="btn-secondary py-2 px-3 text-sm" title="Admin Settings">
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Grid — Row 1: Users */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> User Statistics
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={overview.totalUsers} color="blue" sub={`+${overview.newUsersThisMonth} this month`} />
            <StatCard icon={UserCheck} label="Verified Users" value={overview.verifiedUsers} color="green" sub={`${verifiedPct}% of users verified`} />
            <StatCard icon={Users} label="Total Buyers" value={overview.totalBuyers} color="teal" />
            <StatCard icon={Users} label="Total Sellers" value={overview.totalSellers} color="purple" />
          </div>
        </div>

        {/* Stats Grid — Row 2: Properties & Platform */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> Property & Platform Stats
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Building2} label="Total Properties" value={overview.totalProperties} color="orange" sub={`+${overview.newPropertiesThisMonth} this month`} />
            <StatCard icon={CheckCircle2} label="Active Listings" value={overview.activeProperties} color="green" sub={`${activePct}% of total`} />
            <StatCard icon={Star} label="Featured Properties" value={overview.featuredProperties} color="pink" sub="Shown on homepage" />
            <StatCard icon={MessageSquare} label="Total Inquiries" value={overview.totalInquiries} color="gray" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/verifications?status=pending" className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-50 text-yellow-600 p-2.5 rounded-xl group-hover:bg-yellow-100 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Verifications</p>
                <p className="text-xs text-gray-500">{overview.pendingVerifications} pending review</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/properties?status=active" className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl group-hover:bg-primary-100 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Manage Properties</p>
                <p className="text-xs text-gray-500">{overview.activeProperties} active listings</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/properties?featured=true" className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-pink-50 text-pink-600 p-2.5 rounded-xl group-hover:bg-pink-100 transition-colors">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Featured Listings</p>
                <p className="text-xs text-gray-500">{overview.featuredProperties} on homepage</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/properties?fraud=true" className="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 text-red-600 p-2.5 rounded-xl group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Fraud Alerts</p>
                <p className="text-xs text-gray-500">Review suspicious listings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Platform Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" /> Platform Summary
            </h3>
            <div className="space-y-4">
              {[
                { label: 'User Verification Rate', value: overview.verifiedUsers, max: Math.max(overview.totalUsers, 1), color: 'bg-green-500', display: `${overview.verifiedUsers} / ${overview.totalUsers}` },
                { label: 'Active Listings Rate', value: overview.activeProperties, max: Math.max(overview.totalProperties, 1), color: 'bg-primary-500', display: `${overview.activeProperties} / ${overview.totalProperties}` },
                { label: 'Featured Properties', value: overview.featuredProperties, max: Math.max(overview.activeProperties, 1), color: 'bg-pink-500', display: `${overview.featuredProperties} featured` },
                { label: 'Total Inquiries', value: overview.totalInquiries, max: Math.max(overview.totalInquiries, 1), color: 'bg-purple-500', display: overview.totalInquiries?.toLocaleString('en-IN') },
                { label: 'Total Visits', value: overview.totalVisits, max: Math.max(overview.totalVisits, 1), color: 'bg-orange-500', display: overview.totalVisits?.toLocaleString('en-IN') },
              ].map(({ label, value, max, color, display }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                    <span>{label}</span>
                    <span className="font-semibold text-gray-800">{display}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-500" /> Pending Verifications
              </h3>
              <Link to="/admin/verifications" className="text-xs text-primary-600 font-medium">View All →</Link>
            </div>
            {!recent.recentVerifications?.length ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.recentVerifications.map((v) => (
                  <div key={v._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {v.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{v.user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{v.user?.role} · {formatRelativeTime(v.createdAt)}</p>
                    </div>
                    <Link to="/admin/verifications" className="text-xs text-primary-600 font-medium whitespace-nowrap hover:text-primary-800 bg-primary-50 px-2 py-1 rounded-lg">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Users */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> New Users
              </h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">+{overview.newUsersThisMonth} this month</span>
            </div>
            {!recent.recentUsers?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent users</p>
            ) : (
              <div className="space-y-3">
                {recent.recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{u.role} · {u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(u.verificationStatus)}`}>
                      {u.verificationStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Properties with Featured Toggle */}
          <div className="card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-500" /> Recent Listings
                <span className="text-xs text-gray-400 font-normal">— click ⭐ to feature on homepage</span>
              </h3>
              <Link to="/admin/properties" className="text-xs text-primary-600 font-medium">Manage All →</Link>
            </div>
            {!recent.recentProperties?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No recent listings</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recent.recentProperties.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-primary-200 hover:bg-gray-50 transition-all">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 capitalize truncate">{p.seller?.name} · {p.location?.city}</p>
                      <p className="text-xs font-semibold text-primary-600">{formatPriceShort(p.price)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                      <button
                        onClick={() => handleToggleFeatured(p._id, p.featured)}
                        className={`p-1 rounded-lg transition-colors ${p.featured ? 'text-yellow-500 hover:text-gray-400' : 'text-gray-300 hover:text-yellow-500'}`}
                        title={p.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
