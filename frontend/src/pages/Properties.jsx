import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Map as MapIcon, Building2, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import { PropertiesListMap } from '../components/property/PropertyMap';
import { PropertyGridSkeleton } from '../components/common/Loader';
import ScrollReveal from '../components/common/ScrollReveal';

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading, pagination, filters, setFilters, fetchProperties, clearFilters } = useProperty();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [quickSearch, setQuickSearch] = useState(searchParams.get('q') || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const initialFilters = {};
    ['city', 'propertyType', 'minPrice', 'maxPrice', 'bedrooms', 'sort', 'q', 'featured'].forEach((key) => {
      const val = searchParams.get(key);
      if (val) initialFilters[key] = val;
    });
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
    // Fetch initial
    const params = {};
    searchParams.forEach((val, key) => { params[key] = val; });
    fetchProperties({ page: searchParams.get('page') || 1, ...params });
    // eslint-disable-next-line
  }, []); // Run only on mount

  const handleQuickSearch = (value) => {
    setQuickSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const newFilters = { ...filters, q: value };
      setFilters(newFilters);
      const params = {};
      Object.entries(newFilters).forEach(([k, v]) => { if (v) params[k] = v; });
      if (!value) delete params.q;
      setSearchParams(params);
      fetchProperties({ ...newFilters, q: value, page: 1 });
    }, 500);
  };

  const handleApply = useCallback(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v && (typeof v === 'string' ? v.trim() : true)) {
        if (Array.isArray(v)) {
          if (v.length > 0) params[k] = v.join(',');
        } else {
          params[k] = v;
        }
      }
    });
    setSearchParams(params);
    fetchProperties({ ...filters, page: 1 });
  }, [filters, fetchProperties, setSearchParams]);

  const handleReset = () => {
    clearFilters();
    setQuickSearch('');
    setSearchParams({});
    fetchProperties({ status: 'active', page: 1 });
  };

  const handlePageChange = (newPage) => {
    fetchProperties({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertyMapClick = (propertyId) => navigate(`/properties/${propertyId}`);

  const hasActiveFilters = filters.city || filters.propertyType || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.q;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* ── Header Area ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[72px] z-30 transform-gpu transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight"
              >
                {loading ? 'Searching Market...' : `${pagination.total?.toLocaleString('en-IN') || 0} Properties Found`}
              </motion.h1>
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mt-1.5"
                  >
                    <span className="inline-flex items-center bg-primary-50 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full border border-primary-100">
                      Filtered Search
                    </span>
                    {filters.city && <span className="text-gray-500 text-sm font-medium">in {filters.city}</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quick Search Bar */}
              <motion.div 
                animate={{ width: isSearchFocused ? '320px' : '280px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative flex items-center group bg-gray-50 border transition-all duration-300 rounded-xl overflow-hidden w-full sm:w-auto ${
                  isSearchFocused ? 'border-primary-400 shadow-lg shadow-primary-500/10 bg-white' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="pl-4 pr-2">
                  <Search className={`w-4 h-4 transition-colors ${isSearchFocused ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                </div>
                <input
                  type="text"
                  placeholder="Quick search by title, location..."
                  className="w-full py-3 pr-10 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                  value={quickSearch}
                  onChange={(e) => handleQuickSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {quickSearch && (
                  <button onClick={() => handleQuickSearch('')} className="absolute right-3 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>

              {/* View toggle */}
              <div className="flex bg-gray-100/80 backdrop-blur-sm shadow-inner rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors z-10 ${viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {viewMode === 'grid' && (
                    <motion.div layoutId="view-toggle" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50 -z-10" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                  )}
                  <Grid className="w-4 h-4" /> <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors z-10 ${viewMode === 'map' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {viewMode === 'map' && (
                    <motion.div layoutId="view-toggle" className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50 -z-10" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                  )}
                  <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-[320px] flex-shrink-0">
            <PropertyFilters
              filters={filters}
              onFilterChange={setFilters}
              onApply={handleApply}
              onReset={handleReset}
              loading={loading}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 border border-gray-100"
              >
                <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <MapIcon className="w-4 h-4 text-primary-600" /> Interactive Map
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">{properties.length} matches</span>
                </div>
                <div className="h-[75vh] min-h-[600px] w-full">
                  <PropertiesListMap properties={properties} onPropertyClick={handlePropertyMapClick} />
                </div>
              </motion.div>
            ) : loading ? (
              <PropertyGridSkeleton count={9} />
            ) : properties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-28 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No properties align with your search</h3>
                <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto">Try adjusting your filters, location, or price range to discover more hidden gems.</p>
                <button onClick={handleReset} className="btn-primary py-3 px-8 text-sm shadow-xl hover:shadow-primary-500/30">
                  Reset Search Criteria
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property, i) => (
                    <ScrollReveal key={property._id} delay={i * 0.05} direction="up">
                      <PropertyCard property={property} />
                    </ScrollReveal>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12 pt-8 border-t border-gray-100">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="group flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" /> Previous
                    </button>

                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm">
                      {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                        const page = i + 1;
                        const isActive = page === pagination.page;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all relative ${
                              isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {isActive && (
                              <motion.div layoutId="page-active" className="absolute inset-0 bg-primary-600 rounded-lg shadow-md -z-10" />
                            )}
                            <span className="relative z-10">{page}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="group flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  </div>
                )}

                <p className="text-center font-semibold text-xs text-gray-400 mt-6 uppercase tracking-wider">
                  Displaying {((pagination.page - 1) * pagination.limit) + 1} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} High-Quality Listings
                </p>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Properties;
