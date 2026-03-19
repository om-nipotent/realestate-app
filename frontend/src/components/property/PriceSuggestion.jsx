import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader, BarChart2, Info, LineChart, Clock, ArrowUpRight } from 'lucide-react';
import { formatPrice, formatPriceShort } from '../../utils/formatters';
import { getPriceSuggestion } from '../../api/verification.api';
import toast from 'react-hot-toast';

// Curated city-level annual growth rates (same data as Home page forecast)
const CITY_GROWTH_RATES = {
  mumbai: { growth1y: 8.4, growth3y: 27.2, growth5y: 52.8 },
  bangalore: { growth1y: 12.1, growth3y: 38.8, growth5y: 73.5 },
  bengaluru: { growth1y: 12.1, growth3y: 38.8, growth5y: 73.5 },
  hyderabad: { growth1y: 6.7, growth3y: 21.5, growth5y: 41.2 },
  pune: { growth1y: -2.3, growth3y: 9.8, growth5y: 24.5 },
  chennai: { growth1y: 4.9, growth3y: 15.5, growth5y: 29.3 },
  delhi: { growth1y: 9.2, growth3y: 30.1, growth5y: 58.4 },
  'delhi ncr': { growth1y: 9.2, growth3y: 30.1, growth5y: 58.4 },
  gurgaon: { growth1y: 9.2, growth3y: 30.1, growth5y: 58.4 },
  noida: { growth1y: 8.5, growth3y: 28.0, growth5y: 54.0 },
  ahmedabad: { growth1y: 7.0, growth3y: 22.5, growth5y: 44.0 },
  kolkata: { growth1y: 5.5, growth3y: 17.5, growth5y: 33.0 },
};

const DEFAULT_GROWTH = { growth1y: 6.5, growth3y: 20.0, growth5y: 38.0 };

const getGrowthForCity = (city) => {
  if (!city) return DEFAULT_GROWTH;
  const key = city.toLowerCase().trim();
  return CITY_GROWTH_RATES[key] || DEFAULT_GROWTH;
};

const getInvestmentOutlook = (growth5y) => {
  if (growth5y >= 50) return { label: 'Strong Buy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (growth5y >= 25) return { label: 'Good Investment', color: 'text-primary-600 bg-primary-50 border-primary-200' };
  if (growth5y >= 10) return { label: 'Hold', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: 'Caution', color: 'text-red-600 bg-red-50 border-red-200' };
};

const TrendIcon = ({ trend }) => {
  if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-primary-600" />;
  if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-red-600" />;
  return <Minus className="w-5 h-5 text-gray-500" />;
};

const ConfidenceBar = ({ level }) => {
  const widths = { high: 'w-4/5', medium: 'w-1/2', low: 'w-1/4' };
  const colors = { high: 'bg-primary-500', medium: 'bg-yellow-500', low: 'bg-red-500' };
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div className={`${widths[level]} ${colors[level]} h-1.5 rounded-full transition-all duration-500`} />
    </div>
  );
};

// ── Future Value Estimate Panel ───────────────────────────────────────────────
const FutureValueEstimate = ({ currentPrice, city }) => {
  const growth = getGrowthForCity(city);
  const outlook = getInvestmentOutlook(growth.growth5y);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const projected = (base, pct) => Math.round(base * (1 + pct / 100));

  const rows = [
    { label: 'Today', value: currentPrice, pct: null },
    { label: '1 Year', value: projected(currentPrice, growth.growth1y), pct: growth.growth1y },
    { label: '3 Years', value: projected(currentPrice, growth.growth3y), pct: growth.growth3y },
    { label: '5 Years', value: projected(currentPrice, growth.growth5y), pct: growth.growth5y, highlight: true },
  ];

  const maxVal = rows[rows.length - 1].value;
  const barPct = (v) => Math.round((v / maxVal) * 100);

  return (
    <div className="mt-5 pt-5 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-primary-600" />
          <h4 className="font-semibold text-gray-800 text-sm">Future Value Estimate</h4>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${outlook.color}`}>
          {outlook.label}
        </span>
      </div>

      <div className="space-y-3">
        {rows.map(({ label, value, pct, highlight }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className={`text-xs font-semibold ${highlight ? 'text-primary-700' : 'text-gray-600'}`}>{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {pct !== null && (
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${pct < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    <ArrowUpRight className="w-3 h-3" />
                    {pct > 0 ? '+' : ''}{pct}%
                  </span>
                )}
                <span className={`text-sm font-bold ${highlight ? 'text-primary-700' : 'text-gray-800'}`}>{fmt(value)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${highlight ? 'bg-gradient-to-r from-primary-500 to-primary-700' : 'bg-gray-300'}`}
                style={{ width: `${barPct(value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {city && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Based on {city.charAt(0).toUpperCase() + city.slice(1)} market trends · Not financial advice
        </p>
      )}
    </div>
  );
};

/**
 * Display component for existing price suggestion data (property detail page)
 */
export const PriceSuggestionDisplay = ({ suggestion, propertyPrice, city }) => {
  if (!suggestion || suggestion.comparableCount === 0) {
    return (
      <div>
        <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
          <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Not enough data for price comparison in this area yet.</p>
        </div>
        {propertyPrice && <FutureValueEstimate currentPrice={propertyPrice} city={city} />}
      </div>
    );
  }

  const { suggestedPrice, avgPricePerSqft, marketTrend, trendPercentChange, comparableCount, confidence, minPrice, maxPrice } = suggestion;
  const priceDiff = propertyPrice - suggestedPrice;
  const diffPercent = suggestedPrice > 0 ? Math.abs((priceDiff / suggestedPrice) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-5 border border-primary-100">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-800">Market Price Analysis</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Suggested Price</p>
          <p className="text-lg font-bold text-primary-700">{formatPriceShort(suggestedPrice)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Avg Price/sq.ft</p>
          <p className="text-lg font-bold text-gray-800">₹{avgPricePerSqft?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Min in Area</p>
          <p className="text-base font-semibold text-gray-700">{formatPriceShort(minPrice)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Max in Area</p>
          <p className="text-base font-semibold text-gray-700">{formatPriceShort(maxPrice)}</p>
        </div>
      </div>

      {/* Price comparison */}
      {propertyPrice && (
        <div className={`rounded-lg p-3 mb-4 ${priceDiff > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-primary-50 border border-primary-200'}`}>
          <p className="text-xs font-medium">
            {priceDiff > 0
              ? `⚠️ This property is priced ${diffPercent}% above market average`
              : `✅ This property is priced ${diffPercent}% below market average — good value!`}
          </p>
        </div>
      )}

      {/* Market Trend */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendIcon trend={marketTrend} />
          <div>
            <p className="text-sm font-medium capitalize text-gray-800">{marketTrend} Market</p>
            {trendPercentChange !== 0 && (
              <p className="text-xs text-gray-500">{Math.abs(trendPercentChange)}% in last 30 days</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Based on {comparableCount} listings</p>
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Data Confidence</span>
          <span className="capitalize font-medium">{confidence}</span>
        </div>
        <ConfidenceBar level={confidence} />
      </div>

      {/* Future Value Estimate */}
      {propertyPrice && <FutureValueEstimate currentPrice={propertyPrice} city={city} />}
    </div>
  );
};

/**
 * Interactive price suggestion fetcher (seller property creation)
 */
const PriceSuggestion = ({ city, propertyType, area, bedrooms, onSuggestion }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const fetchSuggestion = async () => {
    if (!city || !propertyType || !area) {
      toast.error('Please fill in city, property type, and area first.');
      return;
    }

    setLoading(true);
    try {
      const res = await getPriceSuggestion({ city, propertyType, area, bedrooms });
      setSuggestion(res.data);
      if (onSuggestion) onSuggestion(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to get price suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={fetchSuggestion}
        disabled={loading}
        className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium text-sm disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Analyzing Market Data...
          </>
        ) : (
          <>
            <BarChart2 className="w-4 h-4" />
            Get AI Price Estimate
          </>
        )}
      </button>

      {suggestion && <PriceSuggestionDisplay suggestion={suggestion} city={city} />}
    </div>
  );
};

export default PriceSuggestion;
