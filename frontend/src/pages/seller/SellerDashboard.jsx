import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, BarChart2, TrendingUp, Home, Shield, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSellerProperties, deleteProperty } from '../../api/property.api';
import { getSellerInquiries } from '../../api/inquiry.api';
import { getSellerVisits } from '../../api/visit.api';
import { getSellerAnalytics, getMyVerificationStatus } from '../../api/verification.api';
import SellerStats from '../../components/dashboard/SellerStats';
import InquiryList from '../../components/dashboard/InquiryList';
import VisitCalendar from '../../components/dashboard/VisitCalendar';
import { formatPriceShort, getStatusBadgeClass } from '../../utils/formatters';
import toast from 'react-hot-toast';

// Verification banner component
const VerificationBanner = ({ status }) => {
  if (status === 'verified') return null;

  if (status === 'pending') {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 mb-6 shadow-md text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base">Verification Under Review</p>
            <p className="text-amber-100 text-sm mt-0.5">Admin is reviewing your documents. Properties will show the <strong>Verified badge</strong> once approved — usually within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 mb-6 shadow-md text-white" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base">Verification Rejected</p>
            <p className="text-red-100 text-sm mt-0.5">Your documents were rejected. Re-submit to get the Verified badge on your listings.</p>
          </div>
          <Link to="/seller/verification" className="flex-shrink-0 flex items-center gap-1.5 bg-white text-red-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
            Re-submit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Not submitted yet
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 p-5 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800">Get the Verified Badge on Your Listings</p>
          <p className="text-gray-500 text-sm mt-0.5">Upload your ID document so admin can verify you. Once approved, a <strong>Verified Seller</strong> badge appears on all your properties — boosting buyer trust.</p>
        </div>
        <Link
          to="/seller/verification"
          className="flex-shrink-0 flex items-center gap-2 btn-primary py-2.5 px-5 text-sm"
        >
          <Shield className="w-4 h-4" /> Upload Documents <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [deletingId, setDeletingId] = useState(null);
  const [verRecord, setVerRecord] = useState(undefined); // undefined=loading, null=no record

  const loadData = async () => {
    setLoading(true);
    try {
      const [propRes, inquiryRes, visitRes, analyticsRes, verRes] = await Promise.allSettled([
        getSellerProperties({ limit: 20 }),
        getSellerInquiries({ limit: 10 }),
        getSellerVisits({ limit: 10 }),
        getSellerAnalytics(),
        getMyVerificationStatus(),
      ]);
      if (propRes.status === 'fulfilled') setProperties(propRes.value.data || []);
      if (inquiryRes.status === 'fulfilled') setInquiries(inquiryRes.value.data || []);
      if (visitRes.status === 'fulfilled') setVisits(visitRes.value.data || []);
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

  const tabs = [
    { key: 'properties', label: 'My Listings', count: properties.length },
    { key: 'inquiries', label: 'Inquiries', count: inquiries.filter((i) => i.status === 'unread').length },
    { key: 'visits', label: 'Visit Requests', count: visits.filter((v) => v.status === 'pending').length },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage your property listings, inquiries, and visits</p>
          </div>
          <Link
            to="/seller/properties/create"
            className="flex items-center gap-2 px-5 py-2.5 btn-primary text-sm"
          >
            <Plus className="w-4 h-4" /> List New Property
          </Link>
        </div>

        {/* Verification Banner — use actual record status, not user.verificationStatus default */}
        <VerificationBanner status={verRecord === undefined ? undefined : verRecord?.status === 'approved' ? 'verified' : verRecord?.status} />

        {/* Stats */}
        <div className="mb-8">
          <SellerStats stats={analytics?.overview} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-6 w-fit shadow-sm border border-gray-100 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
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

        {/* Tab Content */}
        {activeTab === 'properties' && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-2xl mb-4">
                  <Home className="w-10 h-10 text-primary-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties Yet</h3>
                <p className="text-gray-400 text-sm mb-6">Start by listing your first property</p>
                <Link
                  to="/seller/properties/create"
                  className="btn-primary px-6 py-3"
                >
                  <Plus className="w-4 h-4" /> List Your First Property
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <div
                    key={property._id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Image */}
                    <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      {property.images?.[0]?.url ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{property.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(property.status)}`}>
                          {property.status}
                        </span>
                        {property.featured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⭐ Featured</span>
                        )}
                        {/* Seller verification badge — based on actual verification record */}
                        {verRecord?.status === 'approved' ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        ) : verRecord?.status === 'pending' ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : verRecord?.status === 'rejected' ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                            <AlertCircle className="w-3 h-3" /> Rejected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            <AlertCircle className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">{property.location?.city} · {property.propertyType} · {property.bedrooms} BHK</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-bold text-primary-700">{formatPriceShort(property.price)}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3" /> {property.views || 0} views
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        to={`/properties/${property._id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/seller/properties/${property._id}/edit`}
                        className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id, property.title)}
                        disabled={deletingId === property._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <InquiryList inquiries={inquiries} role="seller" onUpdate={loadData} loading={loading} />
        )}
        {activeTab === 'visits' && (
          <VisitCalendar visits={visits} role="seller" onUpdate={loadData} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
