/**
 * Action Service
 * Handles tap, hold, and double-tap actions
 */

import type { ActionConfig, ActionsConfig, EntityConfig } from '../types';
import { isToggleableDomain } from '../constants';

/**
 * Get the default action for an entity or config
 */
export function getDefaultAction(config: ActionsConfig): ActionConfig {
	// If no entity type info, use more-info
	const entityConfig = config as EntityConfig;
	if (!entityConfig.type) {
		return config.tap_action || { action: 'more-info' };
	}

	// For entity type with an entity ID
	if (entityConfig.type === 'entity' && 'entity' in entityConfig && entityConfig.entity) {
		const domain = entityConfig.entity.split('.')[0];
		if (isToggleableDomain(domain)) {
			return {
				action: 'call-service',
				service: `${domain}.toggle`,
				target: { entity_id: entityConfig.entity },
			};
		}
	}

	return { action: 'more-info' };
}

/**
 * Check if a config has any clickable action
 */
export function isClickable(config: ActionsConfig | undefined): boolean {
	if (!config) return false;

	const hasTapAction = config.tap_action?.action && config.tap_action.action !== 'none';
	const hasHoldAction = config.hold_action?.action && config.hold_action.action !== 'none';
	const hasDoubleTapAction =
		config.double_tap_action?.action && config.double_tap_action.action !== 'none';

	return Boolean(hasTapAction || hasHoldAction || hasDoubleTapAction);
}

/**
 * Check if an entity item should be clickable
 */
export function isEntityItemClickable(item: EntityConfig): boolean {
	if (!item) return false;

	// Check explicit actions
	if (isClickable(item)) return true;

	// Check for default action (entity type only)
	if (item.type === 'entity' && 'entity' in item && item.entity) {
		const defaultAction = getDefaultAction(item);
		return defaultAction.action !== 'none';
	}

	return false;
}

/**
 * Fire a Home Assistant action event
 */
export function handleAction(
	element: HTMLElement,
	config: ActionsConfig,
	action: 'tap' | 'hold' | 'double_tap'
): void {
	const actionConfig = {
		entity: config.entity,
		tap_action: config.tap_action || getDefaultAction(config),
		hold_action: config.hold_action,
		double_tap_action: config.double_tap_action,
	};

	const event = new CustomEvent('hass-action', {
		bubbles: true,
		composed: true,
		detail: {
			config: actionConfig,
			action: action,
		},
	});

	element.dispatchEvent(event);
}
