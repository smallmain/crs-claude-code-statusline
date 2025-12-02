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
 * Check if a usage part should be shown based on config and limit
 * @param {string} configValue - 'auto', 'enable', or 'disable'
 * @param {number} limit - The limit value (0 means unlimited)
 * @returns {boolean}
 */
function shouldShowUsage(configValue, limit) {
  if (configValue === DisplayOption.DISABLE) {
    return false;
  }
  if (configValue === DisplayOption.ENABLE) {
    return true;
  }
  // Auto: show only when there's a limit
  return limit > 0;
}

function formatStatusLine(usageInfo, displayConfig) {
  if (usageInfo.error) {
    const errorColor = displayConfig.useColors ? colors.red : colors.gray;
    return `${errorColor}CRS: ${usageInfo.error}${colors.reset}`;
  }

  const { daily, monthly, total } = usageInfo;

  // Determine which parts to show
  const showDaily = shouldShowUsage(
    displayConfig.showDailyUsage,
    daily.cost.total,
  );
  // Monthly has no limit
  const showMonthly = shouldShowUsage(displayConfig.showMonthlyUsage, 0);
  const showTotal = shouldShowUsage(
    displayConfig.showTotalUsage,
    total.cost.total,
  );

  // If nothing to show, return empty string
  if (!showDaily && !showMonthly && !showTotal) {
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

  // Order: Daily | Monthly | Total
  if (showDaily) {
    const dailyPart = `Daily: ${formatLimit(
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
    const totalPart = `Total: ${formatLimit(
      total.cost.used,
      total.cost.total,
    )}`;
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
