import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Building2, Users, TrendingUp, Shield,
  CheckCircle2, ChevronRight, Star, Eye, ChevronLeft,
  Home, ArrowRight, Zap, Award, Heart, BarChart3,
  Newspaper, DollarSign, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import { formatPriceShort } from '../utils/formatters';
import { CardSkeleton } from '../components/common/Loader';
import Footer from '../components/common/Footer';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'land', 'office'];
const TYPE_ICONS = { apartment: '🏢', house: '🏡', villa: '🏰', commercial: '🏪', land: '🌿', office: '🏗️' };

const BANNER_FALLBACKS = [
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80',
    city: 'Goa', type: 'villa', price: 18500000,
    title: 'Oceanfront Luxury Villa',
    desc: 'Breathtaking sea views, private pool, and lush tropical gardens — your own slice of paradise',
  },
  {
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
    city: 'Bangalore', type: 'house', price: 9200000,
    title: 'Elegant Modern Bungalow',
    desc: 'Architecturally stunning 4BHK bungalow with open-plan living and premium finishes throughout',
  },
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    city: 'Pune', type: 'villa', price: 14000000,
    title: 'Contemporary Pool Villa',
    desc: 'Sleek designer villa with infinity pool, home theatre, and smart home automation',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    city: 'Mumbai', type: 'villa', price: 32000000,
    title: 'Premium Hillside Villa',
    desc: 'Exclusive gated community villa with panoramic city views and resort-style amenities',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    city: 'Hyderabad', type: 'house', price: 7800000,
    title: 'Spacious Family Bungalow',
    desc: 'Classic 5BHK bungalow in a prime locality with large garden, covered parking and quiet surroundings',
  },
];

// ── Auto-sliding Banner ────────────────────────────────────────────────────────
const HeroBanner = ({ properties }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  // Mix real property slides (with images) + fallback slides so banner is always rich
  const realSlides = properties
    .filter((p) => p.images?.[0]?.url)
    .slice(0, 3)
    .map((p) => ({
      image: p.images[0].url,
      title: p.title,
      desc: (p.description || '').slice(0, 90) + '...',
      city: p.location?.city,
      type: p.propertyType,
      price: p.price,
      id: p._id,
    }));

  const slides = [...realSlides, ...BANNER_FALLBACKS].slice(0, 6);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  const slide = slides[current];

  const handleBrowse = () => {
    const params = new URLSearchParams();
    if (slide.city) params.set('city', slide.city);
    if (slide.type) params.set('propertyType', slide.type);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative h-[92vh] min-h-[560px] max-h-[820px] overflow-hidden bg-gray-900">
      {/* Slide Background */}
      {slide.image ? (
        <img
          src={slide.image}
          alt={slide.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${animating ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ${animating ? 'opacity-0' : 'opacity-100'}`} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-end pb-24 px-6 md:px-16 lg:px-24 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 font-medium">
              <MapPin className="w-3 h-3" /> {slide.city || 'India'}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-primary-600/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium capitalize">
              {TYPE_ICONS[slide.type]} {slide.type}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
            {slide.title}
          </h2>
          <p className="text-white/80 text-lg mb-2">{slide.desc}</p>
          <p className="text-3xl font-bold text-white mb-8">
            {formatPriceShort(slide.price)}
            <span className="text-white/60 text-base font-normal ml-2">onwards</span>
          </p>
          <div className="flex gap-3 flex-wrap">
            {slide.id ? (
              <Link
                to={`/properties/${slide.id}`}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl active:scale-95 text-sm"
              >
                View Property <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}
            <button
              onClick={handleBrowse}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl active:scale-95 text-sm border border-primary-500"
            >
              Browse Similar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-90"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all border border-white/20 active:scale-90"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      {/* Search Bar Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 hidden lg:flex justify-center">
        <SearchBar />
      </div>
    </div>
  );
};

// ── Search Bar ─────────────────────────────────────────────────────────────────
const SearchBar = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('propertyType', type);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl border border-white/50">
        <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-4 py-3">
          <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="City, locality or area..."
            className="bg-transparent flex-1 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none sm:w-44 border-none"
        >
          <option value="">All Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-800 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-900 transition-all active:scale-95 text-sm shadow-md">
          <Search className="w-4 h-4" /> Search
        </button>
      </div>
    </form>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const { featuredProperties, trendingAreas, popularProperties, marketStats, fetchFeatured, fetchTrending } = useProperty();
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoadingFeatured(true);
      await Promise.all([fetchFeatured(), fetchTrending()]);
      setLoadingFeatured(false);
    };
    load();
  }, []);

  const stats = [
    { value: marketStats?.totalProperties?.toLocaleString('en-IN') || '5,000+', label: 'Properties Listed', icon: Building2, color: 'text-primary-600 bg-primary-50' },
    { value: '2,000+', label: 'Active Sellers', icon: Users, color: 'text-primary-600 bg-primary-50' },
    { value: '15,000+', label: 'Happy Buyers', icon: Heart, color: 'text-rose-600 bg-rose-50' },
    { value: trendingAreas.length || '50+', label: 'Cities Covered', icon: MapPin, color: 'text-purple-600 bg-purple-50' },
  ];

  const howItWorks = [
    { step: 1, icon: Users, title: 'Create Account', desc: 'Register as buyer or seller in minutes. Completely free.', color: 'from-primary-500 to-primary-700' },
    { step: 2, icon: Search, title: 'Browse & Discover', desc: 'Search thousands of listings with advanced filters and map view.', color: 'from-purple-500 to-pink-600' },
    { step: 3, icon: Home, title: 'List Your Property', desc: 'Sellers can list properties instantly with photos and location.', color: 'from-primary-600 to-primary-800' },
    { step: 4, icon: CheckCircle2, title: 'Connect & Close', desc: 'Send inquiries, schedule visits, and seal the deal.', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ─── Hero Banner Slider ─────────────────────────────────── */}
      <HeroBanner properties={featuredProperties} />

      {/* ─── Mobile Search Bar ─────────────────────────────────── */}
      <div className="lg:hidden bg-white px-4 py-4 shadow-md border-b border-gray-100 -mt-1">
        <SearchBar />
      </div>

      {/* ─── Quick Type Filters ─────────────────────────────────── */}
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {PROPERTY_TYPES.map((type) => (
              <Link
                key={type}
                to={`/properties?propertyType=${type}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 px-5 py-3 bg-gray-50 hover:bg-primary-50 hover:border-primary-300 border border-gray-200 rounded-2xl transition-all group active:scale-95"
              >
                <span className="text-2xl">{TYPE_ICONS[type]}</span>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-primary-700 capitalize">{type}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-2xl mb-3 group-hover:bg-white/25 transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-primary-100 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">✨ Handpicked for you</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Featured Properties</h2>
              <p className="text-gray-500 mt-1">Premium listings from top sellers</p>
            </div>
            <Link
              to="/properties"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-primary-200 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-all text-sm active:scale-95"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((p, i) => (
                <div key={p._id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">Featured properties will appear here</p>
              <Link to="/properties" className="inline-block mt-4 text-primary-600 text-sm font-medium hover:underline">Browse all properties →</Link>
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/properties" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all active:scale-95">
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trending Areas ─────────────────────────────────────── */}
      {trendingAreas.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">🔥 Hot locations</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Trending Areas</h2>
              <p className="text-gray-500 mt-1">High-demand locations with the best investment opportunities</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {trendingAreas.slice(0, 10).map((area, i) => (
                <Link
                  key={area.city}
                  to={`/properties?city=${area.city}`}
                  className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 text-center border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:from-primary-200 group-hover:to-accent-200 transition-colors">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="font-bold text-gray-800 capitalize text-sm group-hover:text-primary-700 transition-colors">{area.city}</p>
                  <p className="text-xs text-gray-400 mt-1">{area.totalListings} listings</p>
                  <p className="text-xs font-semibold text-primary-600 mt-0.5">{formatPriceShort(area.avgPrice)} avg</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Popular Listings ───────────────────────────────────── */}
      {popularProperties.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">👁️ Most viewed</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Popular Listings</h2>
                <p className="text-gray-500 mt-1">Properties everyone's looking at this week</p>
              </div>
              <Link to="/properties?sort=popular" className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-primary-200 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-all text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularProperties.slice(0, 4).map((p) => (
                <div key={p._id} className="relative group">
                  <PropertyCard property={p} />
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    <Eye className="w-3 h-3" /> {p.views} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">⚡ Simple process</p>
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Buy or sell your property in 4 easy steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map(({ step, icon: Icon, title, desc, color }, i) => (
              <div key={step} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent z-0" style={{ width: 'calc(100% - 4rem)', left: 'calc(50% + 2rem)' }} />
                )}
                <div className={`relative z-10 w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <Zap className="w-4 h-4 text-yellow-400" /> Start listing for free today
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Find Your<br />Dream Property?
          </h2>
          <p className="text-primary-100 mb-10 text-lg max-w-xl mx-auto">
            Join thousands of buyers and sellers on Housify — India's most trusted real estate platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-xl active:scale-95 text-base"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all active:scale-95 text-base backdrop-blur-sm"
            >
              <Search className="w-5 h-5" /> Browse Properties
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Real Estate Trends ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">📊 Market Intelligence</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Real Estate Trends</h2>
            <p className="text-gray-500 mt-1">Stay ahead with live market insights from across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { city: 'Mumbai', trend: '+8.4%', direction: 'up', avgPrice: '₹1.8 Cr', type: 'Apartment', insight: 'Bandra & Lower Parel seeing strong luxury demand. Inventory tight.', color: 'from-blue-500 to-blue-700' },
              { city: 'Bangalore', trend: '+12.1%', direction: 'up', avgPrice: '₹95 L', type: 'Villa', insight: 'Whitefield & Sarjapur corridors hottest. IT boom driving residential demand.', color: 'from-primary-500 to-primary-700' },
              { city: 'Hyderabad', trend: '+6.7%', direction: 'up', avgPrice: '₹72 L', type: 'Apartment', insight: 'HITECH City expansion fuelling growth. Best value for 3BHK buyers.', color: 'from-purple-500 to-purple-700' },
              { city: 'Pune', trend: '-2.3%', direction: 'down', avgPrice: '₹68 L', type: 'House', insight: 'Market correction underway. Good time to buy in Hinjewadi & Wakad.', color: 'from-orange-500 to-red-500' },
              { city: 'Chennai', trend: '+4.9%', direction: 'up', avgPrice: '₹61 L', type: 'Apartment', insight: 'OMR belt active. Commercial-to-residential conversion driving new supply.', color: 'from-teal-500 to-teal-700' },
              { city: 'Delhi NCR', trend: '+9.2%', direction: 'up', avgPrice: '₹1.1 Cr', type: 'House', insight: 'Dwarka Expressway and New Gurgaon top picks for 2025 investors.', color: 'from-rose-500 to-rose-700' },
            ].map(({ city, trend, direction, avgPrice, type, insight, color }) => (
              <Link key={city} to={`/properties?city=${city}`}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-6">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`} />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{city}</h3>
                    <p className="text-xs text-gray-400">{type} market</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${direction === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {direction === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {trend}
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900 mb-1">{avgPrice}</p>
                <p className="text-xs text-gray-400 mb-3">Average price</p>
                <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary-600 font-semibold group-hover:gap-2 transition-all">
                  Explore {city} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>

          {/* Trend Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: 'Avg. Price Growth YoY', value: '+7.8%', sub: 'Across top 10 cities', color: 'text-green-600 bg-green-50' },
              { icon: Building2, label: 'New Launches Q1 2025', value: '12,400+', sub: 'Units in metro cities', color: 'text-primary-600 bg-primary-50' },
              { icon: Percent, label: 'Home Loan Rate', value: '8.5%', sub: 'Current RBI repo rate', color: 'text-purple-600 bg-purple-50' },
              { icon: DollarSign, label: 'NRI Investment Growth', value: '+23%', sub: 'Year-on-year surge', color: 'text-orange-600 bg-orange-50' },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── News & Updates ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">📰 Latest Updates</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Real Estate News</h2>
              <p className="text-gray-500 mt-1">Stay informed about the Indian property market</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                category: 'Policy', tag: '🏛️ Government',
                title: 'RERA Compliance Deadline Extended for Ongoing Projects in Maharashtra',
                desc: 'The Maharashtra Real Estate Regulatory Authority has given developers a 6-month extension to complete pending RERA registrations, easing pressure on homebuyers.',
                date: 'Mar 12, 2025', readTime: '3 min read', color: 'bg-blue-50 text-blue-700',
              },
              {
                category: 'Market', tag: '📈 Investment',
                title: 'Luxury Housing Sales Hit Record High in Q4 2024 Across Top 7 Cities',
                desc: 'Premium properties above ₹1.5 Cr saw 34% volume growth year-on-year, with Mumbai, Bangalore, and Hyderabad leading the charge as NRI demand surges.',
                date: 'Mar 10, 2025', readTime: '4 min read', color: 'bg-green-50 text-green-700',
              },
              {
                category: 'Finance', tag: '💰 Home Loans',
                title: 'SBI Cuts Home Loan Rate to 8.4% for First-Time Buyers Under ₹50L',
                desc: 'State Bank of India announces a special festive home loan scheme targeting first-time buyers in Tier 2 and Tier 3 cities, processing in 72 hours.',
                date: 'Mar 8, 2025', readTime: '2 min read', color: 'bg-purple-50 text-purple-700',
              },
              {
                category: 'Infrastructure', tag: '🚇 Metro',
                title: 'New Metro Lines Driving 15–20% Property Appreciation in Corridor Zones',
                desc: 'Properties within 1 km of upcoming metro stations in Pune, Ahmedabad, and Surat are seeing pre-launch buying frenzy from investors anticipating capital gains.',
                date: 'Mar 5, 2025', readTime: '5 min read', color: 'bg-orange-50 text-orange-700',
              },
              {
                category: 'Rental', tag: '🏠 Rentals',
                title: 'Co-Living Spaces Growing 40% YoY in Bangalore as IT Workforce Expands',
                desc: 'Managed co-living properties targeting young professionals have seen unprecedented demand in Whitefield, Electronic City, and Koramangala.',
                date: 'Mar 3, 2025', readTime: '3 min read', color: 'bg-teal-50 text-teal-700',
              },
              {
                category: 'Tech', tag: '🤖 PropTech',
                title: 'AI-Powered Property Valuation Tools Transforming How Indians Buy Real Estate',
                desc: 'Platforms using machine learning for real-time price estimates are gaining trust as buyers demand data transparency before committing to purchases.',
                date: 'Feb 28, 2025', readTime: '6 min read', color: 'bg-pink-50 text-pink-700',
              },
            ].map(({ category, tag, title, desc, date, readTime, color }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group cursor-pointer">
                <div className="p-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{tag}</span>
                  <h3 className="font-bold text-gray-900 mt-3 mb-2 text-sm leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 mb-4">{desc}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{date}</span>
                    <span>{readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose Housify ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-2">Why Housify?</p>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-6">India's Most Trusted<br />Property Platform</h2>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: 'Aadhaar-Verified Users', desc: 'Every seller and buyer goes through mandatory ID verification. No fake listings, no scams.' },
                  { icon: BarChart3, title: 'AI Price Intelligence', desc: 'Our machine learning engine analyses 10,000+ data points to give you the most accurate property valuations.' },
                  { icon: MapPin, title: 'Interactive Map Search', desc: 'Explore properties on a live map with school, hospital, and metro proximity filters.' },
                  { icon: Star, title: 'Zero Commission', desc: 'Direct buyer-seller connections with zero brokerage. Save lakhs on every transaction.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-0.5">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <Link to="/register" className="btn-primary py-3 px-6 text-sm">Join Free Today</Link>
                <Link to="/about" className="btn-secondary py-3 px-6 text-sm">Our Story →</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '₹0', label: 'Brokerage Fee', sub: 'Direct connections' },
                { value: '100%', label: 'Verified Listings', sub: 'No fake properties' },
                { value: '72hrs', label: 'Avg. Response Time', sub: 'Sellers reply fast' },
                { value: '4.8★', label: 'User Rating', sub: '2,000+ reviews' },
              ].map(({ value, label, sub }) => (
                <div key={label} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <p className="text-3xl font-extrabold text-primary-600 mb-1">{value}</p>
                  <p className="font-semibold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">💬 User stories</p>
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Rahul Sharma', role: 'Property Buyer', text: 'Found my dream apartment in just 2 weeks! The map view and filters made it so easy to narrow down exactly what I wanted.', city: 'Mumbai', rating: 5 },
              { name: 'Priya Mehta', role: 'Property Seller', text: 'Listed my property and got 15 inquiries in the first week. The dashboard made it easy to manage everything in one place.', city: 'Bangalore', rating: 5 },
              { name: 'Amit Patel', role: 'Real Estate Investor', text: 'The price suggestion tool is incredible. It helped me understand market trends and make data-driven investment decisions.', city: 'Ahmedabad', rating: 5 },
            ].map(({ name, role, text, city, rating }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role} · {city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
