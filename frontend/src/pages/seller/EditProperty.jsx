import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty } from '../../api/property.api';
import { FullPageLoader } from '../../components/common/Loader';
import { Building2, Check } from 'lucide-react';
import { LocationPickerMap } from '../../components/property/PropertyMap';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'land', 'office'];
const FURNISHING = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const AMENITIES = ['parking', 'gym', 'swimming pool', 'garden', 'security', 'elevator', 'power backup', 'water supply', 'air conditioning', 'intercom', 'wifi'];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProperty(id);
        const p = res.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price || '',
          area: p.area || '',
          propertyType: p.propertyType || '',
          bedrooms: p.bedrooms ?? '',
          bathrooms: p.bathrooms ?? '',
          floors: p.floors || 1,
          furnishing: p.furnishing || 'unfurnished',
          amenities: p.amenities || [],
          status: p.status || 'active',
          location: p.location || { address: '', city: '', state: '', country: 'India', pincode: '', coordinates: { type: 'Point', coordinates: [0, 0] } },
        });
      } catch {
        toast.error('Property not found');
        navigate('/seller/dashboard');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || !form) return <FullPageLoader />;

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const updateLocation = (key, val) => setForm((prev) => ({ ...prev, location: { ...prev.location, [key]: val } }));
  const toggleAmenity = (a) => setForm((prev) => ({
    ...prev,
    amenities: prev.amenities.includes(a) ? prev.amenities.filter((x) => x !== a) : [...prev.amenities, a],
  }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'location') formData.append(k, JSON.stringify(v));
        else if (k === 'amenities') formData.append(k, JSON.stringify(v));
        else formData.append(k, v);
      });
      newImages.forEach((file) => formData.append('images', file));
      await updateProperty(id, formData);
      toast.success('Property updated successfully!');
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  const coords = form.location?.coordinates?.coordinates || [0, 0];
  const hasCoords = coords[0] !== 0 || coords[1] !== 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-500 text-sm mt-1">Update your property listing details.</p>
        </div>

        <div className="card p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="form-label">Property Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea className="form-input resize-none" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price (₹) *</label>
              <input className="form-input" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Area (sq.ft) *</label>
              <input className="form-input" type="number" value={form.area} onChange={(e) => update('area', e.target.value)} />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="form-label">Property Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => update('propertyType', type)}
                  className={`py-2 text-sm rounded-xl border font-medium capitalize ${form.propertyType === type ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Floors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Bedrooms</label>
              <input className="form-input" type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} min="0" />
            </div>
            <div>
              <label className="form-label">Bathrooms</label>
              <input className="form-input" type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} min="0" />
            </div>
            <div>
              <label className="form-label">Floors</label>
              <input className="form-input" type="number" value={form.floors} onChange={(e) => update('floors', e.target.value)} min="1" />
            </div>
          </div>

          {/* Furnishing */}
          <div>
            <label className="form-label">Furnishing</label>
            <div className="grid grid-cols-3 gap-2">
              {FURNISHING.map((f) => (
                <button key={f} type="button" onClick={() => update('furnishing', f)}
                  className={`py-2 text-xs rounded-xl border font-medium capitalize ${form.furnishing === f ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {f.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="form-label">Listing Status</label>
            <select className="form-input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive (Hidden)</option>
              <option value="sold">Sold</option>
            </select>
          </div>

          {/* Location */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
            <div className="space-y-3">
              <input className="form-input" placeholder="Street Address" value={form.location.address} onChange={(e) => updateLocation('address', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className="form-input" placeholder="City" value={form.location.city} onChange={(e) => updateLocation('city', e.target.value)} />
                <input className="form-input" placeholder="State" value={form.location.state} onChange={(e) => updateLocation('state', e.target.value)} />
              </div>
              <input className="form-input" placeholder="Pincode" maxLength={6} value={form.location.pincode} onChange={(e) => updateLocation('pincode', e.target.value)} />
              <LocationPickerMap
                onLocationSelect={(lat, lng) => updateLocation('coordinates', { type: 'Point', coordinates: [lng, lat] })}
                initialLat={hasCoords ? coords[1] : null}
                initialLng={hasCoords ? coords[0] : null}
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES.map((a) => {
                const sel = form.amenities.includes(a);
                return (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm capitalize ${sel ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${sel ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add more images */}
          <div className="border-t border-gray-100 pt-4">
            <label className="form-label">Add More Photos</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setNewImages(Array.from(e.target.files))} className="form-input" />
            {newImages.length > 0 && <p className="text-xs text-primary-600 mt-1">{newImages.length} new images selected</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/seller/dashboard')} className="btn-secondary py-3 px-6">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              {submitting ? 'Saving...' : (<><Building2 className="w-4 h-4" /> Save Changes</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
