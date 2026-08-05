/**
 * Fully masks a mobile number, replacing all characters with asterisks.
 * The masked string length matches the original length.
 * e.g. 9876543210 -> **********
 */
export const maskMobile = (mobile) => {
  if (!mobile) return mobile;
  return '*'.repeat(mobile.length);
};

/**
 * Fully masks a GST number, replacing all characters with asterisks.
 * The masked string length matches the original length.
 * e.g. 20AALFM8458M1ZS -> ****************
 */
export const maskGst = (gst) => {
  if (!gst) return gst;
  return '*'.repeat(gst.length);
};

/**
 * Fully masks a PAN number, replacing all characters with asterisks.
 * The masked string length matches the original length.
 * e.g. AALFM8458M -> **********
 */
export const maskPan = (pan) => {
  if (!pan) return pan;
  return '*'.repeat(pan.length);
};

/**
 * Fully masks an address, replacing all characters with asterisks.
 * The masked string length matches the original length.
 * e.g. Baidyanath Bhavan, Jamshedpur -> ********************************
 */
export const maskAddress = (address) => {
  if (!address) return address;
  return '*'.repeat(address.length);
};

/**
 * Fully masks an email address, replacing all characters with asterisks.
 * The masked string length matches the original length.
 * e.g. ms.mohanthakur@gmail.com -> *************************
 */
export const maskEmail = (email) => {
  if (!email) return email;
  return '*'.repeat(email.length);
};
