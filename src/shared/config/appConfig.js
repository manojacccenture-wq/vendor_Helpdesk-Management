/**
 * Application Configuration
 *
 * Centralized constants used across the vendor helpdesk application.
 * All shared configuration values live here to avoid hardcoding
 * in individual components or services.
 */

/**
 * VHD (Vendor Helpdesk) support email address.
 * Represents the centralized VHD recipient.
 * Wherever the email matrix says "VHD", this address is used.
 */
export const VHD_EMAILS = [
  'vendorhelpdesktsuisl@tatasteel.com',
];

/**
 * Application URL used in email body links.
 * Shared across all email notification templates.
 */
export const APP_URL = 'https://services.tsuisl.co.in/DBSTS';
