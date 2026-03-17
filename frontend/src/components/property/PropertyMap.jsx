import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { formatPriceShort } from '../../utils/formatters';

// Fix leaflet marker icon issue in React (use local assets, not CDN)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom property marker icon
const createPropertyIcon = (color = '#1e40af') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
      <text x="16" y="20" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="${color}">🏠</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: 'custom-marker',
  });
};

// Nearby facility marker icons
const facilityIcons = {
  school: { emoji: '🏫', color: '#16a34a' },
  hospital: { emoji: '🏥', color: '#dc2626' },
  transport: { emoji: '🚇', color: '#9333ea' },
  shopping: { emoji: '🛍️', color: '#ea580c' },
};

const createFacilityIcon = (type) => {
  const { emoji } = facilityIcons[type] || { emoji: '📍' };
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1;">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    className: 'facility-marker',
  });
};

// Map resizer (fixes grey tiles issue)
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

// Mock nearby facilities based on property coordinates
const getMockFacilities = (lat, lng) => [
  { type: 'school', name: 'City International School', lat: lat + 0.005, lng: lng + 0.003 },
  { type: 'school', name: 'Modern Public School', lat: lat - 0.004, lng: lng + 0.007 },
  { type: 'hospital', name: 'Apollo Multispeciality', lat: lat + 0.008, lng: lng - 0.004 },
  { type: 'hospital', name: 'City General Hospital', lat: lat - 0.006, lng: lng - 0.005 },
  { type: 'transport', name: 'Metro Station', lat: lat + 0.003, lng: lng - 0.008 },
  { type: 'transport', name: 'Bus Stop', lat: lat - 0.002, lng: lng + 0.005 },
  { type: 'shopping', name: 'City Mall', lat: lat + 0.007, lng: lng + 0.006 },
  { type: 'shopping', name: 'Supermarket', lat: lat - 0.005, lng: lng - 0.003 },
];

/**
 * Single property detail map with nearby facilities
 */
export const PropertyDetailMap = ({ property }) => {
  const coords = property?.location?.coordinates?.coordinates;
  if (!coords || (coords[0] === 0 && coords[1] === 0)) {
    // Default to Mumbai if no coords
    return (
      <div className="map-container flex items-center justify-center bg-gray-100 rounded-xl">
        <p className="text-gray-500 text-sm">Map location not available</p>
      </div>
    );
  }

  const lat = coords[1];
  const lng = coords[0];
  const facilities = getMockFacilities(lat, lng);

  return (
    <div className="map-container">
      <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property Marker */}
        <Marker position={[lat, lng]} icon={createPropertyIcon('#1e40af')}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-sm text-gray-800">{property.title}</p>
              <p className="text-primary-700 font-bold">{formatPriceShort(property.price)}</p>
              <p className="text-xs text-gray-500">{property.location?.address}</p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Facility Markers */}
        {facilities.map((facility, i) => (
          <Marker
            key={i}
            position={[facility.lat, facility.lng]}
            icon={createFacilityIcon(facility.type)}
          >
            <Popup>
              <div className="p-1">
                <p className="font-medium text-sm capitalize">{facility.type}</p>
                <p className="text-xs text-gray-600">{facility.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

/**
 * Multiple properties on a map (for listings page)
 */
export const PropertiesListMap = ({ properties, onPropertyClick }) => {
  const validProperties = properties.filter(
    (p) =>
      p.location?.coordinates?.coordinates &&
      !(p.location.coordinates.coordinates[0] === 0 && p.location.coordinates.coordinates[1] === 0)
  );

  // Default center (India)
  const center = validProperties.length > 0
    ? [validProperties[0].location.coordinates.coordinates[1], validProperties[0].location.coordinates.coordinates[0]]
    : [20.5937, 78.9629];

  const zoom = validProperties.length > 0 ? 12 : 5;

  return (
    <div className="map-container" style={{ height: '500px' }}>
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validProperties.length === 0 && (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-gray-500">No properties with location data</p>
          </div>
        )}

        {validProperties.map((property) => {
          const [lng, lat] = property.location.coordinates.coordinates;
          return (
            <Marker key={property._id} position={[lat, lng]} icon={createPropertyIcon('#1e40af')}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  {property.images?.[0]?.url && (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-full h-24 object-cover rounded mb-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <p className="font-semibold text-sm text-gray-800 line-clamp-2">{property.title}</p>
                  <p className="text-primary-700 font-bold text-sm mt-1">{formatPriceShort(property.price)}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{property.propertyType} · {property.bedrooms} BHK</p>
                  {onPropertyClick && (
                    <button
                      onClick={() => onPropertyClick(property._id)}
                      className="mt-2 w-full text-xs bg-primary-600 text-white py-1.5 rounded hover:bg-primary-700 transition-colors"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

/**
 * Map with clickable location picker (for property creation)
 */
export const LocationPickerMap = ({ onLocationSelect, initialLat, initialLng }) => {
  const defaultCenter = initialLat && initialLng
    ? [initialLat, initialLng]
    : [19.0760, 72.8777]; // Mumbai

  const ClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      const handleClick = (e) => {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      };
      map.on('click', handleClick);
      return () => map.off('click', handleClick);
    }, [map]);
    return null;
  };

  return (
    <div className="map-container-small" style={{ height: '300px' }}>
      <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" style={{ cursor: 'crosshair' }}>
        <MapResizer />
        <ClickHandler />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {initialLat && initialLng && (
          <Marker position={[initialLat, initialLng]} icon={createPropertyIcon('#1e40af')}>
            <Popup>Property Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default PropertyDetailMap;
