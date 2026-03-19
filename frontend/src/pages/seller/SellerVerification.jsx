import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, CheckCircle2, Clock, AlertCircle, Upload,
  FileImage, Camera, ArrowLeft, ArrowRight, X
} from 'lucide-react';
import { submitVerification, getMyVerificationStatus } from '../../api/verification.api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ── Enhanced File Picker ───────────────────────────────────────────────────
const FilePicker = ({ label, icon: Icon, accept, file, onChange, required, desc }) => {
  const ref = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="mb-6">
      <p className="text-sm font-bold text-gray-700 mb-2">{label}{required && <span className="text-rose-500 ml-1">*</span>}</p>
      
      {!file ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => ref.current?.click()}
          className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center text-center group
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-primary-300 hover:shadow-md'}`}
        >
          {isDragActive && (
            <motion.div layoutId="drag-active" className="absolute inset-0 bg-primary-100/50 backdrop-blur-sm -z-10" />
          )}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-primary-200 text-primary-700' : 'bg-white text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 shadow-sm'}`}>
            <Icon className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-gray-800 mb-1 tracking-tight">
            {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
          </p>
          <p className="text-xs text-gray-500 font-medium">{desc || 'JPG, PNG, PDF formats up to 5MB'}</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-gray-200 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
            <p className="text-xs font-semibold text-gray-400">{(file.size / 1024).toFixed(1)} KB • Ready</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

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

// ── Step Indicator ─────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center mb-10 w-full max-w-sm mx-auto flex-col">
      <div className="flex items-center justify-center w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isActive = currentStep === index + 1;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted || isActive ? '#C026D3' : '#F3F4F6', // primary-500
                    borderColor: isCompleted || isActive ? '#C026D3' : '#E5E7EB',
                    scale: isActive ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300
                    ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </motion.div>
                <span className={`absolute -bottom-6 text-xs font-bold whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-100 rounded-full relative overflow-hidden -mt-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-primary-500"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SellerVerification() {
  const { refreshUser } = useAuth();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Uploads, 3: Review

  // Form state
  const [aadharNumber, setAadharNumber] = useState('');
  const [aadharCard, setAadharCard] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyVerificationStatus();
      setVerification(res.data);
      if (res.data?.status === 'pending' || res.data?.status === 'approved') {
        setStep(4); // View status result immediately
      } else if (res.data?.status === 'rejected') {
        setStep(1); // Let them submit again
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleNextStep = () => {
    if (step === 1) {
      const clean = aadharNumber.replace(/\s/g, '');
      if (!/^\d{12}$/.test(clean)) return toast.error('Enter a valid 12-digit Aadhar number');
      setStep(2);
    } else if (step === 2) {
      if (!aadharCard) return toast.error('Please upload your Aadhar Card');
      if (!selfie) return toast.error('Please upload a selfie with your Aadhar Card');
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const clean = aadharNumber.replace(/\s/g, '');
    
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('aadharNumber', clean);
      fd.append('aadharCard', aadharCard);
      fd.append('selfieWithAadhar', selfie);
      await submitVerification(fd);
      
      toast.success('Verification submitted! Admin will review shortly.');
      setAadharNumber('');
      setAadharCard(null);
      setSelfie(null);
      await refreshUser();
      await load();
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-bold tracking-widest uppercase">Checking Status</p>
        </motion.div>
      </div>
    );
  }

  // Use ONLY the verification record's status — never fall back to user.verificationStatus
  // because user.verificationStatus defaults to 'pending' for all new users.
  const status = verification?.status;
  const canSubmit = !status || status === 'rejected';

  const steps = [
    { id: 1, title: 'Details' },
    { id: 2, title: 'Documents' },
    { id: 3, title: 'Review' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/seller/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* ── STATUS BANNERS ── */}
        {(status === 'approved' || status === 'pending' || status === 'rejected') && step === 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 text-center relative overflow-hidden">
            {/* Decor blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary-50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />

            {status === 'approved' && (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Identity Verified</h1>
                <p className="text-gray-500 text-base max-w-md mx-auto mb-8">All your property listings now display the <strong className="text-emerald-600">Verified Seller</strong> badge, building trust and attracting more buyers.</p>
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-8 max-w-sm mx-auto flex items-center gap-4 justify-center shadow-sm">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <span className="font-extrabold text-emerald-800 text-lg uppercase tracking-tight">Verified Seller</span>
                </div>

                <Link to="/seller/properties/new" className="btn-primary py-3.5 px-8 shadow-lg inline-flex items-center gap-2">
                  Create New Listing <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Application Under Review</h1>
                <p className="text-gray-500 text-base max-w-md mx-auto mb-6">Our compliance team is currently verifying your documents. This process is usually completed within 12-24 hours.</p>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-left max-w-md mx-auto flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Application Received</p>
                    <p className="text-xs text-amber-700 mt-1">Submitted on {new Date(verification.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </>
            )}

            {status === 'rejected' && (
              <>
                <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/30">
                  <X className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Verification Rejected</h1>
                <p className="text-gray-500 text-base max-w-md mx-auto mb-6">Unfortunately, we could not verify your identity with the provided documents.</p>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-left max-w-md mx-auto flex items-start gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-900">Reason for Rejection</p>
                    <p className="text-sm font-medium text-rose-700 mt-1">{verification?.rejectionReason || 'Documents were blurry or did not match registered details.'}</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="btn-primary py-3 px-8 shadow-lg">Resubmit Documents</button>
              </>
            )}
          </motion.div>
        )}

        {/* ── VERIFICATION FORM MULTI-STEP ── */}
        {canSubmit && step < 4 && (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>

            <div className="text-center mb-10 pt-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-2xl mb-4 shadow-inner border border-primary-100">
                <Shield className="w-7 h-7 text-primary-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Seller Verification</h1>
              <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">Verify your identity securely to get the Verified Seller Badge and increase trust with buyers by up to 300%.</p>
            </div>

            <StepIndicator currentStep={step} steps={steps} />

            <div className="mt-12 min-h-[300px]">
              <AnimatePresence mode="wait">
                {/* ── STEP 1: Basic Info ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 drop-shadow-sm">Identity Details</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">12-Digit Aadhar Number <span className="text-rose-500">*</span></label>
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
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg rounded-xl focus:ring-primary-500 focus:border-primary-500 p-4 transition-colors tracking-[0.2em] font-mono shadow-inner"
                          required
                        />
                        <p className="text-xs text-gray-400 font-medium mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Data is bank-level encrypted and strictly confidential.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Documents ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 drop-shadow-sm">Required Documents</h3>
                    <div className="space-y-2">
                      <FilePicker
                        label="Aadhar Card Document"
                        desc="Clear picture of front side or PDF copy"
                        icon={FileImage}
                        accept=".jpg,.jpeg,.png,.pdf"
                        file={aadharCard}
                        onChange={setAadharCard}
                        required
                      />
                      <FilePicker
                        label="Selfie Verification"
                        desc="Clear selfie holding your Aadhar card"
                        icon={Camera}
                        accept=".jpg,.jpeg,.png"
                        file={selfie}
                        onChange={setSelfie}
                        required
                      />
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Review ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 drop-shadow-sm">Review & Submit</h3>
                    
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Aadhar Number</p>
                        <p className="text-lg font-mono font-medium text-gray-900">{aadharNumber}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ID Document</p>
                          <div className="flex items-center gap-2">
                            <FileImage className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-800 truncate">{aadharCard?.name}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selfie</p>
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-800 truncate">{selfie?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-blue-800">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium leading-relaxed">
                        By submitting, you confirm that all provided details are accurate. False seller information may lead to permanent account suspension and listing removal.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary py-3 px-8 text-sm flex items-center gap-2 shadow-lg"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary py-3 px-8 text-sm flex items-center gap-2 shadow-lg shadow-primary-500/30"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
