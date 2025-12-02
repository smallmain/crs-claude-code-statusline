#!/usr/bin/env node

const { getUsageInfo } = require('./usage');
const { getApiConfig, getDisplayConfig, DisplayOption } = require('./config');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

function getUsageColor(dailyUsed, dailyTotal, totalUsed, totalTotal) {
  // When limit is 0, it means unlimited, so don't count it in percentage calculation
  const dailyPercentage = dailyTotal > 0 ? (dailyUsed / dailyTotal) * 100 : -1;
  const totalPercentage = totalTotal > 0 ? (totalUsed / totalTotal) * 100 : -1;
  const percentages = [dailyPercentage, totalPercentage].filter((p) => p >= 0);
  const maxPercentage = percentages.length > 0 ? Math.max(...percentages) : 0;

  if (maxPercentage >= 90) {
    return colors.red;
  } else if (maxPercentage >= 70) {
    return colors.yellow;
  }
  return colors.green;
}

function formatCost(value) {
  return value.toFixed(1);
}

function formatTokens(tokens) {
  if (tokens >= 1_000_000) {
    return (tokens / 1_000_000).toFixed(1) + 'M';
  } else if (tokens >= 1_000) {
    return (tokens / 1_000).toFixed(1) + 'K';
  }
  return tokens.toString();
}

function formatLimit(used, limit) {
  const usedStr = `$${formatCost(used)}`;
  const limitStr = limit > 0 ? `$${formatCost(limit)}` : '∞';
  return `${usedStr}/${limitStr}`;
}

/**
 * Find the most constrained limit (smallest remaining amount)
 * @param {Object} daily - Daily usage info with cost.used and cost.total
 * @param {Object} total - Total usage info with cost.used and cost.total
 * @returns {{used: number, limit: number, remaining: number, type: string} | null}
 */
function getMostConstrainedLimit(daily, total) {
  const limits = [];

  // Daily limit
  if (daily.cost.total > 0) {
    limits.push({
      used: daily.cost.used,
      limit: daily.cost.total,
      remaining: daily.cost.total - daily.cost.used,
      type: 'daily',
    });
  }

  // Total limit
  if (total.cost.total > 0) {
    limits.push({
      used: total.cost.used,
      limit: total.cost.total,
      remaining: total.cost.total - total.cost.used,
      type: 'total',
    });
  }

  if (limits.length === 0) {
    return null; // All unlimited
  }

  // Return the one with smallest remaining
  return limits.reduce((min, curr) =>
    curr.remaining < min.remaining ? curr : min,
  );
}

/**
 * Format the "Used credit" display
 * @param {Object} daily - Daily usage info
 * @param {Object} total - Total usage info
 * @returns {string}
 */
function formatUsedCredit(daily, total) {
  const mostConstrained = getMostConstrainedLimit(daily, total);

  if (!mostConstrained) {
    return 'Used credit: Unlimited';
  }

  const percentage = (
    (mostConstrained.used / mostConstrained.limit) *
    100
  ).toFixed(1);
  return `Used credit: ${percentage}% ($${formatCost(
    mostConstrained.used,
  )}/$${formatCost(mostConstrained.limit)})`;
}

/**
 * Check if a usage part should be shown based on config and limit
 * @param {string} configValue - 'auto', 'enable', or 'disable'
 * @param {number} limit - The limit value (0 means unlimited)
 * @param {boolean} forceAutoShow - If true, show even in auto mode without limit
 * @returns {boolean}
 */
function shouldShowUsage(configValue, limit, forceAutoShow = false) {
  if (configValue === DisplayOption.DISABLE) {
    return false;
  }
  if (configValue === DisplayOption.ENABLE) {
    return true;
  }
  // Auto: show when there's a limit, or when forceAutoShow is true
  return limit > 0 || forceAutoShow;
}

function formatStatusLine(usageInfo, displayConfig) {
  if (usageInfo.error) {
    const errorColor = displayConfig.useColors ? colors.red : colors.gray;
    return `${errorColor}CRS: ${usageInfo.error}${colors.reset}`;
  }

  const { daily, monthly, total } = usageInfo;

  const showUsedCredit = displayConfig.showUsedCredit;

  // Determine which parts to show
  const showDaily = shouldShowUsage(
    displayConfig.showDailyUsage,
    daily.cost.total,
    showUsedCredit,
  );
  // Monthly has no limit
  const showMonthly = shouldShowUsage(
    displayConfig.showMonthlyUsage,
    0,
    showUsedCredit,
  );
  const showTotal = shouldShowUsage(
    displayConfig.showTotalUsage,
    total.cost.total,
    showUsedCredit,
  );

  // If nothing to show, return empty string
  if (!showUsedCredit && !showDaily && !showMonthly && !showTotal) {
    return '';
  }

  // Determine color
  let color;
  if (displayConfig.useColors) {
    color = getUsageColor(
      daily.cost.used,
      daily.cost.total,
      total.cost.used,
      total.cost.total,
    );
  } else {
    color = colors.gray;
  }

  const parts = [];

  // Order: Used credit | Daily | Monthly | Total

  if (showUsedCredit) {
    const usedCreditPart = formatUsedCredit(daily, total);
    parts.push(usedCreditPart);
  }

  if (showDaily) {
    const dailyPart = showUsedCredit
      ? `Daily: $${formatCost(daily.cost.used)}, ${formatTokens(daily.tokens)}`
      : `Daily: ${formatLimit(
          daily.cost.used,
          daily.cost.total,
        )}, ${formatTokens(daily.tokens)}`;
    parts.push(dailyPart);
  }

  if (showMonthly) {
    const monthlyPart = `Monthly: $${formatCost(monthly.cost)}, ${formatTokens(
      monthly.tokens,
    )}`;
    parts.push(monthlyPart);
  }

  if (showTotal) {
    const totalPart = showUsedCredit
      ? `Total: $${formatCost(total.cost.used)}, ${formatTokens(total.tokens)}`
      : `Total: ${formatLimit(
          total.cost.used,
          total.cost.total,
        )}, ${formatTokens(total.tokens)}`;
    parts.push(totalPart);
  }

  return `${color}${parts.join(' | ')}${colors.reset}`;
}

async function main() {
  // Get display configuration early for error handling
  const displayConfig = getDisplayConfig();

  try {
    // Read session data from stdin (provided by Claude Code)
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    // Parse session data (we may use it in the future)
    // const sessionData = JSON.parse(inputData);

    // Get API configuration
    const { apiUrl, apiKey } = getApiConfig();

    // Get usage information from CRS
    const usageInfo = await getUsageInfo(apiUrl, apiKey);

    // Output the formatted status line
    console.log(formatStatusLine(usageInfo, displayConfig));
  } catch (err) {
    // Fallback output on error
    const errorColor = displayConfig.useColors ? colors.red : colors.gray;
    console.log(`${errorColor}CRS: Error${colors.reset}`);
  }
}

main();
