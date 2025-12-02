#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const {
  getApiConfig,
  setApiConfig,
  isConfigured,
  getDisplayConfig,
  setDisplayConfig,
  DisplayOption,
  CONFIG_FILE,
} = require('./config');

const CLAUDE_SETTINGS_DIR = path.join(os.homedir(), '.claude');
const CLAUDE_SETTINGS_FILE = path.join(CLAUDE_SETTINGS_DIR, 'settings.json');
const STATUSLINE_SCRIPT = path.join(__dirname, 'statusline.js');

function readSettings() {
  try {
    if (fs.existsSync(CLAUDE_SETTINGS_FILE)) {
      const content = fs.readFileSync(CLAUDE_SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    // If file doesn't exist or is invalid, start with empty object
  }
  return {};
}

function writeSettings(settings) {
  // Ensure .claude directory exists
  if (!fs.existsSync(CLAUDE_SETTINGS_DIR)) {
    fs.mkdirSync(CLAUDE_SETTINGS_DIR, { recursive: true });
  }
  fs.writeFileSync(
    CLAUDE_SETTINGS_FILE,
    JSON.stringify(settings, null, 2) + '\n',
  );
}

async function install() {
  // If not configured, prompt for configuration first
  if (!isConfigured()) {
    console.log("CRS API not configured. Let's set it up first.");
    console.log('');
    await configureApi();
    console.log('');
  }

  const settings = readSettings();

  settings.statusLine = {
    type: 'command',
    command: STATUSLINE_SCRIPT,
    padding: 0,
  };

  writeSettings(settings);

  const current = getApiConfig();

  console.log('✅ CRS StatusLine installed successfully!');
  console.log(`   Script: ${STATUSLINE_SCRIPT}`);
  console.log('');
  console.log('Configuration:');
  console.log(`   API URL: ${current.apiUrl || '(not set)'}`);
  console.log(
    `   API Key: ${
      current.apiKey ? current.apiKey.slice(0, 10) + '...' : '(not set)'
    }`,
  );
  console.log('');
  console.log('Restart Claude Code to see the status line.');
}

function uninstall() {
  const settings = readSettings();

  if (settings.statusLine) {
    delete settings.statusLine;
    writeSettings(settings);
    console.log('✅ CRS StatusLine uninstalled successfully!');
    console.log('');
    console.log('Restart Claude Code to apply changes.');
  } else {
    console.log('ℹ️  StatusLine is not currently installed.');
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Interactive menu selection with arrow keys
 * @param {string} title - Menu title
 * @param {Array<{label: string, value: any}>} options - Menu options
 * @returns {Promise<any>} Selected value
 */
function selectMenu(title, options) {
  return new Promise((resolve) => {
    let selectedIndex = 0;

    const render = () => {
      // Clear screen and move cursor to top
      process.stdout.write('\x1b[2J\x1b[H');
      console.log(title);
      console.log('='.repeat(title.length));
      console.log('');
      console.log('Use ↑↓ to select, Enter to confirm\n');

      options.forEach((option, index) => {
        const prefix = index === selectedIndex ? '> ' : '  ';
        const highlight = index === selectedIndex ? '\x1b[36m' : '\x1b[0m';
        console.log(`${highlight}${prefix}${option.label}\x1b[0m`);
      });
    };

    render();

    // Enable raw mode for keypress detection
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onKeypress = (key) => {
      // Ctrl+C
      if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onKeypress);
        process.stdout.write('\x1b[2J\x1b[H');
        process.exit(0);
      }

      // Enter
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onKeypress);
        process.stdout.write('\x1b[2J\x1b[H');
        resolve(options[selectedIndex].value);
        return;
      }

      // Arrow keys (escape sequences)
      if (key === '\x1b[A' || key === 'k') {
        // Up
        selectedIndex = (selectedIndex - 1 + options.length) % options.length;
        render();
      } else if (key === '\x1b[B' || key === 'j') {
        // Down
        selectedIndex = (selectedIndex + 1) % options.length;
        render();
      }
    };

    process.stdin.on('data', onKeypress);
  });
}

/**
 * Interactive toggle menu for display settings
 * @returns {Promise<void>}
 */
async function configureDisplay() {
  const displayConfig = getDisplayConfig();

  const usageOptions = [
    { label: 'Auto (show when limited)', value: DisplayOption.AUTO },
    { label: 'Enable', value: DisplayOption.ENABLE },
    { label: 'Disable', value: DisplayOption.DISABLE },
  ];

  const colorOptions = [
    { label: 'Enable', value: true },
    { label: 'Disable', value: false },
  ];

  const items = [
    {
      key: 'showDailyUsage',
      label: 'Show Daily Usage',
      options: usageOptions,
      currentValue: displayConfig.showDailyUsage,
    },
    {
      key: 'showMonthlyUsage',
      label: 'Show Monthly Usage',
      options: usageOptions,
      currentValue: displayConfig.showMonthlyUsage,
    },
    {
      key: 'showTotalUsage',
      label: 'Show Total Usage',
      options: usageOptions,
      currentValue: displayConfig.showTotalUsage,
    },
    {
      key: 'useColors',
      label: 'Use Colors',
      options: colorOptions,
      currentValue: displayConfig.useColors,
    },
  ];

  let selectedIndex = 0;

  const getOptionLabel = (item) => {
    const option = item.options.find((o) => o.value === item.currentValue);
    return option ? option.label : String(item.currentValue);
  };

  const cycleOption = (item) => {
    const currentIdx = item.options.findIndex(
      (o) => o.value === item.currentValue,
    );
    const nextIdx = (currentIdx + 1) % item.options.length;
    item.currentValue = item.options[nextIdx].value;
  };

  const render = () => {
    process.stdout.write('\x1b[2J\x1b[H');
    console.log('Display Settings');
    console.log('================');
    console.log('');
    console.log('Use ↑↓ to select, Space to toggle, Enter to save\n');

    items.forEach((item, index) => {
      const prefix = index === selectedIndex ? '> ' : '  ';
      const highlight = index === selectedIndex ? '\x1b[36m' : '\x1b[0m';
      const valueStr = `[${getOptionLabel(item)}]`;
      console.log(`${highlight}${prefix}${item.label}: ${valueStr}\x1b[0m`);
    });

    console.log('');
  };

  return new Promise((resolve) => {
    render();

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const onKeypress = (key) => {
      // Ctrl+C
      if (key === '\x03') {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', onKeypress);
        process.stdout.write('\x1b[2J\x1b[H');
        process.exit(0);
      }

      // Enter - save and exit
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onKeypress);
        process.stdout.write('\x1b[2J\x1b[H');

        // Save configuration
        const newConfig = {};
        items.forEach((item) => {
          newConfig[item.key] = item.currentValue;
        });
        setDisplayConfig(newConfig);

        console.log('✅ Display settings saved!');
        console.log('');
        console.log('Current settings:');
        items.forEach((item) => {
          console.log(`   ${item.label}: ${getOptionLabel(item)}`);
        });
        console.log('');

        resolve();
        return;
      }

      // Space - toggle current option
      if (key === ' ') {
        cycleOption(items[selectedIndex]);
        render();
        return;
      }

      // Arrow keys
      if (key === '\x1b[A' || key === 'k') {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        render();
      } else if (key === '\x1b[B' || key === 'j') {
        selectedIndex = (selectedIndex + 1) % items.length;
        render();
      }
    };

    process.stdin.on('data', onKeypress);
  });
}

/**
 * Configure API credentials interactively
 * @returns {Promise<boolean>} true if configured successfully, false if cancelled
 */
async function configureApi() {
  const current = getApiConfig();

  if (current.apiUrl || current.apiKey) {
    console.log('Current configuration:');
    console.log(`  API URL: ${current.apiUrl || '(not set)'}`);
    console.log(
      `  API Key: ${
        current.apiKey ? current.apiKey.slice(0, 10) + '...' : '(not set)'
      }`,
    );
    console.log('');
  }

  const apiUrl = await prompt('Enter CRS API URL: ');
  if (!apiUrl) {
    console.log('Cancelled.');
    return false;
  }

  const apiKey = await prompt('Enter CRS API Key: ');
  if (!apiKey) {
    console.log('Cancelled.');
    return false;
  }

  setApiConfig(apiUrl, apiKey);

  console.log('');
  console.log('✅ Configuration saved!');
  console.log(`   Config file: ${CONFIG_FILE}`);
  return true;
}

async function config() {
  const choice = await selectMenu('CRS StatusLine Configuration', [
    { label: 'Display Settings', value: 'display' },
    { label: 'API Settings', value: 'api' },
  ]);

  if (choice === 'display') {
    await configureDisplay();
  } else if (choice === 'api') {
    await configureApi();
  }
}

function formatDisplayOptionLabel(value) {
  if (value === DisplayOption.AUTO) return 'Auto';
  if (value === DisplayOption.ENABLE) return 'Enable';
  if (value === DisplayOption.DISABLE) return 'Disable';
  return value ? 'Enable' : 'Disable';
}

function showConfig() {
  const apiConfig = getApiConfig();
  const displayConfig = getDisplayConfig();

  console.log('CRS StatusLine Configuration');
  console.log('============================');
  console.log('');
  console.log('API Settings:');
  console.log(`  API URL: ${apiConfig.apiUrl || '(not set)'}`);
  console.log(
    `  API Key: ${
      apiConfig.apiKey ? apiConfig.apiKey.slice(0, 10) + '...' : '(not set)'
    }`,
  );
  console.log('');
  console.log('Display Settings:');
  console.log(
    `  Show Daily Usage: ${formatDisplayOptionLabel(
      displayConfig.showDailyUsage,
    )}`,
  );
  console.log(
    `  Show Monthly Usage: ${formatDisplayOptionLabel(
      displayConfig.showMonthlyUsage,
    )}`,
  );
  console.log(
    `  Show Total Usage: ${formatDisplayOptionLabel(
      displayConfig.showTotalUsage,
    )}`,
  );
  console.log(
    `  Use Colors: ${displayConfig.useColors ? 'Enable' : 'Disable'}`,
  );
  console.log('');
  console.log(`Config file: ${CONFIG_FILE}`);
}

function showHelp() {
  console.log(`
crs-statusline - Claude Relay Service StatusLine for Claude Code

Usage:
  crs-statusline install     Install the status line to Claude Code
  crs-statusline uninstall   Remove the status line from Claude Code
  crs-statusline config      Configure CRS API URL and Key
  crs-statusline config show Show current configuration
  crs-statusline help        Show this help message

Description:
  This tool displays Claude Relay Service account usage information
  in the Claude Code status line.

Configuration:
  Before using the status line, you need to configure your CRS API
  credentials using 'crs-statusline config'.

  You can also set environment variables:
    CRS_API_URL - CRS API base URL
    CRS_API_KEY - CRS API key
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];

(async () => {
  switch (command) {
    case 'install':
      await install();
      break;
    case 'uninstall':
      uninstall();
      break;
    case 'config':
      if (subCommand === 'show') {
        showConfig();
      } else {
        await config();
      }
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      if (command) {
        console.error(`Unknown command: ${command}`);
        console.log('');
      }
      showHelp();
      process.exit(command ? 1 : 0);
  }
})();
