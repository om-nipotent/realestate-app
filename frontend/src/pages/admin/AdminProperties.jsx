import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Building2, Eye, Star, StarOff, Trash2, AlertTriangle, CheckCircle2, XCircle, Search } from 'lucide-react';
import { getAdminProperties, updatePropertyStatus, togglePropertyFeaturedAdmin, deletePropertyAdmin, getFraudAlerts } from '../../api/admin.api';
import { formatPriceShort, formatRelativeTime, getStatusBadgeClass } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'active', 'inactive', 'sold'];

const AdminProperties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [deleteModal, setDeleteModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeStatus = searchParams.get('status') || 'all';
  const showFraud = searchParams.get('fraud') === 'true';

  const load = async (p = 1) => {
    setLoading(true);
    try {
      if (showFraud) {
        const res = await getFraudAlerts();
        // successResponse wraps in { success, data: { alerts: [...] } }
        setFraudAlerts(res.data?.alerts || res.data || []);
        setTotal(res.data?.alerts?.length || 0);
      } else {
        const params = { page: p, limit: 12 };
        if (activeStatus !== 'all') params.status = activeStatus;
        if (search) params.search = search;
        const res = await getAdminProperties(params);
        // paginatedResponse returns { success, data: [...], meta: { total, ... } }
        setProperties(res.data || []);
        setTotal(res.meta?.total || 0);
        setPage(p);
      }
    } catch {
      toast.error('Failed to load properties');
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [activeStatus, showFraud, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleStatusChange = async () => {
    if (!statusModal || !newStatus) return;
    setSubmitting(true);
    try {
      await updatePropertyStatus(statusModal._id, newStatus);
      toast.success('Property status updated');
      setStatusModal(null);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
    setSubmitting(false);
  };

  const handleToggleFeatured = async (id, current) => {
    try {
      await togglePropertyFeaturedAdmin(id);
      toast.success(current ? 'Removed from featured' : 'Marked as featured');
      load(page);
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await deletePropertyAdmin(deleteModal._id);
      toast.success('Property deleted');
      setDeleteModal(null);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete property');
    }
    setSubmitting(false);
  };

  const displayList = showFraud ? fraudAlerts : properties;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary-600" />
              {showFraud ? 'Fraud Alerts' : 'Property Moderation'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {showFraud ? 'Suspicious listings flagged by the system' : 'Manage and moderate property listings'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSearchParams({})}
              className={`py-2 px-3 text-sm rounded-xl border font-medium transition-colors ${!showFraud ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              All Properties
            </button>
            <button
              onClick={() => setSearchParams({ fraud: 'true' })}
              className={`py-2 px-3 text-sm rounded-xl border font-medium transition-colors flex items-center gap-1.5 ${showFraud ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Fraud Alerts
            </button>
          </div>
        </div>

        {!showFraud && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Status Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
              {STATUS_OPTIONS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchParams(tab === 'all' ? {} : { status: tab })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    activeStatus === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xs">
              <input
                className="form-input py-2 text-sm flex-1"
                placeholder="Search by title or city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="btn-secondary p-2 rounded-xl">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <div className="text-xs text-gray-400 mb-4">{total} result{total !== 1 ? 's' : ''}</div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : displayList.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No properties found</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {displayList.map((property) => (
              <div key={property._id} className={`card p-4 flex items-center gap-4 ${property.fraudScore ? 'border-l-4 border-l-red-400' : ''}`}>
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
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(property.status)}`}>
                      {property.status}
                    </span>
                    {property.featured && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">⭐ Featured</span>
                    )}
                    {property.fraudScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Risk: {property.fraudScore}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{property.location?.city} · {property.propertyType} · Seller: {property.seller?.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-primary-700">{formatPriceShort(property.price)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{property.views || 0} views</span>
                    <span>{formatRelativeTime(property.createdAt)}</span>
                  </div>
                  {property.fraudReasons && property.fraudReasons.length > 0 && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {property.fraudReasons.map((r, i) => (
                        <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">{r}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    to={`/properties/${property._id}`}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleToggleFeatured(property._id, property.featured)}
                    className={`p-2 rounded-lg transition-colors ${property.featured ? 'text-accent-600 hover:text-gray-500 hover:bg-gray-100' : 'text-gray-400 hover:text-accent-600 hover:bg-accent-50'}`}
                    title={property.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {property.featured ? <Star className="w-4 h-4 fill-current" /> : <Star className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setStatusModal(property); setNewStatus(property.status); }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-xs"
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

            {/* Pagination */}
            {!showFraud && total > 12 && (
              <div className="flex justify-center gap-2 pt-4">
                <button onClick={() => load(page - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Previous</button>
                <span className="py-2 px-4 text-sm text-gray-600">Page {page} of {Math.ceil(total / 12)}</span>
                <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / 12)} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next</button>
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
                <p className="text-sm text-red-700 mt-1">Delete <strong>"{deleteModal.title}"</strong>? All associated images and data will be permanently removed.</p>
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

export default AdminProperties;
