/**
 * Multi-State Presets
 * Predefined state lists for common Home Assistant domains
 */

/**
 * MULTI_STATE_PRESETS provides default state lists for entities
 * that support multiple states beyond simple on/off
 */
export const MULTI_STATE_PRESETS: Record<string, string[]> = {
	vacuum: ['idle', 'cleaning', 'paused', 'returning', 'docked', 'error'],
	alarm_control_panel: [
		'disarmed',
		'armed_home',
		'armed_away',
		'armed_night',
		'triggered',
		'pending',
		'arming',
	],
	media_player: ['off', 'idle', 'playing', 'paused', 'buffering'],
	lock: ['locked', 'unlocked', 'locking', 'unlocking', 'jammed'],
	cover: ['open', 'closed', 'opening', 'closing'],
	fan: ['off', 'on', 'low', 'medium', 'high'],
	humidifier: ['off', 'on', 'humidifying', 'drying'],
	water_heater: ['off', 'eco', 'electric', 'gas', 'heat_pump', 'performance'],
};

/**
 * Get the preset states for a given entity domain
 * @param entityId - The entity ID (e.g., "vacuum.robot")
 * @returns Array of preset state strings, or empty array if no preset exists
 */
export function getMultiStatePreset(entityId: string | undefined): string[] {
	if (!entityId) return [];
	const domain = entityId.split('.')[0];
	return MULTI_STATE_PRESETS[domain] || [];
}

/**
 * Check if a domain has a multi-state preset
 * @param domain - The entity domain (e.g., "vacuum")
 */
export function hasMultiStatePreset(domain: string): boolean {
	return domain in MULTI_STATE_PRESETS;
}

/**
 * Get all domains that have multi-state presets
 */
export function getMultiStatePresetDomains(): string[] {
	return Object.keys(MULTI_STATE_PRESETS);
}
