# crs-claude-code-statusline

Claude Code StatusLine for displaying [Claude Relay Service](https://github.com/Wei-Shaw/claude-relay-service) (CRS) account usage information.

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

| Option             | Values                  | Default | Description                  |
| ------------------ | ----------------------- | ------- | ---------------------------- |
| Show Daily Usage   | Auto / Enable / Disable | Auto    | Show daily cost and tokens   |
| Show Monthly Usage | Auto / Enable / Disable | Auto    | Show monthly cost and tokens |
| Show Total Usage   | Auto / Enable / Disable | Auto    | Show total cost              |
| Use Colors         | Enable / Disable        | Enable  | Use colored output           |

- **Auto**: Only show usage when there's a limit set
- **Enable**: Always show
- **Disable**: Never show

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

## What it shows

The status line displays your CRS account usage:

```
Daily: $8.7/$30.0, 10.1M | Monthly: $12.1, 13.1M | Total: $15.4/∞
```

- **Daily**: Daily cost used/limit and tokens consumed
- **Monthly**: Monthly cost and tokens consumed
- **Total**: Total cost used/limit

If all usage options are disabled (or set to Auto with no limits), nothing will be displayed.

Color changes based on the higher usage percentage (daily or total):

- **Green**: Usage below 70%
- **Yellow**: Usage between 70-90%
- **Red**: Usage above 90%

## License

MIT
