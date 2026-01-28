/**
 * Entity Helper Functions
 * Utilities for working with Home Assistant entities
 */

import type { HomeAssistant, HassEntity, EntityConfig, StandardEntityConfig } from '../types';

/**
 * Check if an entity ID belongs to a climate entity
 */
export function isClimateEntityId(entityId: string | undefined): boolean {
	return entityId?.startsWith('climate.') ?? false;
}

/**
 * Check if an entity ID belongs to a light entity
 */
export function isLightEntityId(entityId: string | undefined): boolean {
	return entityId?.startsWith('light.') ?? false;
}

/**
 * Get the domain from an entity ID
 */
export function getEntityDomain(entityId: string): string {
	return entityId.split('.')[0];
}

/**
 * Check if an entity config is for a climate entity
 */
export function isClimateEntityConfig(config: EntityConfig): boolean {
	if (config.type !== 'entity') return false;
	return isClimateEntityId((config as StandardEntityConfig).entity);
}

/**
 * Check if an entity config uses multi-state mode
 * Now includes climate entities when use_multi_state is enabled
 */
export function isMultiStateEntityConfig(config: EntityConfig): boolean {
	if (config.type !== 'entity') return false;
	const stdConfig = config as StandardEntityConfig;
	return (
		stdConfig.use_multi_state === true &&
		Boolean(stdConfig.custom_states?.trim())
	);
}

/**
 * Check if an entity config is for a light entity
 */
export function isLightEntityConfig(config: EntityConfig): boolean {
	if (config.type !== 'entity') return false;
	return isLightEntityId((config as StandardEntityConfig).entity);
}

/**
 * Get entity state from Home Assistant
 */
export function getEntityState(
	hass: HomeAssistant | undefined,
	entityId: string | undefined
): HassEntity | undefined {
	if (!hass?.states || !entityId) return undefined;
	return hass.states[entityId];
}

/**
 * Parse comma-separated custom states string
 */
export function parseCustomStates(customStates: string | undefined): string[] {
	if (!customStates) return [];
	return customStates
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s !== '');
}

/**
 * Get the HVAC modes from a climate entity
 */
export function getClimateHvacModes(
	hass: HomeAssistant | undefined,
	entityId: string | undefined
): string[] {
	const entity = getEntityState(hass, entityId);
	if (!entity?.attributes?.hvac_modes) return [];
	return entity.attributes.hvac_modes as string[];
}
