import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Bed, Bath, Maximize2, Calendar, Phone, MessageSquare,
  CheckCircle2, ArrowLeft, Share2, Building, Layers, Sofa, Shield,
  Heart, ArrowRight, Home
} from 'lucide-react';
import { getProperty } from '../api/property.api';
import { sendInquiry } from '../api/inquiry.api';
import { requestVisit } from '../api/visit.api';
import { useAuth } from '../context/AuthContext';
import PropertyImages from '../components/property/PropertyImages';
import { PropertyDetailMap } from '../components/property/PropertyMap';
import { PriceSuggestionDisplay } from '../components/property/PriceSuggestion';
import AIPredictionPanel from '../components/property/AIPredictionPanel';
import { FullPageLoader } from '../components/common/Loader';
import { formatPrice, formatArea, formatDate, getPropertyTypeColor, formatPropertyType, getStatusBadgeClass } from '../utils/formatters';
import toast from 'react-hot-toast';
import Footer from '../components/common/Footer';
import ScrollReveal from '../components/common/ScrollReveal';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isBuyer, isVerified } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryText, setInquiryText] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState(user?.phone || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [visitLoading, setVisitLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProperty(id);
        setProperty(res.data);
      } catch (err) {
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
    if (!isVerified) return toast.error('Please verify your identity to send inquiries.');
    if (!inquiryText.trim()) return toast.error('Please enter a message');
    if (!inquiryPhone.trim()) return toast.error('Please enter your contact phone');

    setSubmitLoading(true);
    try {
      await sendInquiry({
        propertyId: id,
        message: inquiryText.trim(),
        contactPhone: inquiryPhone.trim(),
        preferredVisitDate: preferredDate || undefined,
      });
      toast.success('Inquiry sent! The seller will respond soon.');
      setInquiryText('');
      setPreferredDate('');
    } catch (err) {
      toast.error(err.message || 'Failed to send inquiry');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleRequestVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/properties/${id}` } } });
    if (!isVerified) return toast.error('Please verify your identity to schedule visits.');
    if (!visitDate) return toast.error('Please select a date');

    setVisitLoading(true);
    try {
      await requestVisit({
        propertyId: id,
        requestedDate: visitDate,
        requestedTime: visitTime,
      });
      toast.success('Visit request sent! The seller will confirm the schedule.');
      setVisitDate('');
    } catch (err) {
      toast.error(err.message || 'Failed to send visit request');
    } finally {
      setVisitLoading(false);
    }
  };

  if (loading) return <FullPageLoader message="Loading property details..." />;
  if (!property) return null;

  const { title, description, price, pricePerSqft, area, propertyType, bedrooms, bathrooms, floors, furnishing, amenities, images, seller, location, views, featured, status, priceSuggestion } = property;
  const typeColor = getPropertyTypeColor(propertyType);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6 uppercase tracking-wider">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-gray-300">/</span>
          <Link to="/properties" className="hover:text-primary-600 transition-colors">Properties</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 truncate max-w-[200px] sm:max-w-xs">{title}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left: Main Content ─── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <PropertyImages images={images} title={title} />
            </motion.div>

            {/* Title & Price Card */}
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeColor} uppercase tracking-wider`}>
                        {formatPropertyType(propertyType)}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusBadgeClass(status)} uppercase tracking-wider`}>
                        {status}
                      </span>
                      {featured && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-premium-500 to-premium-600 text-white uppercase tracking-wider shadow-sm shadow-premium-500/30">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">{title}</h1>
                    <div className="flex items-center gap-1.5 text-gray-500 text-base font-medium">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      {location?.address}, {location?.city}, {location?.state} - {location?.pincode}
                    </div>
                  </div>

                  <div className="md:text-right flex flex-col md:items-end">
                    <p className="text-4xl sm:text-5xl font-extrabold text-primary-600 tracking-tight">{formatPrice(price)}</p>
                    {pricePerSqft > 0 && <p className="text-base text-gray-500 mt-1 font-medium">₹{pricePerSqft?.toLocaleString('en-IN')}/sq.ft</p>}
                    
                    <div className="flex items-center gap-3 mt-4 w-full md:w-auto">
                      <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSaved(!isSaved)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold transition-colors ${
                          isSaved ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <Share2 className="w-4 h-4" /> Share
                      </motion.button>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">{views} Views this week</p>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-8 border-t border-gray-100">
                  {[
                    { icon: Bed, label: 'Bedrooms', value: `${bedrooms} BHK` },
                    { icon: Bath, label: 'Bathrooms', value: `${bathrooms} Bath` },
                    { icon: Maximize2, label: 'Area', value: formatArea(area) },
                    { icon: Layers, label: 'Floors', value: `${floors || 1} Floor${(floors || 1) > 1 ? 's' : ''}` },
                    { icon: Building, label: 'Type', value: formatPropertyType(propertyType) },
                    { icon: Sofa, label: 'Furnishing', value: furnishing?.replace('-', ' ')?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unfurnished' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                        <Icon className="w-5 h-5 text-primary-500" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-sm font-extrabold text-gray-900 text-center">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary-500" /> About this property
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Amenities */}
            {amenities?.length > 0 && (
              <ScrollReveal>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" /> Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl px-4 py-3 border border-transparent hover:border-primary-100 hover:bg-primary-50/50 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Map */}
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" /> Location & Context
                </h2>
                <div className="rounded-2xl overflow-hidden border border-gray-100 h-[400px]">
                  <PropertyDetailMap property={property} />
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { emoji: '🏫', label: 'Schools', dec: 'Multiple nearby' },
                    { emoji: '🏥', label: 'Hospitals', dec: 'Within 5km' },
                    { emoji: '🚇', label: 'Transport', dec: 'Well connected' },
                    { emoji: '🛍️', label: 'Shopping', dec: 'Malls & Marts' },
                  ].map(({ emoji, label, dec }) => (
                    <div key={label} className="bg-gray-50 rounded-2xl p-4 text-center border border-transparent hover:border-gray-200 transition-colors">
                      <p className="text-3xl mb-2">{emoji}</p>
                      <p className="text-sm font-bold text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{dec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Price Comparison + Future Value Estimate */}
            <ScrollReveal>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 font-display">Market Analysis</h2>
                <PriceSuggestionDisplay suggestion={priceSuggestion} propertyPrice={price} city={location?.city} />
              </div>
            </ScrollReveal>
          </div>

          {/* ─── Right: Sticky Sidebar ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Seller Information */}
              <ScrollReveal direction="left">
                <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
                  <h3 className="font-extrabold text-gray-900 mb-5 tracking-tight">Seller Profile</h3>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 rounded-full flex items-center justify-center text-2xl font-black shadow-inner border border-white">
                        {seller?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      {seller?.verificationStatus === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{seller?.name}</p>
                      {seller?.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Shield className="w-3.5 h-3.5" /> ID Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {isVerified && seller?.phone && (
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between text-sm font-bold text-gray-800 bg-gray-50 rounded-xl p-4 border border-gray-100 cursor-pointer hover:border-primary-200 hover:bg-primary-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Phone className="w-4 h-4 text-primary-600" />
                        </div>
                        {seller.phone}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  )}
                  
                  {!isAuthenticated && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                      <p className="text-xs text-gray-500 font-medium mb-2">Want to contact the seller?</p>
                      <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in to view details</Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Contact / Action Forms */}
              <ScrollReveal direction="left" delay={0.1}>
                {/* AI Prediction Panel */}
                <div className="mb-6">
                  <AIPredictionPanel property={property} />
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  {/* Tabs for Inquiry vs Visit (if buyer) */}
                  <div className="flex border-b border-gray-100">
                    <button className="flex-1 py-4 text-sm font-extrabold text-primary-600 border-b-2 border-primary-600 bg-primary-50/30 flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Inquiry
                    </button>
                    {isAuthenticated && isBuyer && (
                      <button className="flex-1 py-4 text-sm font-extrabold text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                        <Calendar className="w-4 h-4" /> Visit
                      </button>
                    )}
                  </div>

                  <div className="p-6">
                    {!isAuthenticated ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-base text-gray-900 font-bold mb-2">Interested in this property?</p>
                        <p className="text-sm text-gray-500 mb-6">Create an account or sign in to contact the seller directly.</p>
                        <Link to="/login" className="btn-primary w-full py-3.5 text-sm shadow-lg shadow-primary-500/30 block text-center">Sign In Now</Link>
                      </div>
                    ) : !isVerified ? (
                      <div className="text-center py-6 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                        <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <p className="text-sm text-yellow-800 font-bold mb-1">Verification Required</p>
                        <p className="text-xs text-yellow-600 mb-4 px-4">You must verify your identity to ensure a safe environment for everyone.</p>
                        <Link to={`/${user?.role}/verification`} className="btn-primary w-full py-3 text-sm px-6 mx-auto block max-w-[200px] shadow-sm">
                          Verify Identity
                        </Link>
                      </div>
                    ) : (
                      <form onSubmit={handleSendInquiry} className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Message</label>
                          <textarea
                            value={inquiryText}
                            onChange={(e) => setInquiryText(e.target.value)}
                            placeholder="Hi, I'm interested in this property. Is it still available?"
                            rows={4}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 transition-colors resize-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Contact Number</label>
                          <input
                            type="tel"
                            value={inquiryPhone}
                            onChange={(e) => setInquiryPhone(e.target.value)}
                            placeholder="+91 99999 99999"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-3 transition-colors"
                            required
                            maxLength={10}
                          />
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          type="submit" 
                          disabled={submitLoading} 
                          className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                        >
                          {submitLoading ? 'Sending...' : <><MessageSquare className="w-4 h-4" /> Send Inquiry to Seller</>}
                        </motion.button>
                        <p className="text-center text-xs text-gray-400 font-medium mt-2">Connecting you securely with the seller.</p>
                      </form>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
