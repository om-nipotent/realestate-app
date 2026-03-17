import { formatDistanceToNow, format, parseISO } from 'date-fns';

/**
 * Format a number as Indian Rupee currency
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format price in shorthand (e.g., ₹1.2Cr, ₹45L)
 */
export const formatPriceShort = (price) => {
  if (!price) return '₹0';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price}`;
};

/**
 * Format a date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy');
  } catch {
    return '';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return '';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Format area with suffix
 */
export const formatArea = (sqft) => {
  if (!sqft) return '0 sq.ft';
  return `${Number(sqft).toLocaleString('en-IN')} sq.ft`;
};

/**
 * Truncate text to a given length
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Format phone number with spacing
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  return phone;
};

/**
 * Format property type for display
 */
export const formatPropertyType = (type) => {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Get property type color classes
 */
export const getPropertyTypeColor = (type) => {
  const colors = {
    apartment: 'bg-primary-100 text-primary-800',
    house: 'bg-primary-100 text-primary-800',
    villa: 'bg-purple-100 text-purple-800',
    commercial: 'bg-orange-100 text-orange-800',
    land: 'bg-yellow-100 text-yellow-800',
    office: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Get verification status color
 */
export const getVerificationColor = (status) => {
  const colors = {
    verified: 'text-primary-600',
    pending: 'text-yellow-600',
    rejected: 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
};

/**
 * Get status badge classes
 */
export const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-primary-100 text-primary-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-gray-100 text-gray-800',
    inactive: 'bg-red-100 text-red-800',
    verified: 'bg-primary-100 text-primary-800',
    rejected: 'bg-red-100 text-red-800',
    approved: 'bg-primary-100 text-primary-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-primary-100 text-primary-800',
    unread: 'bg-orange-100 text-orange-800',
    read: 'bg-gray-100 text-gray-800',
    replied: 'bg-accent-100 text-accent-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
