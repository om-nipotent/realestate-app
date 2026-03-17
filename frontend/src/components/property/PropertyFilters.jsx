import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'land', 'office'];
const AMENITIES = ['parking', 'gym', 'swimming pool', 'garden', 'security', 'elevator', 'power backup', 'wifi'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const PropertyFilters = ({ filters, onFilterChange, onApply, onReset, loading }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleAmenityToggle = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    handleChange('amenities', updated);
  };

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="form-label">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="form-input pl-9"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="form-label">City / Location</label>
        <input
          type="text"
          placeholder="Mumbai, Delhi, Bangalore..."
          className="form-input"
          value={filters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="form-label">Property Type</label>
        <select
          className="form-input"
          value={filters.propertyType || ''}
          onChange={(e) => handleChange('propertyType', e.target.value)}
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="form-label">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            className="form-input w-1/2"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₹"
            className="form-input w-1/2"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="form-label">Bedrooms</label>
        <div className="flex gap-2 flex-wrap">
          {['', 1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleChange('bedrooms', val === '' ? '' : val.toString())}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                (filters.bedrooms || '') === (val === '' ? '' : val.toString())
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
              }`}
            >
              {val === '' ? 'Any' : val === 5 ? '5+' : `${val} BHK`}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="form-label">Amenities</label>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                checked={(filters.amenities || []).includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
              />
              <span className="text-sm text-gray-700 capitalize">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="form-label">Sort By</label>
        <select
          className="form-input"
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="flex-1 btn-primary py-2.5 text-sm"
        >
          {loading ? 'Searching...' : 'Apply Filters'}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-xl shadow-card border border-gray-100 p-5 sticky top-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </h2>
          <button onClick={onReset} className="text-xs text-primary-600 hover:text-primary-800">
            Clear all
          </button>
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {filters.city || filters.propertyType || filters.bedrooms ? (
            <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">!</span>
          ) : null}
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>

        {showMobileFilters && (
          <div className="mt-3 bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FilterContent />
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyFilters;
