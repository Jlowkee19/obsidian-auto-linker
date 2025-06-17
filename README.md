# Auto Linker Plugin for Obsidian

Automatically suggests and creates links to matching titles, headings, and blocks as you type in Obsidian.

## Features

- **Smart Link Suggestions**: Get suggestions for note titles, headings, and blocks as you type
- **Multiple Trigger Methods**: 
  - Type `[[` to trigger link suggestions
  - Start typing any text (2+ characters) for auto-suggestions
- **Intelligent Matching**: Finds matches in:
  - Note titles
  - Headings (with proper `#` formatting)  
  - Block references
- **Visual Indicators**: Different icons for notes (📄), headings (#), and blocks (🔗)
- **Keyboard Navigation**: Use arrow keys to navigate suggestions and Enter to select

## Installation

### Manual Installation

1. Download the latest release
2. Extract the files to your Obsidian vault's plugins folder: `VaultName/.obsidian/plugins/auto-linker/`
3. Enable the plugin in Obsidian Settings > Community Plugins

### Development Installation

1. Clone this repository to your plugins folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Enable the plugin in Obsidian

## Usage

### Basic Usage

1. **Using `[[` trigger**: Type `[[` and start typing to see link suggestions
2. **Auto-suggestions**: Simply start typing any word (2+ characters) to see relevant suggestions
3. **Navigation**: Use ↑↓ arrow keys to navigate suggestions
4. **Selection**: Press Enter or click to select a suggestion

### Manual Trigger

Use the command palette (Ctrl/Cmd + P) and search for "Trigger link suggestions" to manually open suggestions.

## Settings

Access plugin settings via Settings > Plugin Options > Auto Linker:

- **Minimum query length**: Set how many characters trigger suggestions (1-5)
- **Maximum suggestions**: Limit the number of suggestions shown (5-20)

## How It Works

The plugin monitors your typing and:

1. Scans all markdown files in your vault
2. Searches for matches in note titles, headings, and blocks
3. Ranks suggestions by relevance (exact matches first)
4. Presents suggestions with visual indicators
5. Creates proper wikilinks when selected

## Development

```bash
# Install dependencies
npm install

# Build for development (with watching)
npm run dev

# Build for production
npm run build
```

## Contributing

Feel free to submit issues and pull requests to improve the plugin.

## License

MIT License