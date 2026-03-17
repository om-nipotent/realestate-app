import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCheck, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeTime, getStatusBadgeClass } from '../../utils/formatters';
import { replyToInquiry, markInquiryRead } from '../../api/inquiry.api';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

const InquiryCard = ({ inquiry, role, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkRead = async () => {
    if (role !== 'seller' || inquiry.status !== 'unread') return;
    try {
      await markInquiryRead(inquiry._id);
      if (onUpdate) onUpdate();
    } catch {}
  };

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('Please enter a reply');
    setLoading(true);
    try {
      await replyToInquiry(inquiry._id, replyText.trim());
      toast.success('Reply sent!');
      setReplyModal(false);
      setReplyText('');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const isUnread = inquiry.status === 'unread';
  const otherParty = role === 'seller' ? inquiry.buyer : inquiry.seller;
  const property = inquiry.property;

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        isUnread ? 'border-primary-200 bg-primary-50' : 'border-gray-100'
      }`}
      onClick={!expanded && role === 'seller' && isUnread ? handleMarkRead : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
            {otherParty?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-800 text-sm">{otherParty?.name || 'Unknown'}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(inquiry.status)}`}>
                {inquiry.status}
              </span>
              {isUnread && (
                <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
              )}
            </div>
            {property && (
              <p className="text-xs text-primary-600 font-medium mt-0.5 truncate">
                🏡 {property.title}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{inquiry.message}</p>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">{formatRelativeTime(inquiry.createdAt)}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Full Message</p>
            <p className="text-sm text-gray-700">{inquiry.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Contact Phone</span>
              <p className="text-gray-800 font-medium">{inquiry.contactPhone}</p>
            </div>
            {inquiry.preferredVisitDate && (
              <div>
                <span className="text-gray-500">Preferred Visit</span>
                <p className="text-gray-800 font-medium">
                  {new Date(inquiry.preferredVisitDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {inquiry.reply && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <p className="text-xs font-medium text-primary-700 mb-1">Your Reply</p>
              <p className="text-sm text-gray-700">{inquiry.reply}</p>
              {inquiry.repliedAt && (
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(inquiry.repliedAt)}</p>
              )}
            </div>
          )}

          {role === 'seller' && inquiry.status !== 'replied' && (
            <button
              onClick={() => setReplyModal(true)}
              className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:text-primary-800 transition-colors"
            >
              <Send className="w-4 h-4" />
              Reply to this Inquiry
            </button>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        isOpen={replyModal}
        onClose={() => setReplyModal(false)}
        title="Reply to Inquiry"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setReplyModal(false)} className="btn-secondary py-2 text-sm">
              Cancel
            </button>
            <button onClick={handleReply} disabled={loading} className="btn-primary py-2 text-sm">
              {loading ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Original Message from {otherParty?.name}</p>
            <p className="text-sm text-gray-700">{inquiry.message}</p>
          </div>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            rows={4}
            className="form-input resize-none"
          />
        </div>
      </Modal>
    </div>
  );
};

const InquiryList = ({ inquiries = [], role = 'seller', onUpdate, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex gap-3">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No inquiries yet</p>
        <p className="text-gray-400 text-sm">
          {role === 'seller' ? 'Inquiries from buyers will appear here' : 'Your sent inquiries will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inquiry) => (
        <InquiryCard key={inquiry._id} inquiry={inquiry} role={role} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default InquiryList;
