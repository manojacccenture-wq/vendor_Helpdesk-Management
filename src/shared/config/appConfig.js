/**
 * Application Configuration
 *
 * Centralized constants used across the vendor helpdesk application.
 * All shared configuration values live here to avoid hardcoding
 * in individual components or services.
 */

/**
 * VHD (Vendor Helpdesk) support email addresses.
 * Both addresses represent the centralized VHD recipient.
 * Wherever the email matrix says "VHD", both addresses are used.
 */
export const VHD_EMAILS = [
  'support@lhsindia.com',
  'vendorhelpdesktsuisl@tatasteel.com',
];

/**
 * Application URL used in email body links.
 * Shared across all email notification templates.
 */
export const APP_URL = 'https://services.tsuisl.co.in/DBSTS';
