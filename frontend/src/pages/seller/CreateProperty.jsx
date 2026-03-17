import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, Check, Building2, Camera, Plus } from 'lucide-react';
import { createProperty } from '../../api/property.api';
import { LocationPickerMap } from '../../components/property/PropertyMap';
import PriceSuggestion from '../../components/property/PriceSuggestion';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'land', 'office'];
const FURNISHING = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const AMENITIES = [
  'parking', 'gym', 'swimming pool', 'garden', 'security', 'elevator',
  'power backup', 'water supply', 'air conditioning', 'intercom', 'club house',
  'children play area', 'fire safety', 'cctv', 'wifi',
];

const steps = ['Basic Info', 'Location', 'Amenities', 'Photos', 'Review'];

const CreateProperty = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [priceSuggestion, setPriceSuggestion] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    floors: '1',
    furnishing: 'unfurnished',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      coordinates: { type: 'Point', coordinates: [0, 0] },
    },
    amenities: [],
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const updateLocation = (key, val) => setForm((prev) => ({
    ...prev,
    location: { ...prev.location, [key]: val },
  }));

  const toggleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 10) return toast.error('Maximum 10 images allowed');
    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} too large (max 5MB)`); return false; }
      return true;
    });
    setImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews((prev) => [...prev, reader.result]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapClick = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: { type: 'Point', coordinates: [lng, lat] },
      },
    }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.title || form.title.length < 10) return 'Title must be at least 10 characters';
      if (!form.description || form.description.length < 30) return 'Description must be at least 30 characters';
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return 'Enter a valid price';
      if (!form.area || isNaN(form.area) || Number(form.area) <= 0) return 'Enter a valid area';
      if (!form.propertyType) return 'Select a property type';
      if (form.bedrooms === '' || isNaN(form.bedrooms)) return 'Enter number of bedrooms';
      if (form.bathrooms === '' || isNaN(form.bathrooms)) return 'Enter number of bathrooms';
    }
    if (step === 1) {
      if (!form.location.address) return 'Address is required';
      if (!form.location.city) return 'City is required';
      if (!form.location.state) return 'State is required';
      if (!form.location.pincode || !/^[0-9]{6}$/.test(form.location.pincode)) return 'Enter a valid 6-digit pincode';
    }
    if (step === 3 && imageFiles.length === 0) return 'Please upload at least one photo';
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) return toast.error(err);
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append all text fields
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('area', form.area);
      formData.append('propertyType', form.propertyType);
      formData.append('bedrooms', form.bedrooms);
      formData.append('bathrooms', form.bathrooms);
      formData.append('floors', form.floors);
      formData.append('furnishing', form.furnishing);
      formData.append('location', JSON.stringify(form.location));
      formData.append('amenities', JSON.stringify(form.amenities));

      // Append images
      imageFiles.forEach((file) => formData.append('images', file));

      await createProperty(formData);
      toast.success('Property listed successfully!');
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const coords = form.location.coordinates.coordinates;
  const hasCoords = coords[0] !== 0 || coords[1] !== 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">List a New Property</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to list your property on the platform.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 ${
                i < step ? 'bg-primary-500 text-white' : i === step ? 'bg-primary-900 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card p-6">
          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>

              <div>
                <label className="form-label">Property Title *</label>
                <input className="form-input" placeholder="e.g., Spacious 3BHK Apartment in Bandra West" value={form.title} onChange={(e) => update('title', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/200 characters (min 10)</p>
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea className="form-input resize-none" rows={4} placeholder="Describe your property in detail..." value={form.description} onChange={(e) => update('description', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/5000 (min 30)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" placeholder="5000000" value={form.price} onChange={(e) => update('price', e.target.value)} min="1" />
                </div>
                <div>
                  <label className="form-label">Area (sq.ft) *</label>
                  <input className="form-input" type="number" placeholder="1200" value={form.area} onChange={(e) => update('area', e.target.value)} min="1" />
                </div>
              </div>

              <div>
                <label className="form-label">Property Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('propertyType', type)}
                      className={`py-2.5 text-sm rounded-xl border font-medium capitalize transition-all ${
                        form.propertyType === type
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Bedrooms *</label>
                  <input className="form-input" type="number" placeholder="3" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} min="0" max="50" />
                </div>
                <div>
                  <label className="form-label">Bathrooms *</label>
                  <input className="form-input" type="number" placeholder="2" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} min="0" max="50" />
                </div>
                <div>
                  <label className="form-label">Floors</label>
                  <input className="form-input" type="number" placeholder="1" value={form.floors} onChange={(e) => update('floors', e.target.value)} min="1" />
                </div>
              </div>

              <div>
                <label className="form-label">Furnishing Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {FURNISHING.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => update('furnishing', f)}
                      className={`py-2.5 text-xs rounded-xl border font-medium capitalize transition-all ${
                        form.furnishing === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Suggestion */}
              {form.city && form.propertyType && form.area && (
                <div className="pt-2 border-t border-gray-100">
                  <PriceSuggestion
                    city={form.location.city}
                    propertyType={form.propertyType}
                    area={form.area}
                    bedrooms={form.bedrooms}
                    onSuggestion={setPriceSuggestion}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Property Location</h2>

              <div>
                <label className="form-label">Street Address *</label>
                <input className="form-input" placeholder="123, Main Street, Locality Name" value={form.location.address} onChange={(e) => updateLocation('address', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">City *</label>
                  <input className="form-input" placeholder="Mumbai" value={form.location.city} onChange={(e) => updateLocation('city', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">State *</label>
                  <input className="form-input" placeholder="Maharashtra" value={form.location.state} onChange={(e) => updateLocation('state', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Country</label>
                  <input className="form-input" value={form.location.country} onChange={(e) => updateLocation('country', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Pincode *</label>
                  <input className="form-input" placeholder="400001" maxLength={6} value={form.location.pincode} onChange={(e) => updateLocation('pincode', e.target.value)} />
                </div>
              </div>

              {/* Map Picker */}
              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Pin Exact Location on Map
                  {hasCoords && <span className="text-xs text-primary-600 font-normal">✓ Location pinned</span>}
                </label>
                <p className="text-xs text-gray-400 mb-2">Click on the map to mark the exact property location</p>
                <LocationPickerMap
                  onLocationSelect={handleMapClick}
                  initialLat={hasCoords ? coords[1] : null}
                  initialLng={hasCoords ? coords[0] : null}
                />
                {hasCoords && (
                  <p className="text-xs text-gray-500 mt-2">
                    Coordinates: {coords[1].toFixed(6)}, {coords[0].toFixed(6)}
                  </p>
                )}
              </div>

              {/* Price suggestion after location set */}
              {form.location.city && form.propertyType && form.area && (
                <div className="border-t border-gray-100 pt-4">
                  <label className="form-label">💡 Get AI Price Estimate</label>
                  <PriceSuggestion
                    city={form.location.city}
                    propertyType={form.propertyType}
                    area={form.area}
                    bedrooms={form.bedrooms}
                    onSuggestion={setPriceSuggestion}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Amenities ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Amenities & Features</h2>
              <p className="text-sm text-gray-500">Select all amenities available in your property.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map((amenity) => {
                  const selected = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm capitalize font-medium transition-all ${
                        selected
                          ? 'bg-primary-50 border-primary-500 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        selected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {amenity}
                    </button>
                  );
                })}
              </div>

              {form.amenities.length > 0 && (
                <p className="text-sm text-primary-600 font-medium">{form.amenities.length} amenities selected</p>
              )}
            </div>
          )}

          {/* ── Step 3: Images ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Property Photos</h2>
              <p className="text-sm text-gray-500">Upload high-quality photos. First photo will be the cover image.</p>

              <div
                className="upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  handleImageAdd({ target: { files } });
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5MB each · Up to 10 photos</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">Cover</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                        className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800">Review & Submit</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium text-right max-w-xs truncate">{form.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{form.propertyType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-bold text-primary-700">₹{Number(form.price).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Area</span><span className="font-medium">{form.area} sq.ft</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Config</span><span className="font-medium">{form.bedrooms} BHK, {form.bathrooms} Bath</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-right">{form.location.address}, {form.location.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amenities</span><span className="font-medium">{form.amenities.length} selected</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Photos</span><span className="font-medium">{imageFiles.length} uploaded</span></div>
              </div>

              {/* Preview images */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {imagePreviews.slice(0, 5).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                  ))}
                </div>
              )}

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-sm text-primary-700">
                ℹ️ Your listing will be published immediately and visible to buyers after submission.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            {step > 0 && (
              <button type="button" onClick={goBack} className="btn-secondary py-3 px-6">
                ← Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" onClick={goNext} className="btn-primary flex-1 py-3">
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                {loading ? 'Publishing...' : (<><Building2 className="w-4 h-4" /> Publish Property</>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProperty;
