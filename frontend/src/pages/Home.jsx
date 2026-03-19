import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search, MapPin, Building2, Users, TrendingUp, Shield,
  CheckCircle2, ChevronRight, Star, Eye, ChevronLeft,
  Home, ArrowRight, Zap, Award, Heart, BarChart3,
  Newspaper, DollarSign, Percent, ArrowUpRight, ArrowDownRight,
  LineChart, Clock, Sparkles, Target
} from 'lucide-react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from '../components/property/PropertyCard';
import { formatPriceShort } from '../utils/formatters';
import { CardSkeleton } from '../components/common/Loader';
import Footer from '../components/common/Footer';
import ScrollReveal from '../components/common/ScrollReveal';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'land', 'office'];
const TYPE_ICONS = { apartment: '🏢', house: '🏡', villa: '🏰', commercial: '🏪', land: '🌿', office: '🏗️' };

const BANNER_FALLBACKS = [
  {
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80',
    city: 'Goa', type: 'villa', price: 18500000,
    title: 'Oceanfront Luxury Villa',
    desc: 'Breathtaking sea views, private pool, and lush tropical gardens — your own slice of paradise',
    gradient: 'from-blue-900 via-blue-800 to-indigo-900',
  },
  {
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
    city: 'Bangalore', type: 'house', price: 9200000,
    title: 'Elegant Modern Bungalow',
    desc: 'Architecturally stunning 4BHK bungalow with open-plan living and premium finishes throughout',
    gradient: 'from-emerald-900 via-teal-800 to-cyan-900',
  },
  {
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
    city: 'Pune', type: 'villa', price: 14000000,
    title: 'Contemporary Pool Villa',
    desc: 'Sleek designer villa with infinity pool, home theatre, and smart home automation',
    gradient: 'from-purple-900 via-fuchsia-800 to-primary-900',
  },
  {
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
    city: 'Mumbai', type: 'villa', price: 32000000,
    title: 'Premium Hillside Villa',
    desc: 'Exclusive gated community villa with panoramic city views and resort-style amenities',
    gradient: 'from-orange-900 via-red-800 to-primary-900',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    city: 'Hyderabad', type: 'house', price: 7800000,
    title: 'Spacious Family Bungalow',
    desc: 'Classic 5BHK bungalow in a prime locality with large garden, covered parking and quiet surroundings',
    gradient: 'from-cyan-900 via-blue-800 to-indigo-900',
  },
];

// ── Animated Counter ────────────────────────────────────────────────────────
const Counter = ({ to, duration = 1.5, inView = false }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) {
      setVal(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / (duration * 1000), 1);
      // easeOutExpo
      const easing = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(to * easing));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration, inView]);
  return <span>{val.toLocaleString('en-IN')}</span>;
};

// ── Auto-sliding Banner ──────────────────────────────────────────────────────
const HeroBanner = ({ properties }) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

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
    }, 400); // Wait for fade out
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
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
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {slide.image ? (
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${slide.gradient}`} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-32 lg:pb-44 px-6 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/20 font-medium">
                  <MapPin className="w-3 h-3" /> {slide.city || 'India'}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-primary-600/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium capitalize">
                  {TYPE_ICONS[slide.type]} {slide.type}
                </span>
              </motion.div>

              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {slide.title}
              </motion.h2>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/90 text-lg mb-2 text-shadow">
                {slide.desc}
              </motion.p>

              <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} className="text-3xl font-bold text-white mb-8 drop-shadow-md">
                {formatPriceShort(slide.price)}
                <span className="text-white/80 text-base font-normal ml-2">onwards</span>
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-3 flex-wrap">
                {slide.id && (
                  <Link
                    to={`/properties/${slide.id}`}
                    className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 text-sm"
                  >
                    View Property <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <button
                  onClick={handleBrowse}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl hover:from-primary-500 hover:to-primary-600 transition-all shadow-xl active:scale-95 text-sm border border-primary-500/50"
                >
                  Browse Similar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors border border-white/20 active:scale-90 z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors border border-white/20 active:scale-90 z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-10 lg:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full group outline-none"
          >
            <span className="absolute w-2.5 h-2.5 bg-white/40 rounded-full group-hover:bg-white/70 transition-colors" />
            {i === current && (
              <motion.span
                layoutId="hero-dot"
                className="absolute w-8 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 hidden lg:flex justify-center z-30">
        <SearchBar />
      </div>
    </div>
  );
};

// ── Search Bar ───────────────────────────────────────────────────────────────
const SearchBar = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (type) params.set('propertyType', type);
      navigate(`/properties?${params.toString()}`);
    }, 400); // Allow animation to play
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      animate={{ scale: isFocused ? 1.02 : 1, y: isFocused ? -5 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-full max-w-4xl"
    >
      <div className={`bg-white/95 dark:bg-surface-800/95 backdrop-blur-xl rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2 shadow-2xl border transition-colors duration-300 ${isFocused ? 'border-primary-400 shadow-primary-500/20' : 'border-white/50 dark:border-white/10'}`}>
        <div className="flex items-center gap-3 flex-1 bg-gray-50/80 dark:bg-surface-700/80 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary-200 focus-within:bg-white dark:focus-within:bg-surface-700 transition-colors">
          <MapPin className={`w-5 h-5 transition-colors ${isFocused ? 'text-primary-600' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search by city, locality or landmark..."
            className="bg-transparent flex-1 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-base"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>
        <div className="w-px bg-gray-200 hidden sm:block mx-1 my-2" />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-50/80 dark:bg-surface-700/80 rounded-xl px-5 py-3 text-base text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-surface-700 focus:border-primary-200 border border-transparent transition-colors sm:w-56 cursor-pointer"
        >
          <option value="">All Property Types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3.5 rounded-xl font-bold hover:from-primary-500 hover:to-primary-600 shadow-lg shadow-primary-600/30 text-base min-w-[140px]"
        >
          {isSubmitting ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Search className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              <Search className="w-5 h-5" /> Search
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

// ── Future Price Forecast ────────────────────────────────────────────────────
const CITY_FORECASTS = [
  { city: 'Mumbai', currentAvg: 18000000, growth1y: 8.4, growth3y: 27.2, growth5y: 52.8, propertyType: 'Apartment', insight: 'Bandra & Lower Parel luxury corridor driving consistent double-digit appreciation.', drivers: ['Coastal Road', 'Metro-3', 'Infrastructure'], riskLevel: 'Low', color: 'from-blue-500 to-blue-700', hex: '#3b82f6' },
  { city: 'Bangalore', currentAvg: 9500000, growth1y: 12.1, growth3y: 38.8, growth5y: 73.5, propertyType: 'Villa', insight: 'IT sector boom and Whitefield expansion make Bangalore the fastest-appreciating metro.', drivers: ['Tech Boom', 'Metro Phase-2', 'Airport Zone'], riskLevel: 'Low', color: 'from-emerald-500 to-teal-700', hex: '#10b981' },
  { city: 'Hyderabad', currentAvg: 7200000, growth1y: 6.7, growth3y: 21.5, growth5y: 41.2, propertyType: 'Apartment', insight: 'HITECH City Phase-2 expansion and pharma sector attract steady investor demand.', drivers: ['HITECH City', 'Pharma Cluster', 'ORR Development'], riskLevel: 'Low', color: 'from-purple-500 to-purple-700', hex: '#a855f7' },
  { city: 'Pune', currentAvg: 6800000, growth1y: -2.3, growth3y: 9.8, growth5y: 24.5, propertyType: 'House', insight: 'Short-term correction creates attractive entry points for 3–5 year investors.', drivers: ['IT Parks', 'Ring Road', 'Smart City'], riskLevel: 'Medium', color: 'from-amber-500 to-orange-600', hex: '#f59e0b' },
  { city: 'Chennai', currentAvg: 6100000, growth1y: 4.9, growth3y: 15.5, growth5y: 29.3, propertyType: 'Apartment', insight: 'OMR corridor steady growth; manufacturing and IT exports sustaining demand.', drivers: ['OMR Belt', 'Port Expansion', 'Metro Phase-2'], riskLevel: 'Low', color: 'from-cyan-500 to-blue-600', hex: '#06b6d4' },
  { city: 'Delhi NCR', currentAvg: 11000000, growth1y: 9.2, growth3y: 30.1, growth5y: 58.4, propertyType: 'House', insight: 'Dwarka Expressway and New Gurgaon sectors poised for major appreciation.', drivers: ['Dwarka Expressway', 'RRTS Corridor', 'Aerocity'], riskLevel: 'Low', color: 'from-premium-500 to-premium-700', hex: '#D97706' },
];

const FuturePriceForecast = () => {
  const [activeCity, setActiveCity] = useState(0);
  const city = CITY_FORECASTS[activeCity];
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const projected = (base, pct) => Math.round(base * (1 + pct / 100));
  const maxPct = Math.max(...CITY_FORECASTS.map((c) => c.growth5y));
  const barWidth = (pct) => (pct < 0 ? 3 : Math.min(95, (pct / maxPct) * 95));

  const riskColors = {
    Low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    High: 'text-red-400 bg-red-400/10 border-red-400/30',
  };

  const bars = [
    { label: '1 Year', pct: city.growth1y, value: projected(city.currentAvg, city.growth1y) },
    { label: '3 Years', pct: city.growth3y, value: projected(city.currentAvg, city.growth3y) },
    { label: '5 Years', pct: city.growth5y, value: projected(city.currentAvg, city.growth5y) },
  ];

  return (
    <section className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ background: `radial-gradient(circle at 30% 0%, ${city.hex}15 0%, transparent 50%)` }}
          className="absolute inset-0 transition-colors duration-1000"
        />
        <motion.div
          animate={{ background: `radial-gradient(circle at 70% 100%, ${city.hex}15 0%, transparent 50%)` }}
          className="absolute inset-0 transition-colors duration-1000"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-500/15 text-primary-300 text-xs font-semibold px-4 py-2 rounded-full mb-4 border border-primary-500/30">
              <LineChart className="w-4 h-4" /> AI-Powered Price Forecast
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Future Price Predictions</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base">
              Explore city-wise projections powered by our machine learning engine, analyzing market trends, infrastructure development, and historical data.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CITY_FORECASTS.map((c, i) => (
              <button
                key={c.city}
                onClick={() => setActiveCity(i)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border outline-none ${
                  i === activeCity ? 'text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {i === activeCity && (
                  <motion.div
                    layoutId="pill-bg"
                    className={`absolute inset-0 bg-gradient-to-r ${c.color} rounded-full z-0`}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{c.city}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <ScrollReveal direction="right" delay={0.2} className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{city.city}</h3>
                  <p className="text-gray-400 text-sm">{city.propertyType} market &middot; Current avg {fmt(city.currentAvg)}</p>
                </div>
                <span className={`text-xs font-bold px-4 py-1.5 rounded-full border shadow-sm ${riskColors[city.riskLevel]}`}>
                  {city.riskLevel} Risk
                </span>
              </div>

              <div className="space-y-8">
                {bars.map(({ label, pct, value }, idx) => {
                  const isNeg = pct < 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-300">{label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold ${isNeg ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isNeg ? '' : '+'}{pct.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-400 font-mono">{fmt(value)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-3.5 overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth(pct)}%` }}
                          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${city.color}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest font-bold">Key Growth Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {city.drivers.map((d, idx) => (
                    <motion.span
                      key={d}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="text-xs px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg border border-white/10 hover:bg-white/10 cursor-default transition-colors"
                    >
                      {d}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.3} className="lg:col-span-2 flex flex-col gap-6">
            <motion.div
              key={`insight-${activeCity}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-br ${city.color} p-8 rounded-3xl text-white shadow-xl shadow-${city.color.split('-')[1]}-500/20`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 opacity-90" />
                <span className="text-sm font-bold opacity-90 tracking-wide uppercase">Expert Insight</span>
              </div>
              <p className="text-base leading-relaxed opacity-95 font-medium">{city.insight}</p>
            </motion.div>

            <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 shadow-2xl">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Return Summary</p>
              <div className="space-y-2">
                {[
                  { label: 'Today', value: fmt(city.currentAvg), sub: 'Current avg. price', hi: false },
                  { label: '1 Year', value: fmt(projected(city.currentAvg, city.growth1y)), sub: (city.growth1y > 0 ? '+' : '') + city.growth1y + '%', hi: false },
                  { label: '3 Years', value: fmt(projected(city.currentAvg, city.growth3y)), sub: '+' + city.growth3y + '%', hi: false },
                  { label: '5 Years', value: fmt(projected(city.currentAvg, city.growth5y)), sub: '+' + city.growth5y + '%', hi: true },
                ].map(({ label, value, sub, hi }) => (
                  <div key={label} className={`flex items-center justify-between py-3 px-4 rounded-xl transition-colors ${hi ? `bg-${city.color.split('-')[1]}-500/20 border border-${city.color.split('-')[1]}-500/30` : 'hover:bg-white/5 border border-transparent'}`}>
                    <div>
                      <p className={`text-xs font-bold ${hi ? `text-${city.color.split('-')[1]}-300` : 'text-gray-400'}`}>{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                    <p className={`font-bold text-sm ${hi ? `text-${city.color.split('-')[1]}-300` : 'text-white'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-600 text-center">
              * Projections based on historical data. Not financial advice.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

// ── Main Home Component ──────────────────────────────────────────────────────
const HomePage = () => {
  const { featuredProperties, trendingAreas, popularProperties, marketStats, fetchFeatured, fetchTrending } = useProperty();
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  
  // For counting up stats
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const load = async () => {
      setLoadingFeatured(true);
      await Promise.all([fetchFeatured(), fetchTrending()]);
      setLoadingFeatured(false);
    };
    load();
  }, []);

  const stats = [
    { value: marketStats?.totalProperties || 8500, label: 'Properties Listed', icon: Building2, color: 'text-blue-600 bg-blue-50', suffix: '+' },
    { value: 2400, label: 'Active Sellers', icon: Users, color: 'text-indigo-600 bg-indigo-50', suffix: '+' },
    { value: 15000, label: 'Happy Buyers', icon: Heart, color: 'text-primary-600 bg-primary-50', suffix: '+' },
    { value: trendingAreas.length || 50, label: 'Cities Covered', icon: MapPin, color: 'text-purple-600 bg-purple-50', suffix: '+' },
  ];

  const howItWorks = [
    { step: 1, icon: Users, title: 'Create Account', desc: 'Register as buyer or seller in minutes. Completely free. No hidden costs.', color: 'from-blue-500 to-indigo-600' },
    { step: 2, icon: Search, title: 'Browse & Discover', desc: 'Search thousands of listings with advanced filters, map view, and AI predictions.', color: 'from-indigo-500 to-purple-600' },
    { step: 3, icon: Shield, title: 'Verify Deals', desc: 'Connect with Aadhaar-verified users to ensure safety and trust in every transaction.', color: 'from-primary-500 to-primary-600' },
    { step: 4, icon: CheckCircle2, title: 'Seal the Deal', desc: 'Schedule visits directly. Zero commission. Save lakhs on your dream property.', color: 'from-secondary-500 to-secondary-600' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900">
      {/* ─── Hero Banner Slider ─────────────────────────────────── */}
      <HeroBanner properties={featuredProperties} />

      {/* ─── Mobile Search Bar ─────────────────────────────────── */}
      <div className="lg:hidden bg-white dark:bg-surface-800 px-4 py-4 shadow-xl border-b border-gray-100 dark:border-surface-700 z-40 relative">
        <SearchBar />
      </div>

      {/* ─── Quick Type Filters ─────────────────────────────────── */}
      <section className="bg-white dark:bg-surface-900 py-8 border-b border-gray-100 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {PROPERTY_TYPES.map((type) => (
                <Link
                  key={type}
                  to={`/properties?propertyType=${type}`}
                  className="snap-start flex-shrink-0 flex flex-col items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-primary-50 hover:shadow-md hover:-translate-y-1 border border-gray-200 hover:border-primary-200 rounded-2xl transition-all group active:scale-95"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{TYPE_ICONS[type]}</span>
                  <span className="text-sm font-bold text-gray-600 group-hover:text-primary-700 capitalize">{type}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>



      {/* ─── Stats ─────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-gray-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon, color, suffix }, i) => (
              <ScrollReveal key={label} delay={i * 0.1} direction="up">
                <div className="text-center group">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-4 group-hover:bg-primary-500 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-white group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-4xl font-extrabold text-white font-display">
                    {typeof value === 'number' ? <Counter to={value} inView={isStatsInView} /> : value}
                    <span className="text-primary-400">{suffix}</span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1.5 font-medium">{label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-surface-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Handpicked for you
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Featured Properties</h2>
                <p className="text-gray-500 mt-2 text-lg">Premium, verified listings from our top-rated sellers.</p>
              </div>
              <Link
                to="/properties"
                className="hidden sm:inline-flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:border-primary-300 hover:text-primary-700 hover:shadow-md transition-all text-sm active:scale-95"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((p, i) => (
                <ScrollReveal key={p._id} delay={i * 0.1}>
                  <PropertyCard property={p} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium text-lg">More featured properties coming soon.</p>
              <Link to="/properties" className="btn-primary inline-flex mt-6 px-8 rounded-full">Browse all properties</Link>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/properties" className="btn-primary inline-flex w-full justify-center">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trending Areas ─────────────────────────────────────── */}
      {trendingAreas.length > 0 && (
        <section className="py-24 bg-white dark:bg-surface-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-50/50 skew-x-12 translate-x-32" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-premium-500 text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Hot locations
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Trending Areas</h2>
                <p className="text-gray-500 mt-2 text-lg">High-demand locations with the best ROI possibilities.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingAreas.slice(0, 10).map((area, i) => (
                <ScrollReveal key={area.area || area.city} delay={i * 0.05} direction="up">
                  <Link
                    to={`/properties?city=${area.city}`}
                    className="block group relative overflow-hidden bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <motion.div whileHover={{ scale: 1.05, y: -5 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative z-10 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <MapPin className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                      <p className="relative z-10 font-bold text-gray-900 text-base group-hover:text-primary-700 transition-colors capitalize">{area.area || area.city}</p>
                      {area.area && area.city && <p className="relative z-10 text-xs text-gray-400 capitalize">{area.city}</p>}
                      <p className="relative z-10 text-sm text-gray-500 mt-1">{area.totalListings} properties</p>
                      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                          {formatPriceShort(area.avgPrice)} avg
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Popular Listings ───────────────────────────────────── */}
      {popularProperties.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-surface-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Most viewed
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Popular Listings</h2>
                  <p className="text-gray-500 mt-2 text-lg">Properties attracting the highest buyer interest this week.</p>
                </div>
                <Link to="/properties?sort=popular" className="hidden sm:inline-flex btn-ghost border-gray-200 border bg-white">
                  View All Popular
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProperties.slice(0, 4).map((p, i) => (
                <ScrollReveal key={p._id} delay={i * 0.1}>
                  <div className="relative group">
                    <PropertyCard property={p} />
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-primary-300" /> {p.views} views
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-surface-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" /> Lightning fast
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">How PropEase Works</h2>
              <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Skip the brokers. We connect verified buyers and sellers directly in a secure, transparent ecosystem.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative">
            <div className="hidden lg:block absolute top-[2.5rem] left-[10%] w-[80%] h-0.5 bg-gray-100 -z-10" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="hidden lg:block absolute top-[2.5rem] left-[10%] w-[80%] h-0.5 bg-gradient-to-r from-primary-500 via-secondary-400 to-premium-500 -z-10 origin-left"
            />

            {howItWorks.map(({ step, icon: Icon, title, desc, color }, i) => (
              <ScrollReveal key={step} delay={i * 0.15} direction="up" className="relative text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200 group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 relative`}>
                  <Icon className="w-8 h-8 text-white relative z-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white text-sm font-bold rounded-full flex items-center justify-center border-4 border-white shadow-sm z-20">
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-xl">{title}</h3>
                <p className="text-gray-500 text-base leading-relaxed">{desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Future Price Forecast ──────────────────────────── */}
      <FuturePriceForecast />

      {/* ─── Trust / Features ────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-surface-900 border-b border-gray-100 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left side */}
            <div className="flex-1">
              <ScrollReveal>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-10">
                  India's Most Trusted<br />Property Platform
                </h2>
              </ScrollReveal>
              
              <div className="space-y-8">
                {[
                  { icon: Shield, title: 'Aadhaar-Verified Users', desc: 'Every seller and buyer goes through mandatory ID verification. No fake listings, no scams.' },
                  { icon: BarChart3, title: 'AI Price Intelligence', desc: 'Our machine learning engine analyses 10,000+ data points to give you the most accurate property valuations.' },
                  { icon: MapPin, title: 'Interactive Map Search', desc: 'Explore properties on a live map with school, hospital, and metro proximity filters.' },
                  { icon: Star, title: 'Zero Commission', desc: 'Direct buyer-seller connections with zero brokerage. Save lakhs on every transaction.' },
                ].map((f, i) => (
                  <ScrollReveal key={f.title} delay={i * 0.1} direction="up">
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm md:text-base">{f.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal delay={0.4} direction="up">
                <div className="flex gap-4 mt-12">
                  <Link to="/register" className="px-8 py-3.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30">
                    Join Free Today
                  </Link>
                  <Link to="/about" className="px-8 py-3.5 border border-primary-500 text-primary-500 font-bold rounded-xl hover:bg-primary-50 transition-colors flex items-center gap-2">
                    Our Story <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Right side stats */}
            <div className="flex-1 w-full relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 w-full max-w-lg mx-auto lg:max-w-none">
                {[
                  { value: '₹0', label: 'Brokerage Fee', subtext: 'Direct connections' },
                  { value: '100%', label: 'Verified Listings', subtext: 'No fake properties' },
                  { value: '72hrs', label: 'Avg. Response Time', subtext: 'Sellers reply fast' },
                  { value: '4.8⭐', label: 'User Rating', subtext: '2,000+ reviews' },
                ].map((stat, i) => (
                  <ScrollReveal key={stat.label} delay={0.2 + i * 0.1}>
                    <div className="bg-white dark:bg-surface-800 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-surface-700 text-center hover:-translate-y-1 transition-transform duration-300">
                      <p className="text-4xl font-extrabold text-primary-500 mb-3 tracking-tight">{stat.value}</p>
                      <p className="font-bold text-gray-900 text-sm mb-1">{stat.label}</p>
                      <p className="text-xs text-gray-500 font-medium">{stat.subtext}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-primary-600 text-sm font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" /> Trusted by thousands
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">What Our Users Say</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul Sharma', role: 'Property Buyer', text: 'Found my dream apartment in just 2 weeks! The map view and AI predictions made it so easy to pick the right tech park area.', city: 'Bangalore', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80' },
              { name: 'Priya Mehta', role: 'Property Seller', text: 'Listed my property and got 15 inquiries in the first week. The new seller dashboard is incredible. Sold without paying any broker fees!', city: 'Mumbai', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
              { name: 'Amit Patel', role: 'Investor', text: 'The Future Price Forecast tool is scary accurate. It helped me understand micro-market trends and make a very profitable investment.', city: 'Pune', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
            ].map(({ name, role, text, city, img }, i) => (
              <ScrollReveal key={name} delay={i * 0.1}>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
                  <div className="absolute top-6 right-6 text-gray-100">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                  </div>
                  <div className="flex gap-1 mb-6 relative z-10">
                    {[1,2,3,4,5].map((s) => <Star key={s} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed mb-8 relative z-10 italic">"{text}"</p>
                  <div className="flex items-center gap-4 border-t border-gray-50 pt-6">
                    <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500 font-medium">{role} · {city}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────────── */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-primary-600 to-primary-900 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-secondary-600 to-premium-500 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal direction="up">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Ready to find your next property?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium">
              Join 150,000+ users who have found their dream homes without paying a single rupee in brokerage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary py-4 px-10 rounded-full text-lg shadow-[0_0_20px_rgba(192,38,211,0.3)] hover:shadow-[0_0_30px_rgba(192,38,211,0.5)]">
                Get Started for Free
              </Link>
              <Link to="/properties" className="btn-ghost text-white border border-white/20 hover:bg-white/10 py-4 px-10 rounded-full text-lg">
                Browse Properties
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-8 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> 100% Aadhaar Verified Users. Secure & Trusted.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
