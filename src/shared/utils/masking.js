/**
 * Masks a mobile number to show only first two and last two digits.
 * e.g. 9876543210 -> 98******10
 */
export const maskMobile = (mobile) => {
  if (!mobile || mobile.length < 4) return mobile;
  const firstTwo = mobile.slice(0, 2);
  const lastTwo = mobile.slice(-2);
  const maskedLength = mobile.length - 4;
  return `${firstTwo}${ '*'.repeat(maskedLength > 0 ? maskedLength : 0) }${lastTwo}`;
};

/**
 * Masks a GST number to show only first 7 and last 2 characters.
 * e.g. 29ABCDE1234F2Z5 -> 29ABCDE******Z5
 */
export const maskGst = (gst) => {
  if (!gst || gst.length <= 9) return gst;
  const firstSeven = gst.slice(0, 7);
  const lastTwo = gst.slice(-2);
  const maskedLength = gst.length - 9;
  return `${firstSeven}${ '*'.repeat(maskedLength > 0 ? maskedLength : 0) }${lastTwo}`;
};

/**
 * Masks a PAN number to show only first 5 and last 1 character.
 * e.g. ABCDE1234F -> ABCDE****F
 */
export const maskPan = (pan) => {
  if (!pan || pan.length <= 6) return pan;
  const firstFive = pan.slice(0, 5);
  const lastOne = pan.slice(-1);
  const maskedLength = pan.length - 6;
  return `${firstFive}${ '*'.repeat(maskedLength > 0 ? maskedLength : 0) }${lastOne}`;
};

/**
 * Masks an address by hiding the first part (street name).
 * e.g. Road No 4, Adityapur, Jamshedpur -> ****, Adityapur, Jamshedpur
 */
export const maskAddress = (address) => {
  if (!address) return address;
  const parts = address.split(',');
  if (parts.length === 1) {
    return '****';
  }
  return `****, ${parts.slice(1).join(',').trim()}`;
};
