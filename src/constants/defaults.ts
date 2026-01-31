/**
 * Default Values
 * Default configuration values and CSS custom property defaults
 */

import type { AppliedColorTemplate } from '../types';

/**
 * Default colors when no template is applied
 */
export const DEFAULT_COLORS: AppliedColorTemplate = {
	icon_color: 'rgb(var(--rgb-white))',
	background_color: 'var(--accent-color)',
	text_color: 'var(--primary-text-color)',
};

/**
 * Default colors for entity items in off state
 */
export const DEFAULT_ENTITY_OFF_COLORS: AppliedColorTemplate = {
	icon_color: 'var(--primary-text-color)',
	background_color: 'var(--secondary-background-color)',
	text_color: 'var(--primary-text-color)',
};

/**
 * Hold timeout duration in milliseconds
 */
export const HOLD_TIMEOUT_MS = 500;

/**
 * Maximum number of entities that can be displayed
 */
export const MAX_ENTITIES = 4;

/**
 * Domains that support toggle action by default
 */
export const TOGGLEABLE_DOMAINS = [
	'light',
	'switch',
	'fan',
	'automation',
	'script',
	'input_boolean',
] as const;

export type ToggleableDomain = (typeof TOGGLEABLE_DOMAINS)[number];

/**
 * Check if a domain supports toggle action
 */
export function isToggleableDomain(domain: string): domain is ToggleableDomain {
	return TOGGLEABLE_DOMAINS.includes(domain as ToggleableDomain);
}

/**
 * Domain icons for fallback when entity doesn't have an icon
 */
export const DOMAIN_ICONS: Record<string, string> = {
	light: 'mdi:lightbulb',
	switch: 'mdi:toggle-switch',
	fan: 'mdi:fan',
	climate: 'mdi:thermostat',
	cover: 'mdi:window-shutter',
	lock: 'mdi:lock',
	sensor: 'mdi:gauge',
	binary_sensor: 'mdi:checkbox-marked-circle',
	camera: 'mdi:camera',
	media_player: 'mdi:speaker',
	automation: 'mdi:robot',
	script: 'mdi:script-text',
	scene: 'mdi:palette',
	vacuum: 'mdi:robot-vacuum',
	humidifier: 'mdi:air-humidifier',
	water_heater: 'mdi:water-boiler',
	alarm_control_panel: 'mdi:shield-home',
};

/**
 * Get the default icon for a domain
 */
export function getDomainIcon(domain: string): string {
	return DOMAIN_ICONS[domain] || 'mdi:help-circle';
}
