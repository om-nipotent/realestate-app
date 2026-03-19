import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, StarOff, Building2, Eye, CheckCircle2, XCircle,
  Search, Settings, ChevronLeft, AlertTriangle, Trash2
} from 'lucide-react';
import {
  getAdminProperties, togglePropertyFeaturedAdmin,
  updatePropertyStatus, deletePropertyAdmin
} from '../../api/admin.api';
import { formatPriceShort, formatRelativeTime, getStatusBadgeClass } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'featured', label: '⭐ Featured Properties', desc: 'Manage which properties appear on the homepage hero and featured section' },
  { id: 'moderation', label: '🛡️ Property Moderation', desc: 'Approve, deactivate, or remove listings' },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('featured');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteModal, setDeleteModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15 };
      if (activeTab === 'featured') params.featured = true;
      if (search) params.q = search;
      const res = await getAdminProperties(params);
      setProperties(res.data || []);
      setTotal(res.meta?.total || 0);
      setPage(p);
    } catch {
      toast.error('Failed to load properties');
    }
    setLoading(false);
  };

  const loadAll = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 15, status: 'active' };
      if (search) params.q = search;
      const res = await getAdminProperties(params);
      setProperties(res.data || []);
      setTotal(res.meta?.total || 0);
      setPage(p);
    } catch {
      toast.error('Failed to load properties');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'featured') load(1);
    else loadAll(1);
  }, [activeTab, search]);

  const handleToggleFeatured = async (id, current) => {
    try {
      await togglePropertyFeaturedAdmin(id);
      toast.success(current ? 'Removed from featured — homepage updated' : 'Added to featured — will show on homepage');
      if (activeTab === 'featured') load(page);
      else loadAll(page);
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal || !newStatus) return;
    setSubmitting(true);
    try {
      await updatePropertyStatus(statusModal._id, newStatus);
      toast.success('Property status updated');
      setStatusModal(null);
      if (activeTab === 'featured') load(page);
      else loadAll(page);
    } catch {
      toast.error('Failed to update status');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await deletePropertyAdmin(deleteModal._id);
      toast.success('Property deleted');
      setDeleteModal(null);
      if (activeTab === 'featured') load(page);
      else loadAll(page);
    } catch {
      toast.error('Failed to delete property');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-600" /> Admin Customization
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage featured properties, moderate listings, and customize the platform</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Star className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-primary-800">Featured Properties appear on the PropEase homepage</p>
            <p className="text-xs text-primary-600 mt-0.5">Properties marked as featured are shown in the homepage hero banner and the "Featured Properties" section. Aim to keep 6–12 featured at a time for best results.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(''); setSearchInput(''); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">{TABS.find(t => t.id === activeTab)?.desc}</p>

        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} className="flex gap-2 mb-6 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="form-input pl-9 py-2 text-sm w-full"
              placeholder="Search by title or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-secondary px-4 py-2 text-sm">Search</button>
        </form>

        <div className="text-xs text-gray-400 mb-4">{total} result{total !== 1 ? 's' : ''}</div>

        {/* Property List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="card p-16 text-center">
            <Star className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">
              {activeTab === 'featured' ? 'No featured properties yet' : 'No properties found'}
            </h3>
            {activeTab === 'featured' && (
              <p className="text-sm text-gray-400 mt-2">
                Go to the <Link to="/admin/properties" className="text-primary-600 underline">Properties page</Link> and click the ⭐ icon to feature listings.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((property) => (
              <div key={property._id} className={`card p-4 flex items-center gap-4 transition-all hover:shadow-card-hover ${property.featured ? 'border-l-4 border-l-yellow-400' : ''}`}>
                {/* Image */}
                <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {property.images?.[0]?.url ? (
                    <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{property.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(property.status)}`}>{property.status}</span>
                    {property.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">⭐ Featured on Homepage</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{property.location?.city} · {property.propertyType} · by {property.seller?.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-primary-700">{formatPriceShort(property.price)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{property.views || 0} views</span>
                    <span>{formatRelativeTime(property.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/properties/${property._id}`} target="_blank"
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View listing">
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleToggleFeatured(property._id, property.featured)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      property.featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                    }`}
                    title={property.featured ? 'Remove from homepage' : 'Feature on homepage'}
                  >
                    {property.featured
                      ? <><StarOff className="w-3.5 h-3.5" /> Unfeature</>
                      : <><Star className="w-3.5 h-3.5" /> Feature</>
                    }
                  </button>

                  <button
                    onClick={() => { setStatusModal(property); setNewStatus(property.status); }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Change status"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteModal(property)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {total > 15 && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => { if (activeTab === 'featured') load(page - 1); else loadAll(page - 1); }} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Previous</button>
                <span className="py-2 px-4 text-sm text-gray-600">Page {page} of {Math.ceil(total / 15)}</span>
                <button onClick={() => { if (activeTab === 'featured') load(page + 1); else loadAll(page + 1); }} disabled={page >= Math.ceil(total / 15)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title="Update Property Status" size="sm">
        {statusModal && (
          <div>
            <p className="text-sm text-gray-600 mb-4">Change status for: <strong>{statusModal.title}</strong></p>
            <select className="form-input mb-4" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="sold">Sold</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setStatusModal(null)} className="btn-secondary py-2.5 px-5">Cancel</button>
              <button onClick={handleStatusChange} disabled={submitting} className="btn-primary flex-1 py-2.5">
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Property" size="sm">
        {deleteModal && (
          <div>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">This action cannot be undone</p>
                <p className="text-sm text-red-700 mt-1">Delete <strong>"{deleteModal.title}"</strong>?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="btn-secondary py-2.5 px-5">Cancel</button>
              <button onClick={handleDelete} disabled={submitting} className="btn-danger flex-1 py-2.5">
                {submitting ? 'Deleting...' : 'Delete Property'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSettings;
