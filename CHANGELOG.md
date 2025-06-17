# Changelog

All notable changes to the Auto Linker Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-06-17

### Changed
- Updated plugin author to Lorenz Soriano
- Fixed auto-linking behavior for block and header references to exclude file title
  - Block references now generate `#^blockId` instead of `filename#^blockId`
  - Header references now generate `#heading` instead of `filename#heading`

### Technical
- Updated manifest.json and package.json author information
- Modified linkText generation in main.ts for cleaner reference links

## [1.0.0] - Initial Release

### Added
- Smart link suggestions for note titles, headings, and blocks
- Multiple trigger methods: `[[` syntax and auto-suggestions while typing
- Visual indicators for different content types (notes, headings, blocks)
- Keyboard navigation support
- Manual trigger command via command palette
- Configurable settings for query length and suggestion limits
- Real-time suggestion ranking by relevance