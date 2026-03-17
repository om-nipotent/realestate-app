const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const PROPERTY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  INACTIVE: 'inactive',
};

const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'commercial',
  'land',
  'office',
];

const VISIT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const INQUIRY_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  REPLIED: 'replied',
};

const NOTIFICATION_TYPES = {
  INQUIRY: 'inquiry',
  VISIT: 'visit',
  VERIFICATION: 'verification',
  PROPERTY: 'property',
  SYSTEM: 'system',
};

const AMENITIES = [
  'parking',
  'gym',
  'swimming pool',
  'garden',
  'security',
  'elevator',
  'power backup',
  'water supply',
  'air conditioning',
  'intercom',
  'club house',
  'children play area',
  'fire safety',
  'cctv',
  'wifi',
];

const FURNISHING_STATUS = {
  UNFURNISHED: 'unfurnished',
  SEMI_FURNISHED: 'semi-furnished',
  FULLY_FURNISHED: 'fully-furnished',
};

module.exports = {
  USER_ROLES,
  VERIFICATION_STATUS,
  PROPERTY_STATUS,
  PROPERTY_TYPES,
  VISIT_STATUS,
  INQUIRY_STATUS,
  NOTIFICATION_TYPES,
  AMENITIES,
  FURNISHING_STATUS,
};
