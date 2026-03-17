import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Grid, Map, SlidersHorizontal, Building2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import { PropertiesListMap } from '../components/property/PropertyMap';
import { PropertyGridSkeleton } from '../components/common/Loader';

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading, pagination, filters, setFilters, fetchProperties, clearFilters } = useProperty();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [quickSearch, setQuickSearch] = useState(searchParams.get('q') || '');
  const debounceRef = useRef(null);

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters = {};
    ['city', 'propertyType', 'minPrice', 'maxPrice', 'bedrooms', 'sort', 'q', 'featured'].forEach((key) => {
      const val = searchParams.get(key);
      if (val) initialFilters[key] = val;
    });
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    const params = {};
    searchParams.forEach((val, key) => { params[key] = val; });
    fetchProperties({ page: searchParams.get('page') || 1, ...params });
  }, []);

  // Debounced quick search (fires after 500ms of no typing)
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
    // Sync filters to URL
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
    setSearchParams({});
    fetchProperties({ status: 'active', page: 1 });
  };

  const handlePageChange = (newPage) => {
    fetchProperties({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePropertyMapClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  const hasActiveFilters = filters.city || filters.propertyType || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.q;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${pagination.total?.toLocaleString('en-IN') || 0} Properties Found`}
            </h1>
            {hasActiveFilters && (
              <p className="text-xs text-gray-500 mt-0.5">
                Filtered results {filters.city ? `in ${filters.city}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, city, address..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 focus:bg-white transition-all"
                value={quickSearch}
                onChange={(e) => handleQuickSearch(e.target.value)}
              />
              {quickSearch && (
                <button onClick={() => handleQuickSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-72 flex-shrink-0">
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
            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <PropertyFilters
                filters={filters}
                onFilterChange={setFilters}
                onApply={handleApply}
                onReset={handleReset}
                loading={loading}
              />
            </div>

            {viewMode === 'map' ? (
              <div className="bg-white rounded-xl overflow-hidden shadow-card border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                  <Map className="w-4 h-4 text-primary-600" />
                  {properties.length} properties shown on map
                </div>
                <PropertiesListMap
                  properties={properties}
                  onPropertyClick={handlePropertyMapClick}
                />
              </div>
            ) : loading ? (
              <PropertyGridSkeleton count={9} />
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties Found</h3>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={handleReset} className="btn-secondary py-2 px-6 text-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              page === pagination.page
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-gray-400 mt-3">
                  Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
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
