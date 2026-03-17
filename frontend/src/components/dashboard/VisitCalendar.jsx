import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User, Home } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { respondToVisit, cancelVisit, completeVisit } from '../../api/visit.api';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const VisitCard = ({ visit, role, onUpdate }) => {
  const [responseModal, setResponseModal] = useState(false);
  const [sellerNotes, setSellerNotes] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRespond = async (status) => {
    setLoading(true);
    try {
      await respondToVisit(visit._id, {
        status,
        sellerNotes,
        confirmedDate: confirmedDate || visit.requestedDate,
        confirmedTime: confirmedTime || visit.requestedTime,
      });
      toast.success(`Visit ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setResponseModal(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to update visit');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this visit?')) return;
    try {
      await cancelVisit(visit._id);
      toast.success('Visit cancelled.');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel');
    }
  };

  const handleComplete = async () => {
    try {
      await completeVisit(visit._id);
      toast.success('Visit marked as completed!');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to mark as complete');
    }
  };

  const otherParty = role === 'seller' ? visit.buyer : visit.seller;
  const property = visit.property;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {otherParty?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-800 text-sm">{otherParty?.name || 'Unknown'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(visit.status)}`}>
                {visit.status}
              </span>
            </div>
            {property && (
              <p className="text-xs text-primary-600 font-medium mt-0.5">🏡 {property.title}</p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {visit.status === 'approved' && visit.confirmedDate
                    ? formatDate(visit.confirmedDate)
                    : formatDate(visit.requestedDate)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {visit.status === 'approved' && visit.confirmedTime
                    ? visit.confirmedTime
                    : visit.requestedTime}
                </span>
              </div>
            </div>

            {visit.sellerNotes && (
              <p className="text-xs text-gray-500 mt-1.5 italic">"{visit.sellerNotes}"</p>
            )}
            {visit.buyerNotes && (
              <p className="text-xs text-gray-500 mt-1.5 italic">"{visit.buyerNotes}"</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {role === 'seller' && visit.status === 'pending' && (
            <button
              onClick={() => setResponseModal(true)}
              className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Respond
            </button>
          )}
          {role === 'seller' && visit.status === 'approved' && (
            <button
              onClick={handleComplete}
              className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Complete
            </button>
          )}
          {role === 'buyer' && ['pending', 'approved'].includes(visit.status) && (
            <button
              onClick={handleCancel}
              className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Respond Modal */}
      <Modal
        isOpen={responseModal}
        onClose={() => setResponseModal(false)}
        title="Respond to Visit Request"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-lg p-3 text-sm">
            <p><strong>Buyer:</strong> {visit.buyer?.name}</p>
            <p><strong>Requested:</strong> {formatDate(visit.requestedDate)} at {visit.requestedTime}</p>
            {property && <p><strong>Property:</strong> {property.title}</p>}
          </div>

          <div>
            <label className="form-label">Confirm Date (optional — leave blank to use requested date)</label>
            <input
              type="date"
              className="form-input"
              value={confirmedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setConfirmedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Confirm Time (optional)</label>
            <input
              type="time"
              className="form-input"
              value={confirmedTime}
              onChange={(e) => setConfirmedTime(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Notes for Buyer (optional)</label>
            <textarea
              className="form-input resize-none"
              rows={3}
              placeholder="Any instructions for the visit..."
              value={sellerNotes}
              onChange={(e) => setSellerNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleRespond('approved')}
              disabled={loading}
              className="flex-1 btn-success py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Processing...' : 'Approve Visit'}
            </button>
            <button
              onClick={() => handleRespond('rejected')}
              disabled={loading}
              className="flex-1 btn-danger py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const VisitCalendar = ({ visits = [], role = 'seller', onUpdate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No visit requests</p>
        <p className="text-gray-400 text-sm">
          {role === 'seller' ? 'Visit requests from buyers will appear here' : 'Your scheduled visits will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((visit) => (
        <VisitCard key={visit._id} visit={visit} role={role} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default VisitCalendar;
