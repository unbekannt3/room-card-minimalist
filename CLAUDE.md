# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Room Card Minimalist is a custom Home Assistant Lovelace card built with Lit (Web Components framework). It displays room information in a minimalist style inspired by UI Lovelace Minimalist. The card shows a room name, icon, optional secondary info, and up to 4 entity/template state indicators.

## Build Commands

```bash
npm install              # Install dependencies
npm run build            # Production build → dist/room-card-minimalist.js
npm run build:dev        # Development build (unminified, with console logs)
npm run watch            # Dev server at localhost:8080 with live reload
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without changes
```

## Development Workflow

1. Start webpack dev server: `npm run watch`
2. Start local Home Assistant: `npm run docker:start`
3. Access HA at localhost:8123
4. Add resource URL: `http://localhost:8080/room-card-minimalist.js` (type: JavaScript Module)
5. Stop HA when done: `npm run docker:stop`

## Architecture

### Source Files (`src/`)

- **index.js** - Entry point, imports both card components
- **room-card-minimalist.js** - Main card component (`<room-card-minimalist>`)
  - Renders the room card UI with icon, name, secondary info, and entity states
  - Handles tap/hold actions via Home Assistant's `hass-action` event system
  - Subscribes to HA template rendering for dynamic values
  - `COLOR_TEMPLATES` object defines the 12 built-in color schemes
- **room-card-minimalist-editor.js** - Visual editor component (`<room-card-minimalist-editor>`)
  - Renders the card configuration UI using `ha-form`
  - Handles drag-and-drop reordering of entities
  - Dispatches `config-changed` events to save configuration
- **localize/localize.js** - i18n helper with locale JSON files in `locales/`

### Key Patterns

**Template Detection**: Values containing `{` are treated as Jinja2 templates and subscribed via `render_template` WebSocket messages to Home Assistant.

**Entity Types**: State indicators support two types:
- `entity` - Monitors a HA entity state, compares against `on_state`
- `template` - Evaluates a condition template, non-empty = on

**Climate Entities**: Special handling for `climate.*` entities with HVAC mode-specific styling (heat, cool, auto, etc.) instead of simple on/off states.

**Config Migration**: Both the card and editor migrate old config properties (`use_background_image`, `show_background_circle`) to the unified `background_type` system.

### Build System

Webpack bundles to a single JS file. Babel transpiles for browser compatibility. `babel-plugin-template-html-minifier` minifies Lit templates. Production builds drop console logs and minify via Terser.

## Commit Convention

Uses conventional commits enforced by commitlint. Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
