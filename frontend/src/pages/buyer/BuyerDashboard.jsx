import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Calendar, Shield, Search, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBuyerInquiries } from '../../api/inquiry.api';
import { getBuyerVisits } from '../../api/visit.api';
import { getRecommendations, getMyVerificationStatus } from '../../api/verification.api';
import InquiryList from '../../components/dashboard/InquiryList';
import VisitCalendar from '../../components/dashboard/VisitCalendar';
import PropertyCard from '../../components/property/PropertyCard';
import { CardSkeleton } from '../../components/common/Loader';

const BuyerDashboard = () => {
  const { user, isVerified } = useAuth();
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
        if (visitRes.status === 'fulfilled') setVisits(visitRes.value.data || []);
        if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data || []);
        setVerRecord(verRes.status === 'fulfilled' ? (verRes.value.data || null) : null);
      } catch {}
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = [
    { icon: MessageSquare, label: 'Inquiries Sent', value: inquiries.length, color: 'blue', link: null },
    { icon: Calendar, label: 'Visits Scheduled', value: visits.length, color: 'green', link: null },
    { icon: Eye, label: 'Pending Visits', value: visits.filter((v) => v.status === 'pending').length, color: 'orange', link: null },
  ];

  // Use actual verification record status, never user.verificationStatus default
  const verStatus = verRecord?.status;

  const verificationBanner = () => {
    if (verStatus === 'approved') return null;

    const config = {
      pending: {
        icon: Clock,
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-700',
        title: 'Verification Pending',
        desc: "Your documents are under review. You'll be notified once approved (usually within 24 hours).",
        cta: null,
      },
      rejected: {
        icon: AlertCircle,
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        title: 'Verification Rejected',
        desc: `Reason: ${verRecord?.rejectionReason || 'Please re-submit clearer documents.'}`,
        cta: 'Re-submit Documents',
      },
    };

    const cfg = config[verStatus] || {
      icon: Shield,
      bg: 'bg-primary-50 border-primary-200',
      text: 'text-primary-700',
      title: 'Verify Your Identity',
      desc: 'Upload your Aadhar card to unlock inquiries, visit scheduling, and more.',
      cta: 'Verify Now',
    };

    const Icon = cfg.icon;
    return (
      <div className={`flex items-start gap-4 p-4 rounded-xl border ${cfg.bg} mb-6`}>
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.text}`} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${cfg.text}`}>{cfg.title}</p>
          <p className={`text-xs mt-0.5 ${cfg.text} opacity-80`}>{cfg.desc}</p>
        </div>
        {cfg.cta && (
          <Link to="/buyer/verification" className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border ${cfg.text} border-current whitespace-nowrap`}>
            {cfg.cta}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Here's your activity overview.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/properties" className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <Search className="w-4 h-4" /> Browse Properties
            </Link>
            {verStatus !== 'approved' && (
              <Link to="/buyer/verification" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" /> {verStatus === 'pending' ? 'View Verification' : 'Verify Identity'}
              </Link>
            )}
          </div>
        </div>

        {/* Verification Banner */}
        {verificationBanner()}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color === 'blue' ? 'bg-primary-50 text-primary-600' : color === 'green' ? 'bg-primary-50 text-primary-600' : 'bg-orange-50 text-orange-600'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
              {[
                { key: 'inquiries', label: 'My Inquiries', count: inquiries.length },
                { key: 'visits', label: 'My Visits', count: visits.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'inquiries' ? (
              <InquiryList inquiries={inquiries} role="buyer" loading={loading} />
            ) : (
              <VisitCalendar visits={visits} role="buyer" loading={loading} />
            )}
          </div>

          {/* Right: Search History + Verification Status */}
          <div className="space-y-5">
            {/* Verification Status Card */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-600" /> Identity Status
              </h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                verStatus === 'approved' ? 'bg-primary-50' : verStatus === 'pending' ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                {verStatus === 'approved' ? (
                  <CheckCircle2 className="w-8 h-8 text-primary-600" />
                ) : verStatus === 'pending' ? (
                  <Clock className="w-8 h-8 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <p className="font-semibold text-sm capitalize">
                    {verStatus === 'approved' ? 'Verified' : verStatus === 'pending' ? 'Under Review' : verStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {verStatus === 'approved' ? 'Full access enabled' : 'Limited access'}
                  </p>
                </div>
              </div>
              {verStatus !== 'approved' && (
                <Link to="/buyer/verification" className="btn-primary w-full py-2 text-sm mt-3 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  {verStatus === 'pending' ? 'View Status' : 'Upload Documents'}
                </Link>
              )}
            </div>

            {/* Quick Links */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/properties', label: '🔍 Browse Properties' },
                  { to: '/properties?sort=newest', label: '🆕 Newest Listings' },
                  { to: '/properties?sort=popular', label: '🔥 Popular Properties' },
                  { to: '/buyer/verification', label: '🛡️ Verification Status' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-600" /> Recommended for You
              </h2>
              <Link to="/properties" className="text-sm text-primary-600 font-medium hover:text-primary-800">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading
                ? [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
                : recommendations.map((p) => <PropertyCard key={p._id} property={p} />)
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
