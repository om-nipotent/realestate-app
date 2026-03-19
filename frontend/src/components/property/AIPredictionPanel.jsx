import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Zap, MapPin, Star,
  DollarSign, Maximize2, Tag, RefreshCw, AlertCircle,
  ChevronUp, ChevronDown, Target, BarChart2, Clock,
} from 'lucide-react';
import { predictProperty } from '../../api/prediction.api';

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return fmt(n);
};

const fmtPct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

const ICON_MAP = { MapPin, Tag, Star, DollarSign, Maximize2 };

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ target, duration = 900, formatter = (v) => v }) => {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const startValRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startValRef.current = current;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValRef.current + (target - startValRef.current) * eased;
      setCurrent(value);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{formatter(current)}</>;
};

// ─── SVG Investment Score Ring ────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Strong Buy' : score >= 45 ? 'Hold' : 'Caution';

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.4s' }}
        />
        {/* Score Text */}
        <text x="50" y="46" textAnchor="middle" className="text-2xl font-black" style={{ fontSize: '20px', fontWeight: 800, fill: color }}>
          {Math.round(score)}
        </text>
        <text x="50" y="62" textAnchor="middle" style={{ fontSize: '8px', fill: '#6b7280' }}>out of 100</text>
      </svg>
      <span className="text-xs font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
};

// ─── SVG Trend Chart ──────────────────────────────────────────────────────────
const TrendChart = ({ trendPoints }) => {
  if (!trendPoints || trendPoints.length < 2) return null;

  const W = 280, H = 100;
  const PAD = { t: 10, r: 10, b: 28, l: 10 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const prices = trendPoints.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;

  const points = trendPoints.map((p, i) => {
    const x = PAD.l + (i / (trendPoints.length - 1)) * chartW;
    const y = PAD.t + chartH - ((p.price - minP) / rangeP) * chartH;
    return { x, y, ...p };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Gradient fill path
  const fillPath = `M${points[0].x},${points[0].y} ${points.slice(1).map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length - 1].x},${PAD.t + chartH} L${points[0].x},${PAD.t + chartH} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      <defs>
        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area */}
      <path d={fillPath} fill="url(#forecastGrad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Start & End dots */}
      <circle cx={points[0].x} cy={points[0].y} r="4" fill="#6366f1" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#10b981" />
      {/* X-axis labels */}
      {points.filter((_, i) => i % 2 === 0 || i === points.length - 1).map((p) => (
        <text key={p.label} x={p.x} y={H - 4} textAnchor="middle" style={{ fontSize: '8px', fill: '#9ca3af' }}>
          {p.label}
        </text>
      ))}
    </svg>
  );
};

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-4 p-1">
    <div className="flex gap-4 items-center">
      <div className="w-24 h-24 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
    </div>
    <div className="h-24 bg-gray-200 rounded-xl" />
    <div className="space-y-2">
      {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}
    </div>
  </div>
);

// ─── Explainability Factor Row ────────────────────────────────────────────────
const FactorRow = ({ factor, maxContrib }) => {
  const Icon = ICON_MAP[factor.icon] || Target;
  const barPct = Math.min(100, (Math.abs(factor.contribution) / Math.max(maxContrib, 0.01)) * 100);
  const isPositive = factor.direction === 'positive';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <Icon className={`w-4 h-4 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700 truncate">{factor.label}</span>
            <span className={`text-xs font-bold ml-1 flex-shrink-0 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{factor.contribution.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${isPositive ? 'bg-emerald-500' : 'bg-red-400'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2 bg-gray-50/50">
          {factor.description}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AIPredictionPanel = ({ property }) => {
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const debounceRef             = useRef(null);

  const runPrediction = useCallback(async (p) => {
    if (!p?.price || !p?.area || !p?.location?.city) return;
    setLoading(true);
    setError(null);
    try {
      const data = await predictProperty({
        city:         p.location.city,
        propertyType: p.propertyType || 'apartment',
        price:        p.price,
        area:         p.area,
        bedrooms:     p.bedrooms ?? 2,
        amenities:    p.amenities ?? [],
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount and whenever core property fields change
  useEffect(() => {
    if (!property) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runPrediction(property), 400);
    return () => clearTimeout(debounceRef.current);
  }, [
    property?.price,
    property?.area,
    property?.bedrooms,
    property?.location?.city,
    property?.propertyType,
    property?.amenities?.length,
  ]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const { prediction, priceForecast, rentalYield, explainability, features, meta } = result || {};
  const growth = prediction?.annualGrowthRate ?? 0;
  const score  = prediction?.investmentScore ?? 0;
  const conf   = prediction?.confidence ?? 0;
  const maxContrib = explainability ? Math.max(...explainability.map(f => Math.abs(f.contribution))) : 1;

  return (
    <div className="card overflow-hidden border border-indigo-100 shadow-sm">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">AI Price Prediction</h3>
              <p className="text-indigo-200 text-xs">Regression model · Real-time</p>
            </div>
          </div>
          {result && (
            <button
              onClick={() => runPrediction(property)}
              className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center transition-colors"
              title="Re-run prediction"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Loading */}
        {loading && !result && <Skeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-700">Prediction unavailable</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
              <button onClick={() => runPrediction(property)} className="text-xs text-red-700 font-semibold mt-1 underline">
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">
            {/* ── Score + Growth Row ── */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-3">
              <ScoreRing score={score} />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Annual Growth Rate</p>
                  <p className={`text-2xl font-extrabold ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    <AnimatedNumber target={growth} formatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                    <p className="text-xs text-gray-400">Rental Yield</p>
                    <p className="text-sm font-bold text-gray-800">
                      <AnimatedNumber target={rentalYield?.gross ?? 0} formatter={(v) => `${v.toFixed(1)}%`} />
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-2 py-1.5 border border-gray-100">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-sm font-bold text-gray-800">
                      <AnimatedNumber target={conf} formatter={(v) => `${Math.round(v)}%`} />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Price Forecast Cards ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3" /> Projected Value
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1 Year', price: priceForecast?.year1, key: 'y1' },
                  { label: '3 Years', price: priceForecast?.year3, key: 'y3' },
                  { label: '5 Years', price: priceForecast?.year5, key: 'y5' },
                ].map(({ label, price: fp, key }) => {
                  const gain = ((fp - priceForecast?.current) / priceForecast?.current) * 100;
                  return (
                    <div key={key} className={`rounded-xl p-2.5 text-center border ${key === 'y5' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className={`text-sm font-bold mt-0.5 ${key === 'y5' ? 'text-indigo-700' : 'text-gray-800'}`}>
                        <AnimatedNumber target={fp ?? 0} formatter={fmtShort} />
                      </p>
                      <p className={`text-xs font-semibold mt-0.5 ${gain >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        <AnimatedNumber target={gain} formatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Trend Chart ── */}
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" /> 5-Year Price Trajectory
              </p>
              <TrendChart trendPoints={priceForecast?.trendPoints} />
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>{fmtShort(priceForecast?.current)}</span>
                <span className="text-emerald-600 font-semibold">{fmtShort(priceForecast?.year5)} by 5yr</span>
              </div>
            </div>

            {/* ── Income Insight ── */}
            {rentalYield?.estimatedMonthlyRental > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-700 font-semibold">Estimated Monthly Rental</p>
                  <p className="text-base font-bold text-emerald-800">
                    <AnimatedNumber target={rentalYield.estimatedMonthlyRental} formatter={fmt} />
                  </p>
                  <p className="text-xs text-emerald-600">Net yield: {rentalYield.net}% after expenses</p>
                </div>
              </div>
            )}

            {/* ── Feature Signals ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Price/sqft', value: `₹${features?.pricePerSqft?.toLocaleString('en-IN') ?? '-'}` },
                { label: 'Demand Index', value: features?.demandIndex != null ? features.demandIndex.toFixed(2) : '-' },
                { label: 'Area Growth', value: `${prediction?.areaGrowthPotential ?? '-'}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-xl p-2.5 text-center">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* ── Explainability ── */}
            {explainability?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Why this prediction?</p>
                <div className="space-y-2">
                  {explainability.map((f) => (
                    <FactorRow key={f.key} factor={f} maxContrib={maxContrib} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Model v{meta?.modelVersion} · {new Date(meta?.computedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-gray-400">Not financial advice</p>
            </div>
          </div>
        )}

        {/* No property data yet */}
        {!result && !loading && !error && (
          <div className="text-center py-6 text-gray-400">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Loading prediction engine…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPredictionPanel;
