# crs-claude-code-statusline

Claude Code StatusLine for displaying [Claude Relay Service](https://github.com/Wei-Shaw/claude-relay-service) (CRS) account usage information.

![screenshot](screenshot.png)

## Installation

```bash
npm install -g crs-claude-code-statusline
```

## Usage

### Install StatusLine

Run the following command to install the status line to Claude Code:

```bash
crs-statusline install
```

Then restart Claude Code to see the status line.

### Uninstall StatusLine

To remove the status line from Claude Code:

```bash
crs-statusline uninstall
```

### Help

```bash
crs-statusline help
```

## Configuration

Before using the status line, you need to configure your CRS API credentials.

It will be automatically asked during installation, so generally there's no need to manually run configuration commands.

### Interactive Configuration

Run the configuration wizard:

```bash
crs-statusline config
```

This opens an interactive menu where you can choose:

- **Display Settings**: Configure what information to show
- **API Settings**: Configure CRS API credentials

Use arrow keys to navigate, Enter to confirm.

Configuration is saved to `~/.crs-statusline/config.json`.

### Display Settings

Demo:

```
Used credit: 10.1% ($8.7/$30.0) | Daily: $8.7, 10.1M | Monthly: $12.1, 13.1M | Total: $15.4, 16.5M
```

You can customize what information to show:

| Option             | Values                  | Default | Description                                                                                                                              |
| ------------------ | ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Show Used Credit   | Enable / Disable        | Enable  | Shows the most constrained limit (smallest remaining) with percentage and used/limit amount. Displays "Unlimited" when no limits are set |
| Show Daily Usage   | Auto / Enable / Disable | Auto    | Show daily cost and tokens                                                                                                               |
| Show Monthly Usage | Auto / Enable / Disable | Auto    | Show monthly cost and tokens                                                                                                             |
| Show Total Usage   | Auto / Enable / Disable | Auto    | Show total cost and tokens                                                                                                               |
| Use Colors         | Enable / Disable        | Enable  | Use colored output                                                                                                                       |

- **Auto**: Show usage when there's a limit set, or when "Used credit" is enabled
- **Enable**: Always show
- **Disable**: Never show

If all usage options are disabled (or set to Auto with no limits), nothing will be displayed.

#### Used Credit Behavior

When "Used credit" is enabled, the other limit information will be hidden (only usage is displayed).

#### Color Behavior

Color changes based on the higher usage percentage (daily or total):

- **Green**: Usage below 70%
- **Yellow**: Usage between 70-90%
- **Red**: Usage above 90%

When colors are disabled, the status line uses gray color.

### API Settings

Configure your CRS API credentials:

- **CRS API URL**: Your Claude Relay Service API base URL
- **CRS API Key**: Your CRS API key

### Environment Variables

You can also configure API credentials via environment variables:

```bash
export CRS_API_URL="https://your-crs-api-url.com"
export CRS_API_KEY="your-api-key"
```

> **Note**: Environment variables take priority over the config file.

### View Current Configuration

```bash
crs-statusline config show
```

## License

MIT
