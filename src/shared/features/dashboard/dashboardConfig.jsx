import { vendorConfig } from './roleConfigs/vendorConfig.jsx';
import { helpdeskConfig } from './roleConfigs/helpdeskConfig.jsx';
import { departmentConfig } from './roleConfigs/departmentConfig.jsx';

/**
 * Role → Dashboard configuration registry.
 *
 * Maps each supported role string (from Redux state.user.role)
 * to its corresponding Dashboard configuration object.
 *
 * Usage:
 *   const config = getDashboardConfig(role);
 *   if (!config) return null; // unknown role, no dashboard
 */
const ROLE_CONFIGS = [
  vendorConfig,
  helpdeskConfig,
  departmentConfig,
];

/**
 * Look up the Dashboard configuration for a given role string.
 *
 * @param {string} role - The raw role value from Redux (e.g. "L1", "L2", "BL1")
 * @returns {Object|null} The matching config, or null if no dashboard for this role
 */
export const getDashboardConfig = (role) => {
  if (!role) return null;
  return ROLE_CONFIGS.find(config => config.roleValues.includes(role)) || null;
};
