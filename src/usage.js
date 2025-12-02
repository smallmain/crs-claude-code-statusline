/**
 * Usage information module for Claude Relay Service
 */

// Cache configuration
const CACHE_TTL_MS = 10 * 1000;

// Cache state
let cachedResult = null;
let lastFetchTime = 0;

/**
 * @typedef {Object} CostInfo
 * @property {number} used - Used cost in USD
 * @property {number} total - Total cost limit in USD
 */

/**
 * @typedef {Object} DailyUsage
 * @property {CostInfo} cost - Daily cost information
 * @property {number} tokens - Daily tokens used
 */

/**
 * @typedef {Object} TotalUsage
 * @property {CostInfo} cost - Total cost information
 * @property {number} tokens - Total tokens used
 */

/**
 * @typedef {Object} MonthlyUsage
 * @property {number} cost - Monthly cost used in USD
 * @property {number} tokens - Monthly tokens used
 */

/**
 * @typedef {Object} UsageInfo
 * @property {DailyUsage} daily - Daily usage information
 * @property {MonthlyUsage} monthly - Monthly usage information
 * @property {TotalUsage} total - Total usage information
 */

/**
 * Get API ID from API Key
 * @param {string} baseUrl - CRS API base URL
 * @param {string} apiKey - CRS API key
 * @returns {Promise<string|null>} API ID or null on error
 */
async function getApiId(baseUrl, apiKey) {
  const response = await fetch(`${baseUrl}/apiStats/api/get-key-id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiKey }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get API ID: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.data?.id) {
    throw new Error('Invalid response from get-key-id API');
  }

  return data.data.id;
}

/**
 * Get user stats from API ID
 * @param {string} baseUrl - CRS API base URL
 * @param {string} apiId - API ID
 * @returns {Promise<Object>} User stats data
 */
async function getUserStats(baseUrl, apiId) {
  const response = await fetch(`${baseUrl}/apiStats/api/user-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get user stats: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Invalid response from user-stats API');
  }

  return data.data;
}

/**
 * Get user model stats for a specific period
 * @param {string} baseUrl - CRS API base URL
 * @param {string} apiId - API ID
 * @param {string} period - Period type ('daily' or 'monthly')
 * @returns {Promise<Object>} User model stats data
 */
async function getUserModelStats(baseUrl, apiId, period) {
  const response = await fetch(`${baseUrl}/apiStats/api/user-model-stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ apiId, period }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get user model stats: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.data) {
    throw new Error('Invalid response from user-model-stats API');
  }

  return data.data;
}

/**
 * Fetch fresh usage data from API
 * @param {string} baseUrl - CRS API base URL
 * @param {string} apiKey - CRS API key
 * @returns {Promise<UsageInfo | {error: string}>}
 */
async function fetchUsageData(baseUrl, apiKey) {
  // Step 1: Get API ID from API Key
  const apiId = await getApiId(baseUrl, apiKey);

  // Step 2: Get user stats and monthly model stats in parallel
  const [stats, monthlyModelStats] = await Promise.all([
    getUserStats(baseUrl, apiId),
    getUserModelStats(baseUrl, apiId, 'monthly'),
  ]);

  // Extract usage information
  const { usage, limits } = stats;

  // Aggregate monthly stats from all models
  const monthlyTotals = monthlyModelStats.reduce(
    (acc, model) => {
      acc.tokens += model.allTokens || 0;
      acc.cost += model.costs?.total || 0;
      return acc;
    },
    { tokens: 0, cost: 0 },
  );

  return {
    daily: {
      cost: {
        used: limits.currentDailyCost || 0,
        total: limits.dailyCostLimit || 0,
      },
      tokens: usage?.total?.allTokens || 0,
    },
    monthly: {
      cost: monthlyTotals.cost,
      tokens: monthlyTotals.tokens,
    },
    total: {
      cost: {
        used: limits.currentTotalCost || 0,
        total: limits.totalCostLimit || 0,
      },
      tokens: usage?.total?.allTokens || 0,
    },
  };
}

/**
 * Get usage information from Claude Relay Service
 * Results are cached for CACHE_TTL_MS to avoid excessive API calls
 *
 * @param {string} baseUrl - CRS API base URL
 * @param {string} apiKey - CRS API key
 * @returns {Promise<UsageInfo | {error: string}>}
 */
async function getUsageInfo(baseUrl, apiKey) {
  if (!baseUrl || !apiKey) {
    return {
      error: 'Not configured',
    };
  }

  const now = Date.now();

  // Return cached result if still valid
  if (cachedResult && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedResult;
  }

  try {
    const result = await fetchUsageData(baseUrl, apiKey);
    cachedResult = result;
    lastFetchTime = now;
    return result;
  } catch (err) {
    // On error, return cached result if available, otherwise return error
    if (cachedResult) {
      return cachedResult;
    }
    return {
      error: err.message || 'API Error',
    };
  }
}

module.exports = {
  getUsageInfo,
};
