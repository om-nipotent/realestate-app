import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2, User, Mail, Phone, Lock, Home, Briefcase, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { InlineLoader } from '../components/common/Loader';
import toast from 'react-hot-toast';

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '8+ characters', valid: password?.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password || '') },
    { label: 'Number', valid: /[0-9]/.test(password || '') },
  ];
  const score = checks.filter((c) => c.valid).length;
  const colors = ['bg-red-400', 'bg-yellow-400', 'bg-primary-400'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1 text-xs ${c.valid ? 'text-primary-600' : 'text-gray-400'}`}>
            <CheckCircle2 className={`w-3 h-3 ${c.valid ? 'text-primary-500' : 'text-gray-300'}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm();
  const password = watch('password');

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'email', 'phone', 'password', 'confirmPassword']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data) => {
    if (!selectedRole) return toast.error('Please select your role');
    setLoading(true);
    try {
      const user = await authRegister({ ...data, role: selectedRole });
      const dashboards = { buyer: '/buyer/dashboard', seller: '/seller/dashboard' };
      navigate(dashboards[user.role] || '/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-surface-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-700">
            <div className="bg-primary-700 text-white p-2 rounded-xl shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            PropEase
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Create your account in 2 easy steps.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6 px-2">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`step-indicator ${s === step ? 'active' : s < step ? 'completed' : 'inactive'}`}>
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <p className={`text-sm font-medium ${s === step ? 'text-primary-700' : 'text-gray-400'}`}>
                {s === 1 ? 'Your Details' : 'Choose Role'}
              </p>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200'} rounded-full`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>

                {/* Name */}
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                      type="text"
                      placeholder="Rajesh Kumar"
                      className={`form-input pl-10 ${errors.name ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                      })}
                      type="email"
                      placeholder="you@example.com"
                      className={`form-input pl-10 ${errors.email ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
                      })}
                      type="tel"
                      placeholder="9876543210"
                      className={`form-input pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        validate: (val) => /[A-Z]/.test(val) && /[0-9]/.test(val) || 'Must contain uppercase letter and number',
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                  {password && <PasswordStrength password={password} />}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="form-label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (val) => val === password || 'Passwords do not match',
                      })}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                </div>

                <button type="button" onClick={goToStep2} className="btn-primary w-full py-3">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose Your Role</h2>
                  <p className="text-gray-500 text-sm">Select how you want to use the platform</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Buyer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-5 border-2 rounded-xl text-left transition-all ${
                      selectedRole === 'buyer'
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedRole === 'buyer' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Home className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">I'm a Buyer</h3>
                        <p className="text-gray-500 text-sm">Browse properties, schedule visits, send inquiries</p>
                        <ul className="mt-2 space-y-1">
                          {['Search & filter properties', 'Schedule property visits', 'Send inquiries to sellers'].map((item) => (
                            <li key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                              <CheckCircle2 className="w-3 h-3 text-primary-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedRole === 'buyer' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Seller */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-5 border-2 rounded-xl text-left transition-all ${
                      selectedRole === 'seller'
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedRole === 'seller' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Briefcase className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">I'm a Seller</h3>
                        <p className="text-gray-500 text-sm">List properties, manage inquiries, track analytics</p>
                        <ul className="mt-2 space-y-1">
                          {['List your properties', 'Get AI price suggestions', 'Manage buyer inquiries', 'Track property performance'].map((item) => (
                            <li key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                              <CheckCircle2 className="w-3 h-3 text-primary-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedRole === 'seller' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary py-3 px-5"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedRole}
                    className="btn-primary flex-1 py-3"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <InlineLoader /> Creating Account...
                      </span>
                    ) : 'Create Account →'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
