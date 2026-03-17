// Client-side validation utilities

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
};

export const isValidPincode = (pincode) => {
  return /^\d{6}$/.test(pincode);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidPrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

export const isValidArea = (area) => {
  const num = parseFloat(area);
  return !isNaN(num) && num > 0;
};

export const validateRegister = (data) => {
  const errors = {};
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!data.role || !['buyer', 'seller'].includes(data.role)) {
    errors.role = 'Select a valid role';
  }
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian phone number';
  }
  return errors;
};

export const validateLogin = (data) => {
  const errors = {};
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }
  return errors;
};

export const validateProperty = (data) => {
  const errors = {};
  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  if (!data.description || data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }
  if (!isValidPrice(data.price)) {
    errors.price = 'Enter a valid price';
  }
  if (!isValidArea(data.area)) {
    errors.area = 'Enter a valid area in sq.ft';
  }
  if (!data.propertyType) {
    errors.propertyType = 'Select a property type';
  }
  if (!data.location?.city || data.location.city.trim().length < 2) {
    errors['location.city'] = 'City is required';
  }
  if (!data.location?.state || data.location.state.trim().length < 2) {
    errors['location.state'] = 'State is required';
  }
  if (!data.location?.address || data.location.address.trim().length < 5) {
    errors['location.address'] = 'Address is required';
  }
  if (data.location?.pincode && !isValidPincode(data.location.pincode)) {
    errors['location.pincode'] = 'Enter a valid 6-digit pincode';
  }
  return errors;
};

export const validateInquiry = (data) => {
  const errors = {};
  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }
  if (data.contactPhone && !isValidPhone(data.contactPhone)) {
    errors.contactPhone = 'Enter a valid phone number';
  }
  return errors;
};

export const validateVisit = (data) => {
  const errors = {};
  if (!data.requestedDate) {
    errors.requestedDate = 'Select a preferred date';
  } else {
    const selected = new Date(data.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      errors.requestedDate = 'Date cannot be in the past';
    }
  }
  if (!data.requestedTime) {
    errors.requestedTime = 'Select a preferred time';
  }
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

export const getFieldError = (errors, field) => errors?.[field] || null;
