import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize2, Calendar, Phone, MessageSquare,
  CheckCircle2, ArrowLeft, Share2, Building, Layers, Sofa, Shield
} from 'lucide-react';
import { getProperty } from '../api/property.api';
import { sendInquiry } from '../api/inquiry.api';
import { requestVisit } from '../api/visit.api';
import { useAuth } from '../context/AuthContext';
import PropertyImages from '../components/property/PropertyImages';
import { PropertyDetailMap } from '../components/property/PropertyMap';
import { PriceSuggestionDisplay } from '../components/property/PriceSuggestion';
import { FullPageLoader } from '../components/common/Loader';
import { formatPrice, formatArea, formatDate, getPropertyTypeColor, formatPropertyType, getStatusBadgeClass } from '../utils/formatters';
import toast from 'react-hot-toast';
import Footer from '../components/common/Footer';

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
    window.scrollTo(0, 0);
  }, [id]);

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
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/properties" className="hover:text-primary-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <PropertyImages images={images} title={title} />

            {/* Title & Price */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColor}`}>
                      {formatPropertyType(propertyType)}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(status)}`}>
                      {status}
                    </span>
                    {featured && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent-100 text-accent-700">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 text-primary-400" />
                    {location?.address}, {location?.city}, {location?.state} - {location?.pincode}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-extrabold text-primary-700">{formatPrice(price)}</p>
                  {pricePerSqft > 0 && <p className="text-sm text-gray-500 mt-0.5">₹{pricePerSqft?.toLocaleString('en-IN')}/sq.ft</p>}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 justify-end">
                    <span>{views} views</span>
                    <button className="flex items-center gap-1 hover:text-primary-600">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                {[
                  { icon: Bed, label: 'Bedrooms', value: `${bedrooms} BHK` },
                  { icon: Bath, label: 'Bathrooms', value: `${bathrooms} Bath` },
                  { icon: Maximize2, label: 'Area', value: formatArea(area) },
                  { icon: Layers, label: 'Floors', value: `${floors || 1} Floor${(floors || 1) > 1 ? 's' : ''}` },
                  { icon: Building, label: 'Type', value: formatPropertyType(propertyType) },
                  { icon: Sofa, label: 'Furnishing', value: furnishing?.replace('-', ' ')?.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unfurnished' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl">
                    <Icon className="w-5 h-5 text-primary-500 mb-1" />
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{description}</p>
            </div>

            {/* Amenities */}
            {amenities?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700 bg-primary-50 rounded-lg px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Location & Nearby</h2>
              <PropertyDetailMap property={property} />
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { emoji: '🏫', label: 'Schools' },
                  { emoji: '🏥', label: 'Hospitals' },
                  { emoji: '🚇', label: 'Transport' },
                  { emoji: '🛍️', label: 'Shopping' },
                ].map(({ emoji, label }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xl">{emoji}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Comparison */}
            {priceSuggestion && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Market Price Analysis</h2>
                <PriceSuggestionDisplay suggestion={priceSuggestion} propertyPrice={price} />
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">
            {/* Seller Info */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Seller Information</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-lg font-bold">
                    {seller?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {seller?.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                      <Shield className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{seller?.name}</p>
                  {seller?.verificationStatus === 'verified' ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                        <Shield className="w-3 h-3" /> Verified Seller
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Unverified Seller</p>
                  )}
                </div>
              </div>
              {isVerified && seller?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Phone className="w-4 h-4 text-primary-500" />
                  {seller.phone}
                </div>
              )}
              {!isAuthenticated && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  <Link to="/login" className="text-primary-600 font-medium">Sign in</Link> to view contact details
                </p>
              )}
            </div>

            {/* Send Inquiry */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-600" />
                Send Inquiry
              </h3>
              {!isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">Please sign in to send inquiries</p>
                  <Link to="/login" className="btn-primary py-2 text-sm">Sign In</Link>
                </div>
              ) : !isVerified ? (
                <div className="text-center py-4 bg-yellow-50 rounded-lg p-3">
                  <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-yellow-700 font-medium">Verification Required</p>
                  <p className="text-xs text-yellow-600 mt-1">Verify your identity to send inquiries</p>
                  <Link to={`/${user?.role}/verification`} className="text-xs text-primary-600 font-medium mt-2 block">
                    Verify Now →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <textarea
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="I'm interested in this property. Please share more details..."
                    rows={3}
                    className="form-input resize-none text-sm"
                    required
                  />
                  <input
                    type="tel"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="Your contact number"
                    className="form-input text-sm"
                    required
                    maxLength={10}
                  />
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input text-sm"
                    placeholder="Preferred visit date (optional)"
                  />
                  <button type="submit" disabled={submitLoading} className="btn-primary w-full py-2.5 text-sm">
                    {submitLoading ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>

            {/* Schedule Visit */}
            {isAuthenticated && isBuyer && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Schedule a Visit
                </h3>
                {!isVerified ? (
                  <div className="text-center py-2 bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-600">Verify your identity to schedule visits</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestVisit} className="space-y-3">
                    <div>
                      <label className="form-label text-xs">Preferred Date</label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className="form-input text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Preferred Time</label>
                      <input
                        type="time"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="form-input text-sm"
                      />
                    </div>
                    <button type="submit" disabled={visitLoading} className="btn-success w-full py-2.5 text-sm">
                      {visitLoading ? 'Sending...' : 'Request Visit'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
