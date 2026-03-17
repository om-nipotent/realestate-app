import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader, BarChart2, Home, Info } from 'lucide-react';
import { formatPrice, formatPriceShort } from '../../utils/formatters';
import { getPriceSuggestion } from '../../api/verification.api';
import toast from 'react-hot-toast';

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

/**
 * Display component for existing price suggestion data (property detail page)
 */
export const PriceSuggestionDisplay = ({ suggestion, propertyPrice }) => {
  if (!suggestion || suggestion.comparableCount === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Not enough data for price comparison in this area yet.</p>
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

      {suggestion && <PriceSuggestionDisplay suggestion={suggestion} />}
    </div>
  );
};

export default PriceSuggestion;
