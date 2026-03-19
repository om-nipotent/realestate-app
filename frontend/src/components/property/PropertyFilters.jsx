import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const activeFilterCount = [
    filters.city,
    filters.propertyType,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    ...(filters.amenities || []),
  ].filter(Boolean).length;

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block pl-10 p-2.5 transition-colors"
            value={filters.q || ''}
            onChange={(e) => handleChange('q', e.target.value)}
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">City / Location</label>
        <input
          type="text"
          placeholder="Mumbai, Delhi, Bangalore..."
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors"
          value={filters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Property Type</label>
        <select
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors"
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bedrooms</label>
        <div className="flex gap-2 flex-wrap">
          {['', 1, 2, 3, 4, 5].map((val) => {
            const isSelected = (filters.bedrooms || '') === (val === '' ? '' : val.toString());
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleChange('bedrooms', val === '' ? '' : val.toString())}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-[0_0_0_1px_rgba(192,38,211,0.5)]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {val === '' ? 'Any' : val === 5 ? '5+' : `${val} BHK`}
                {isSelected && (
                  <motion.div layoutId="bed-active" className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Amenities</label>
        <div className="grid grid-cols-2 gap-3">
          {AMENITIES.map((amenity) => {
            const isChecked = (filters.amenities || []).includes(amenity);
            return (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300 group-hover:border-primary-400'}`}>
                  <AnimatePresence>
                    {isChecked && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={() => handleAmenityToggle(amenity)}
                />
                <span className="text-sm font-medium text-gray-700 capitalize group-hover:text-gray-900 transition-colors">{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
        <select
          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 transition-colors cursor-pointer"
          value={filters.sort || 'newest'}
          onChange={(e) => handleChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => {
            onApply();
            setShowMobileFilters(false);
          }}
          disabled={loading}
          className="flex-1 btn-primary py-3 text-sm font-bold shadow-lg"
        >
          {loading ? 'Searching...' : 'Apply Filters'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => {
            onReset();
            setShowMobileFilters(false);
          }}
          className="px-5 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          Reset
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-28 z-10 w-full max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900 flex items-center gap-2 text-lg tracking-tight">
            <Filter className="w-5 h-5 text-primary-600" /> Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {activeFilterCount}
              </span>
            )}
          </h2>
          {activeFilterCount > 0 && (
            <button onClick={() => { onReset(); setShowMobileFilters(false); }} className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-wider">
              Clear all
            </button>
          )}
        </div>
        {renderFilterContent()}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden relative z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4 text-primary-600" />
          Filter & Sort Properties
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden mt-3"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mt-2">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderFilterContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PropertyFilters;
