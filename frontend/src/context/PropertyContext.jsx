import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProperties, getFeaturedProperties } from '../api/property.api';
import { getTrendingAreas, getPopularProperties, getMarketStats } from '../api/verification.api';

const PropertyContext = createContext(null);

export const PropertyProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [popularProperties, setPopularProperties] = useState([]);
  const [trendingAreas, setTrendingAreas] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [filters, setFiltersState] = useState({
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [],
    sort: 'newest',
    q: '',
  });

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await getProperties({ ...filters, ...params });
      setProperties(res.data || []);
      if (res.meta) setPagination(res.meta);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await getFeaturedProperties();
      setFeaturedProperties(res.data || []);
    } catch (err) {
      console.error('Failed to fetch featured:', err);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const [areasRes, popularRes, statsRes] = await Promise.all([
        getTrendingAreas(),
        getPopularProperties(8),
        getMarketStats(),
      ]);
      setTrendingAreas(areasRes.data || []);
      setPopularProperties(popularRes.data || []);
      setMarketStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch trending data:', err);
    }
  }, []);

  const setFilters = useCallback((newFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({
      city: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      amenities: [],
      sort: 'newest',
      q: '',
    });
  }, []);

  const value = {
    properties,
    selectedProperty,
    setSelectedProperty,
    featuredProperties,
    popularProperties,
    trendingAreas,
    marketStats,
    loading,
    pagination,
    filters,
    fetchProperties,
    fetchFeatured,
    fetchTrending,
    setFilters,
    clearFilters,
  };

  return <PropertyContext.Provider value={value}>{children}</PropertyContext.Provider>;
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;
