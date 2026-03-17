import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle2, Clock, AlertCircle, Upload,
  FileImage, Camera, ArrowLeft
} from 'lucide-react';
import { submitVerification, getMyVerificationStatus } from '../../api/verification.api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── File picker button ────────────────────────────────────────────────────────
const FilePicker = ({ label, icon: Icon, accept, file, onChange, required }) => {
  const ref = useRef(null);
  return (
    <div>
      <p className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</p>
      <div
        className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all
          ${file ? 'border-primary-400 bg-primary-50' : 'border-dashed border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
        onClick={() => ref.current?.click()}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file ? 'bg-primary-100' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${file ? 'text-primary-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-600">Click to browse</p>
              <p className="text-xs text-gray-400">JPG, PNG, PDF · Max 5MB</p>
            </>
          )}
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 ${file ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {file ? 'Change' : 'Browse'}
        </span>
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0]); e.target.value = ''; }}
      />
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function BuyerVerification() {
  const { user, refreshUser } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharCard, setAadharCard] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyVerificationStatus();
      setVerification(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = aadharNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(clean)) return toast.error('Enter a valid 12-digit Aadhar number');
    if (!aadharCard) return toast.error('Please upload your Aadhar Card');
    if (!selfie) return toast.error('Please upload a selfie with your Aadhar Card');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('aadharNumber', clean);
      fd.append('aadharCard', aadharCard);
      fd.append('selfieWithAadhar', selfie);
      await submitVerification(fd);
      toast.success('Verification submitted! Admin will review within 24 hours.');
      setAadharNumber('');
      setAadharCard(null);
      setSelfie(null);
      await refreshUser();
      await load();
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const status = verification?.status;
  const canSubmit = !status || status === 'rejected';

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="max-w-xl mx-auto px-4">

        {/* Back */}
        <Link to="/buyer/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-3">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verify your identity to <strong className="text-primary-300">send inquiries</strong> and <strong className="text-primary-300">schedule property visits</strong>
          </p>
        </div>

        {/* ── STATUS BANNERS ── */}
        {status === 'approved' && (
          <div className="rounded-2xl p-6 text-white shadow-lg mb-6" style={{ background: 'linear-gradient(135deg,#F57799,#F24E80)', border: '1px solid rgba(245,119,153,0.40)' }}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Identity Verified ✅</h2>
                <p className="text-primary-100 text-sm mt-0.5">You can now send inquiries and schedule property visits.</p>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="rounded-2xl p-6 text-white shadow-lg mb-6" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Under Review</h2>
                <p className="text-amber-100 text-sm mt-0.5">Admin is reviewing your documents. Usually within 24 hours.</p>
              </div>
            </div>
            {verification && (
              <div className="mt-4 bg-white/15 rounded-xl p-4 space-y-1.5 text-sm">
                <p><span className="text-white/70">Aadhar:</span> {verification.aadharNumber?.replace(/(\d{4})(?=\d)/g, '$1 ')}</p>
                <p><span className="text-white/70">Submitted:</span> {new Date(verification.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            )}
          </div>
        )}

        {status === 'rejected' && (
          <div className="rounded-2xl p-6 text-white shadow-lg mb-6" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Verification Rejected</h2>
                <p className="text-red-100 text-sm mt-1">
                  <strong>Reason:</strong> {verification?.rejectionReason || 'Please re-upload clearer documents.'}
                </p>
              </div>
            </div>
            <p className="text-red-100 text-sm mt-3 font-medium">→ Please re-submit with correct documents below.</p>
          </div>
        )}

        {/* ── VERIFICATION FORM ── */}
        {canSubmit && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {status === 'rejected' ? 'Re-submit Verification' : 'Submit Verification Documents'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Fill in your details and upload the required documents</p>
            </div>

            {/* Aadhar Number */}
            <div>
              <label className="form-label">Aadhar Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={aadharNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                  const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                  setAadharNumber(formatted);
                }}
                placeholder="XXXX XXXX XXXX"
                className="form-input tracking-widest text-lg font-mono"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Enter your 12-digit Aadhar number</p>
            </div>

            {/* Aadhar Card Upload */}
            <FilePicker
              label="Aadhar Card (Front side or scanned copy)"
              icon={FileImage}
              accept=".jpg,.jpeg,.png,.pdf"
              file={aadharCard}
              onChange={setAadharCard}
              required
            />

            {/* Selfie Upload */}
            <FilePicker
              label="Selfie with Aadhar Card"
              icon={Camera}
              accept=".jpg,.jpeg,.png"
              file={selfie}
              onChange={setSelfie}
              required
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Submit Verification
                </span>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Your documents are stored securely and only viewed by admins for verification purposes.
            </p>
          </form>
        )}

        {/* How it works */}
        {status !== 'approved' && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">How Verification Works</p>
            <div className="space-y-4">
              {[
                { n: 1, icon: FileImage, t: 'Submit Your Documents', c: 'Enter your 12-digit Aadhar number and upload your Aadhar card + selfie' },
                { n: 2, icon: Clock, t: 'Admin Review', c: 'Our admin team reviews your submission usually within 24 hours' },
                { n: 3, icon: Shield, t: 'Get Full Access', c: 'Once approved, you can send inquiries and schedule property visits freely' },
              ].map(({ n, icon: Icon, t, c }) => (
                <div key={n} className="flex gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
