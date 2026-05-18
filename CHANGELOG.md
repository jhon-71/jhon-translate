# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2026-05-18
### Added
- **SVG / Mermaid Translation Support**: The extension can now seamlessly translate SVG text nodes (`<text>`, `<tspan>`) by appending native SVG elements instead of HTML wrappers, fixing translation failures on Mermaid graphs and data visualizations.
- **ForeignObject Support**: SVG `foreignObject` containers now get `overflow: visible` during translation to prevent HTML text clipping.

### Fixed
- **Div/Span Text Recognition**: Broadened the block selector list to include `div`, `label`, `legend`, `dt`, `dd`, etc., solving cases where text inside plain `div` layouts (like `div.meta` or `div.legend`) was entirely skipped.
- **Container Overflow Prevention**: Implemented an `isLeafBlock` check to ensure the extension translates leaf-level text containers and prevents accidentally translating entire structural HTML parents (like `#app` or global wrappers).
