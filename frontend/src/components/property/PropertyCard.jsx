import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2, CheckCircle2, Star, Shield } from 'lucide-react';
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
  } = property;

  const imageUrl = images?.[0]?.url || '/placeholder-property.jpg';
  const typeColor = getPropertyTypeColor(propertyType);

  return (
    <div className="property-card bg-white rounded-xl overflow-hidden shadow-card border border-gray-100 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <Link to={`/properties/${_id}`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';
            }}
          />
        </Link>

        {/* Featured Ribbon */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-accent-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-white" />
            Featured
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white text-primary-700 text-sm font-bold px-3 py-1 rounded-full shadow-md">
          {formatPriceShort(price)}
        </div>

        {/* Verified Seller Badge — bottom-left overlay */}
        {seller?.verificationStatus === 'verified' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-primary-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg">
            <Shield className="w-3.5 h-3.5 fill-white" />
            Verified Seller
          </div>
        )}

        {/* Image count */}
        {images?.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded-full">
            +{images.length - 1} photos
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Type Badge + Status */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${typeColor}`}>
            {formatPropertyType(propertyType)}
          </span>
          {status === 'sold' && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
              SOLD
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/properties/${_id}`}>
          <h3 className="font-semibold text-gray-900 text-base leading-tight hover:text-primary-700 transition-colors mb-1.5">
            {truncateText(title, 55)}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
          <span className="truncate">{location?.city && location?.address ? `${location.address}, ${location.city}` : location?.city || 'Location N/A'}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-gray-600 text-xs mb-3 border-t border-gray-50 pt-3">
          {bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-gray-400" />
              <span>{bedrooms} Bed{bedrooms !== 1 ? 's' : ''}</span>
            </div>
          )}
          {bathrooms !== undefined && (
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

        {/* Footer: Seller + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
              {seller?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">{seller?.name || 'Seller'}</p>
              {seller?.verificationStatus === 'verified' && (
                <div className="flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 text-primary-500" />
                  <span className="text-[10px] text-primary-600 font-medium">Verified</span>
                </div>
              )}
            </div>
          </div>

          <Link
            to={`/properties/${_id}`}
            className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
