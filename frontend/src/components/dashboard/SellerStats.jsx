import React from 'react';
import { Home, Eye, MessageSquare, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, trend, trendValue, description }) => {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-primary-50 text-primary-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const TrendIndicator = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-primary-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        {(trend || trendValue) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendIndicator />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value?.toLocaleString('en-IN') ?? 0}</p>
        <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
};

const SellerStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      icon: Home,
      label: 'Total Listings',
      value: stats.totalListings,
      color: 'blue',
      description: `${stats.activeListings || 0} active`,
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats.totalViews,
      color: 'green',
      description: 'Across all properties',
    },
    {
      icon: MessageSquare,
      label: 'Inquiries',
      value: stats.totalInquiries,
      color: 'purple',
      description: `${stats.unreadInquiries || 0} unread`,
    },
    {
      icon: Calendar,
      label: 'Visit Requests',
      value: stats.totalVisits,
      color: 'orange',
      description: `${stats.pendingVisits || 0} pending`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default SellerStats;
