/**
 * Entity Configuration Types
 * Types for state indicator entities in the card
 */

import type { ActionConfig, ActionsConfig } from './action-config';
import type { ColorTemplateName } from './color-templates';
import type { HvacMode } from './home-assistant';

// Entity type discriminator
export type EntityType = 'entity' | 'template';

// Base entity configuration (common to all entity types)
export interface BaseEntityConfig extends ActionsConfig {
	type: EntityType;
	icon: string;
	icon_off?: string;
	tap_action?: ActionConfig;
	hold_action?: ActionConfig;
	double_tap_action?: ActionConfig;
}

// Standard entity configuration (monitors a Home Assistant entity)
export interface StandardEntityConfig extends BaseEntityConfig {
	type: 'entity';
	entity: string;
	on_state?: string;
	use_light_color?: boolean;
	use_multi_state?: boolean;
	custom_states?: string;
	template_on?: ColorTemplateName;
	template_off?: ColorTemplateName;
	color_on?: string;
	color_off?: string;
	background_color_on?: string;
	background_color_off?: string;
	// Dynamic properties for HVAC modes and multi-state (indexed access)
	[key: `template_${string}`]: ColorTemplateName | undefined;
	[key: `color_${string}`]: string | undefined;
	[key: `background_color_${string}`]: string | undefined;
	[key: `icon_${string}`]: string | undefined;
}

// Template entity configuration (evaluates a Jinja2 template)
export interface TemplateEntityConfig extends BaseEntityConfig {
	type: 'template';
	condition: string;
	template_on?: ColorTemplateName;
	template_off?: ColorTemplateName;
	color_on?: string;
	color_off?: string;
	background_color_on?: string;
	background_color_off?: string;
}

// Union type for any entity config
export type EntityConfig = StandardEntityConfig | TemplateEntityConfig;

// Climate-specific entity config (extends StandardEntityConfig with HVAC mode properties)
export interface ClimateEntityConfig extends StandardEntityConfig {
	// HVAC mode-specific templates
	template_off?: ColorTemplateName;
	template_heat?: ColorTemplateName;
	template_cool?: ColorTemplateName;
	template_heat_cool?: ColorTemplateName;
	template_auto?: ColorTemplateName;
	template_dry?: ColorTemplateName;
	template_fan_only?: ColorTemplateName;
	// HVAC mode-specific colors
	color_off?: string;
	color_heat?: string;
	color_cool?: string;
	color_heat_cool?: string;
	color_auto?: string;
	color_dry?: string;
	color_fan_only?: string;
	// HVAC mode-specific background colors
	background_color_off?: string;
	background_color_heat?: string;
	background_color_cool?: string;
	background_color_heat_cool?: string;
	background_color_auto?: string;
	background_color_dry?: string;
	background_color_fan_only?: string;
}

// Multi-state entity config (for entities with custom states)
export interface MultiStateEntityConfig extends StandardEntityConfig {
	use_multi_state: true;
	custom_states: string;
}

// Type guards
export function isStandardEntityConfig(config: EntityConfig): config is StandardEntityConfig {
	return config.type === 'entity';
}

export function isTemplateEntityConfig(config: EntityConfig): config is TemplateEntityConfig {
	return config.type === 'template';
}

export function isClimateEntityConfig(config: EntityConfig): config is ClimateEntityConfig {
	return config.type === 'entity' && config.entity?.startsWith('climate.');
}

export function isMultiStateEntityConfig(config: EntityConfig): config is MultiStateEntityConfig {
	return (
		config.type === 'entity' &&
		(config as StandardEntityConfig).use_multi_state === true &&
		Boolean((config as StandardEntityConfig).custom_states?.trim()) &&
		!config.entity?.startsWith('climate.')
	);
}

// Helper to get HVAC mode property names
export function getHvacModePropertyName(
	mode: HvacMode,
	prefix: 'template' | 'color' | 'background_color' | 'icon'
): string {
	return `${prefix}_${mode}`;
}

// Helper to parse custom states string
export function parseCustomStates(customStates: string): string[] {
	if (!customStates) return [];
	return customStates
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s !== '');
}
