# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Room Card Minimalist is a custom Home Assistant Lovelace card built with Lit (Web Components) and TypeScript. It displays room information in a minimalist style with a room name, icon, optional secondary/tertiary info, and up to 4 entity/template state indicators.

## Build Commands

```bash
npm install              # Install dependencies
npm run build            # Production build → dist/room-card-minimalist.js
npm run build:dev        # Development build (unminified, with console logs)
npm run watch            # Dev server at localhost:8080 with live reload
npm run typecheck        # TypeScript type checking
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

### Source Structure (`src/`)

```
src/
├── index.ts                      # Entry point
├── room-card-minimalist.ts       # Main card component
├── room-card-minimalist-editor.ts # Visual editor component
├── types/                        # TypeScript interfaces
├── services/                     # Business logic services
├── utils/                        # Helper functions
├── styles/                       # Lit CSS styles
├── constants/                    # Color templates, defaults
├── editor/                       # Editor-specific schemas
└── localize/                     # i18n system with locale JSON files
```

### Key Components

**Main Card** (`room-card-minimalist.ts`):

- Renders room card UI with icon, name, secondary/tertiary info, entity states
- Uses `TemplateService` for Jinja2 template subscriptions
- Uses `ActionController` for tap/hold event handling

**Editor** (`room-card-minimalist-editor.ts`):

- Renders configuration UI using Home Assistant's `ha-form`
- Handles drag-and-drop entity reordering
- Uses schemas from `editor/schemas.ts`

### Services

- **TemplateService** (`services/template-service.ts`): Manages WebSocket subscriptions to HA's `render_template` for dynamic values
- **ActionService** (`services/action-service.ts`): Handles action configuration and clickability detection
- **ConfigMigration** (`services/config-migration.ts`): Migrates legacy config properties, applies defaults

### Key Patterns

**Template Detection**: Values containing `{` are treated as Jinja2 templates and subscribed via `render_template` WebSocket messages.

**Entity Types**: State indicators support:

- `entity` - Monitors HA entity state, compares against `on_state`
- `template` - Evaluates condition template, non-empty = on

**Climate Entities**: Special handling for `climate.*` with HVAC mode-specific styling (heat, cool, auto, etc.)

**Multi-State Entities**: Support for custom states beyond on/off (e.g., vacuum states: idle, cleaning, paused)

**Config Migration**: Legacy properties (`use_background_image`, `show_background_circle`) are automatically migrated to unified `background_type` system.

### Type System

All types are defined in `src/types/` and re-exported via barrel files:

- `card-config.ts` - Card configuration interfaces, defaults
- `entity-config.ts` - Entity configuration with type guards
- `action-config.ts` - Action types (tap, hold, navigate, etc.)
- `home-assistant.ts` - HA-specific types (entities, attributes)
- `editor-schema.ts` - Editor form schema types

### Localization

Translations in `src/localize/locales/` (en.json, de.json). Type definitions in `localize/types.ts` ensure all keys are defined.

## Commit Convention

Uses conventional commits enforced by commitlint. Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
