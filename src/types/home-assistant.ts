/**
 * Home Assistant Types
 * Core types for interacting with Home Assistant
 */

// Base entity attribute interface
export interface HassEntityAttributeBase {
	friendly_name?: string;
	unit_of_measurement?: string;
	icon?: string;
	entity_picture?: string;
	assumed_state?: boolean;
	supported_features?: number;
	device_class?: string;
	[key: string]: unknown;
}

// Generic entity interface
export interface HassEntity<TAttributes extends HassEntityAttributeBase = HassEntityAttributeBase> {
	entity_id: string;
	state: string;
	attributes: TAttributes;
	last_changed: string;
	last_updated: string;
	context: {
		id: string;
		parent_id?: string;
		user_id?: string;
	};
}

// Dictionary of all entities
export interface HassEntities {
	[entity_id: string]: HassEntity;
}

// Light entity attributes
export interface LightEntityAttributes extends HassEntityAttributeBase {
	rgb_color?: [number, number, number];
	brightness?: number;
	color_mode?: string;
	color_temp?: number;
	hs_color?: [number, number];
	xy_color?: [number, number];
	min_mireds?: number;
	max_mireds?: number;
	effect_list?: string[];
	effect?: string;
}

// Climate entity attributes
export type HvacMode = 'off' | 'heat' | 'cool' | 'heat_cool' | 'auto' | 'dry' | 'fan_only';
export type HvacAction = 'off' | 'heating' | 'cooling' | 'drying' | 'idle' | 'fan';

export interface ClimateEntityAttributes extends HassEntityAttributeBase {
	hvac_modes?: HvacMode[];
	hvac_action?: HvacAction;
	current_temperature?: number;
	target_temp_high?: number;
	target_temp_low?: number;
	temperature?: number;
	min_temp?: number;
	max_temp?: number;
	preset_mode?: string;
	preset_modes?: string[];
	fan_mode?: string;
	fan_modes?: string[];
	swing_mode?: string;
	swing_modes?: string[];
}

// Person entity attributes
export interface PersonEntityAttributes extends HassEntityAttributeBase {
	entity_picture?: string;
	editable?: boolean;
	id?: string;
	user_id?: string;
	device_trackers?: string[];
	source?: string;
	latitude?: number;
	longitude?: number;
	gps_accuracy?: number;
}

// User interface
export interface HassUser {
	id: string;
	is_owner: boolean;
	is_admin: boolean;
	name: string;
	credentials: { auth_provider_type: string; auth_provider_id: string }[];
	mfa_modules: { id: string; name: string; enabled: boolean }[];
}

// Locale settings
export interface HassLocale {
	language: string;
	number_format: string;
	time_format: string;
	date_format?: string;
	first_weekday?: number;
}

// WebSocket connection interface (simplified)
export interface HassConnection {
	subscribeMessage<T>(
		callback: (message: T) => void,
		params: Record<string, unknown>
	): Promise<() => void>;
}

// Main Home Assistant interface
export interface HomeAssistant {
	connection: HassConnection;
	states: HassEntities;
	user?: HassUser;
	locale: HassLocale;
	language: string;
	localize(key: string, replace?: Record<string, string>): string;
	callService(
		domain: string,
		service: string,
		data?: Record<string, unknown>,
		target?: { entity_id?: string | string[] }
	): Promise<void>;
	selectedLanguage?: string;
}

// Type guard for specific entity types
export function isLightEntity(entity: HassEntity): entity is HassEntity<LightEntityAttributes> {
	return entity.entity_id.startsWith('light.');
}

export function isClimateEntity(entity: HassEntity): entity is HassEntity<ClimateEntityAttributes> {
	return entity.entity_id.startsWith('climate.');
}

export function isPersonEntity(entity: HassEntity): entity is HassEntity<PersonEntityAttributes> {
	return entity.entity_id.startsWith('person.');
}
