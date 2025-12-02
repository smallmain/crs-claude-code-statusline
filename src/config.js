/**
 * Configuration management for CRS StatusLine
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.crs-statusline');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// Display config option values
const DisplayOption = {
  AUTO: 'auto',
  ENABLE: 'enable',
  DISABLE: 'disable',
};

// Default display configuration
const DEFAULT_DISPLAY_CONFIG = {
  showUsedCredit: true,
  showDailyUsage: DisplayOption.AUTO,
  showMonthlyUsage: DisplayOption.AUTO,
  showTotalUsage: DisplayOption.AUTO,
  useColors: true,
};

/**
 * Read configuration from file
 * @returns {{apiUrl?: string, apiKey?: string}}
 */
function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    // If file doesn't exist or is invalid, return empty object
  }
  return {};
}

/**
 * Write configuration to file
 * @param {{apiUrl?: string, apiKey?: string}} config
 */
function writeConfig(config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Get CRS API configuration
 * Priority: environment variables > config file
 * @returns {{apiUrl: string | undefined, apiKey: string | undefined}}
 */
function getApiConfig() {
  const config = readConfig();
  return {
    apiUrl: process.env.CRS_API_URL || config.apiUrl,
    apiKey: process.env.CRS_API_KEY || config.apiKey,
  };
}

/**
 * Set CRS API configuration
 * @param {string} apiUrl - CRS API base URL
 * @param {string} apiKey - CRS API key
 */
function setApiConfig(apiUrl, apiKey) {
  const config = readConfig();
  config.apiUrl = apiUrl;
  config.apiKey = apiKey;
  writeConfig(config);
}

/**
 * Check if configuration exists
 * @returns {boolean}
 */
function isConfigured() {
  const { apiUrl, apiKey } = getApiConfig();
  return !!(apiUrl && apiKey);
}

/**
 * Get display configuration
 * @returns {{showUsedCredit: boolean, showDailyUsage: string, showMonthlyUsage: string, showTotalUsage: string, useColors: boolean}}
 */
function getDisplayConfig() {
  const config = readConfig();
  return {
    ...DEFAULT_DISPLAY_CONFIG,
    ...config.display,
  };
}

/**
 * Set display configuration
 * @param {{showUsedCredit?: boolean, showDailyUsage?: string, showMonthlyUsage?: string, showTotalUsage?: string, useColors?: boolean}} displayConfig
 */
function setDisplayConfig(displayConfig) {
  const config = readConfig();
  config.display = {
    ...DEFAULT_DISPLAY_CONFIG,
    ...config.display,
    ...displayConfig,
  };
  writeConfig(config);
}

module.exports = {
  readConfig,
  writeConfig,
  getApiConfig,
  setApiConfig,
  isConfigured,
  getDisplayConfig,
  setDisplayConfig,
  DisplayOption,
  CONFIG_FILE,
};
