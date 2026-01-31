/**
 * Config Migration Service
 * Handles migration of legacy configuration formats
 */

import type {
	RoomCardConfig,
	RoomCardConfigWithLegacy,
	RoomCardInternalConfig,
	BackgroundType,
	EntityConfig,
	StandardEntityConfig,
} from '../types';
import { DEFAULT_CARD_CONFIG, validateConfig } from '../types';
import { isClimateEntityId } from '../utils/entity-helpers';

/**
 * Known HVAC modes for climate entity migration
 */
const HVAC_MODES = ['off', 'heat', 'cool', 'heat_cool', 'auto', 'dry', 'fan_only'] as const;

/**
 * Migrate legacy background settings to new background_type system
 */
function migrateBackgroundType(config: RoomCardConfigWithLegacy): BackgroundType {
	// If already has valid background_type, use it
	if (config.background_type) {
		return config.background_type;
	}

	// Migrate from old properties
	if (config.use_background_image === true) {
		if (config.background_person_entity) {
			return 'person';
		} else if (config.background_image) {
			return 'image';
		} else {
			return 'color';
		}
	} else if (config.show_background_circle === false) {
		return 'none';
	}

	return 'color';
}

/**
 * Migrate legacy climate entity to unified multi-state system
 * Detects HVAC mode properties and converts to use_multi_state with custom_states
 */
function migrateClimateEntity(entity: StandardEntityConfig): StandardEntityConfig {
	// Only migrate climate entities
	if (!isClimateEntityId(entity.entity)) {
		return entity;
	}

	// Already using multi-state system
	if (entity.use_multi_state) {
		return entity;
	}

	// Check for any legacy HVAC mode properties
	const foundModes: string[] = [];
	for (const mode of HVAC_MODES) {
		const hasTemplate = entity[`template_${mode}`] !== undefined;
		const hasColor = entity[`color_${mode}`] !== undefined;
		const hasBackgroundColor = entity[`background_color_${mode}`] !== undefined;

		if (hasTemplate || hasColor || hasBackgroundColor) {
			foundModes.push(mode);
		}
	}

	// If no legacy properties found, nothing to migrate
	if (foundModes.length === 0) {
		return entity;
	}

	// Convert to multi-state format
	return {
		...entity,
		use_multi_state: true,
		custom_states: foundModes.join(', '),
	};
}

/**
 * Check if any entity in config needs climate migration
 */
function needsClimateMigration(config: RoomCardConfigWithLegacy): boolean {
	if (!config.entities) return false;

	return config.entities.some((entity) => {
		if (entity.type !== 'entity') return false;
		const stdEntity = entity as StandardEntityConfig;

		// Check if it's a climate entity with legacy HVAC mode properties
		if (!isClimateEntityId(stdEntity.entity)) return false;
		if (stdEntity.use_multi_state) return false;

		// Check for any HVAC mode properties
		for (const mode of HVAC_MODES) {
			if (
				stdEntity[`template_${mode}`] !== undefined ||
				stdEntity[`color_${mode}`] !== undefined ||
				stdEntity[`background_color_${mode}`] !== undefined
			) {
				return true;
			}
		}
		return false;
	});
}

/**
 * Check if config needs migration
 */
export function needsMigration(config: RoomCardConfigWithLegacy): boolean {
	return (
		config.use_background_image !== undefined ||
		config.show_background_circle !== undefined ||
		config.background_settings !== undefined ||
		!config.background_type ||
		needsClimateMigration(config)
	);
}

/**
 * Migrate legacy config to current format
 */
export function migrateConfig(config: RoomCardConfigWithLegacy): RoomCardConfig {
	const migratedBackgroundType = migrateBackgroundType(config);

	// Create new config without legacy properties
	const { use_background_image, show_background_circle, background_settings, ...restConfig } =
		config;

	// Migrate climate entities to unified multi-state system
	const migratedEntities = restConfig.entities?.map((entity) => {
		if (entity.type === 'entity') {
			return migrateClimateEntity(entity as StandardEntityConfig);
		}
		return entity;
	});

	return {
		...restConfig,
		background_type: migratedBackgroundType,
		entities: migratedEntities as EntityConfig[],
	};
}

/**
 * Apply default values to config
 */
export function applyDefaults(config: RoomCardConfig): RoomCardInternalConfig {
	return {
		...DEFAULT_CARD_CONFIG,
		...config,
		secondary: config.secondary ?? DEFAULT_CARD_CONFIG.secondary,
		secondary_color: config.secondary_color ?? DEFAULT_CARD_CONFIG.secondary_color,
		secondary_entity: config.secondary_entity ?? DEFAULT_CARD_CONFIG.secondary_entity,
		entities: config.entities ?? DEFAULT_CARD_CONFIG.entities,
		background_type: config.background_type ?? DEFAULT_CARD_CONFIG.background_type,
		background_image: config.background_image ?? DEFAULT_CARD_CONFIG.background_image,
		background_person_entity:
			config.background_person_entity ?? DEFAULT_CARD_CONFIG.background_person_entity,
		background_image_square:
			config.background_image_square ?? DEFAULT_CARD_CONFIG.background_image_square,
		entities_reverse_order:
			config.entities_reverse_order ?? DEFAULT_CARD_CONFIG.entities_reverse_order,
		use_template_color_for_title:
			config.use_template_color_for_title ?? DEFAULT_CARD_CONFIG.use_template_color_for_title,
		use_template_color_for_secondary:
			config.use_template_color_for_secondary ??
			DEFAULT_CARD_CONFIG.use_template_color_for_secondary,
		secondary_allow_html:
			config.secondary_allow_html ?? DEFAULT_CARD_CONFIG.secondary_allow_html,
	};
}

/**
 * Process config - validate, migrate if needed, and apply defaults
 */
export function processConfig(config: unknown): RoomCardInternalConfig {
	validateConfig(config);

	let processedConfig = config as RoomCardConfigWithLegacy;

	if (needsMigration(processedConfig)) {
		processedConfig = migrateConfig(processedConfig);
	}

	return applyDefaults(processedConfig);
}

/**
 * Clean up config by removing undefined/null values
 */
export function cleanConfig(config: RoomCardConfig): RoomCardConfig {
	const cleaned: Partial<RoomCardConfig> = {
		type: config.type,
		name: config.name,
		icon: config.icon,
	};
	for (const [key, value] of Object.entries(config)) {
		if (value !== undefined && value !== null && value !== '') {
			(cleaned as Record<string, unknown>)[key] = value;
		}
	}
	return cleaned as RoomCardConfig;
}
