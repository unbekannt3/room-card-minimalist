/**
 * Card Configuration Types
 * Main configuration interface for Room Card Minimalist
 */

import type { ActionConfig, ActionsConfig } from './action-config';
import type { ColorTemplateName } from './color-templates';
import type { EntityConfig } from './entity-config';

// Background type options
export type BackgroundType = 'none' | 'color' | 'image' | 'person';

// Legacy config properties (for migration)
export interface LegacyConfigProperties {
	use_background_image?: boolean;
	show_background_circle?: boolean;
	background_settings?: unknown;
	// Legacy template naming (plural)
	templates_on?: string | string[];
	templates_off?: string | string[];
}

// Main card configuration interface
export interface RoomCardConfig extends ActionsConfig {
	type: 'custom:room-card-minimalist';
	// Required fields
	name: string;
	icon: string;
	// Optional card-level settings
	card_template?: ColorTemplateName | 'none';
	icon_color?: string;
	background_circle_color?: string;
	// Secondary info
	secondary?: string;
	secondary_color?: string;
	secondary_entity?: string;
	secondary_tap_action?: ActionConfig;
	secondary_hold_action?: ActionConfig;
	secondary_double_tap_action?: ActionConfig;
	secondary_allow_html?: boolean;
	// Tertiary info
	tertiary?: string;
	tertiary_color?: string;
	tertiary_entity?: string;
	tertiary_tap_action?: ActionConfig;
	tertiary_hold_action?: ActionConfig;
	tertiary_double_tap_action?: ActionConfig;
	tertiary_allow_html?: boolean;
	// Background settings
	background_type?: BackgroundType;
	background_image?: string;
	background_person_entity?: string;
	background_image_square?: boolean;
	// Entity states (max 4)
	entities?: EntityConfig[];
	entities_reverse_order?: boolean;
	// Color options
	use_template_color_for_title?: boolean;
	use_template_color_for_secondary?: boolean;
	use_template_color_for_tertiary?: boolean;
	// Card actions
	tap_action?: ActionConfig;
	hold_action?: ActionConfig;
	double_tap_action?: ActionConfig;
}

// Config with legacy properties (used during migration)
export interface RoomCardConfigWithLegacy extends RoomCardConfig, LegacyConfigProperties {}

// Internal config with defaults applied
export interface RoomCardInternalConfig extends RoomCardConfig {
	secondary: string;
	secondary_color: string;
	secondary_entity: string;
	tertiary: string;
	tertiary_color: string;
	tertiary_entity: string;
	entities: EntityConfig[];
	background_type: BackgroundType;
	background_image: string;
	background_person_entity: string;
	background_image_square: boolean;
	entities_reverse_order: boolean;
	use_template_color_for_title: boolean;
	use_template_color_for_secondary: boolean;
	use_template_color_for_tertiary: boolean;
	secondary_allow_html: boolean;
	tertiary_allow_html: boolean;
}

// Default card config values
export const DEFAULT_CARD_CONFIG: Omit<RoomCardInternalConfig, 'type' | 'name' | 'icon'> = {
	secondary: '',
	secondary_color: 'var(--secondary-text-color)',
	secondary_entity: '',
	tertiary: '',
	tertiary_color: 'var(--secondary-text-color)',
	tertiary_entity: '',
	entities: [],
	background_type: 'color',
	background_image: '',
	background_person_entity: '',
	background_image_square: false,
	entities_reverse_order: false,
	use_template_color_for_title: false,
	use_template_color_for_secondary: false,
	use_template_color_for_tertiary: false,
	secondary_allow_html: false,
	tertiary_allow_html: false,
};

// Type guard to check if config needs migration
export function needsMigration(config: RoomCardConfigWithLegacy): boolean {
	return (
		config.use_background_image !== undefined ||
		config.show_background_circle !== undefined ||
		config.background_settings !== undefined
	);
}

// Validate required config fields
export function validateConfig(config: unknown): asserts config is RoomCardConfig {
	if (!config || typeof config !== 'object') {
		throw new Error('Invalid configuration');
	}
	const c = config as Record<string, unknown>;
	if (!c.name || typeof c.name !== 'string') {
		throw new Error('You need to define a name for the room');
	}
	if (!c.icon || typeof c.icon !== 'string') {
		throw new Error('You need to define an Icon for the room');
	}
}
