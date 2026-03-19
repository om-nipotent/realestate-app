/**
 * Premium PropertyCard with Framer Motion hover animations,
 * image zoom effect, favourite heart toggle, and improved visual hierarchy.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize2, CheckCircle2, Star, Shield, Heart, Eye } from 'lucide-react';
import { formatPriceShort, getPropertyTypeColor, formatPropertyType, truncateText } from '../../utils/formatters';

const PropertyCard = ({ property }) => {
  const {
    _id,
    title,
    price,
    location,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    images,
    seller,
    featured,
    status,
    views,
  } = property;

  const [liked, setLiked] = useState(false);

  const imageUrl = images?.[0]?.url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
  const typeColor = getPropertyTypeColor(propertyType);

  return (
    <motion.div
      // UX decision: use a gentle spring for the Y lift so it feels physical, not stiff
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.10)' }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white dark:bg-surface-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-surface-700 shadow-card group relative"
      style={{ willChange: 'transform' }}
    >
      {/* ── Image ─────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <Link to={`/properties/${_id}`}>
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full h-52 object-cover"
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
            }}
          />
        </Link>

        {/* Gradient overlay for bottom badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Featured ribbon */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
          >
            <Star className="w-3 h-3 fill-white" /> Featured
          </motion.div>
        )}

        {/* Price badge */}
        <div className="absolute top-3 right-12 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-sm font-bold px-3 py-1 rounded-full shadow-md">
          {formatPriceShort(price)}
        </div>

        {/* Heart / Favourite */}
        <motion.button
          onClick={() => setLiked((l) => !l)}
          whileTap={{ scale: 0 }}
          animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-surface-700 transition-colors"
          aria-label="Favourite"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${liked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
          />
        </motion.button>

        {/* Verified Seller badge */}
        {seller?.verificationStatus === 'verified' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <Shield className="w-3 h-3" /> Verified
          </div>
        )}

        {/* Image count */}
        {images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
            +{images.length - 1} photos
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────── */}
      <div className="p-4">
        {/* Type + status */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
            {formatPropertyType(propertyType)}
          </span>
          <div className="flex items-center gap-1.5">
            {views != null && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <Eye className="w-3 h-3" /> {views}
              </span>
            )}
            {status === 'sold' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">SOLD</span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/properties/${_id}`}>
          <h3 className="font-semibold text-gray-900 text-base leading-tight hover:text-primary-600 transition-colors mb-1.5 line-clamp-2">
            {truncateText(title, 60)}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
          <span className="truncate">
            {location?.city && location?.address ? `${location.address}, ${location.city}` : location?.city || 'Location N/A'}
          </span>
        </div>

        {/* Stats row */}
        {(bedrooms != null || bathrooms != null || area) && (
          <div className="flex items-center gap-3 text-gray-500 text-xs mb-3 pb-3 border-t border-gray-50 pt-3">
            {bedrooms != null && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-gray-400" />
                <span>{bedrooms} Bed{bedrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {bathrooms != null && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-gray-400" />
                <span>{bathrooms} Bath{bathrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{Number(area).toLocaleString('en-IN')} sq.ft</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C026D3, #86198F)' }}>
              {seller?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium leading-none">{seller?.name || 'Seller'}</p>
              {seller?.verificationStatus === 'verified' && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600 font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to={`/properties/${_id}`}
              className="px-3.5 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-xl hover:bg-primary-100 transition-colors"
            >
              View Details
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
