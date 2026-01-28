/**
 * Event Helper Functions
 * Utilities for DOM events and Home Assistant actions
 */

import type { ActionConfig, EntityConfig, ActionsConfig } from '../types';
import { HOLD_TIMEOUT_MS, isToggleableDomain } from '../constants';

/**
 * Fire a custom DOM event
 */
export function fireEvent<T>(
	node: HTMLElement,
	type: string,
	detail?: T,
	options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean }
): CustomEvent<T> {
	const opts = options || {};
	const event = new CustomEvent<T>(type, {
		bubbles: opts.bubbles ?? true,
		cancelable: opts.cancelable ?? false,
		composed: opts.composed ?? true,
		detail: detail ?? ({} as T),
	});
	node.dispatchEvent(event);
	return event;
}

/**
 * Fire a Home Assistant action event
 */
export function fireHassAction(
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

/**
 * Get the default action for an entity config
 */
export function getDefaultAction(config: ActionsConfig): ActionConfig {
	if (!config.entity) {
		return config.tap_action || { action: 'more-info' };
	}

	const domain = config.entity.split('.')[0];
	if (isToggleableDomain(domain)) {
		return {
			action: 'call-service',
			service: `${domain}.toggle`,
			target: { entity_id: config.entity },
		};
	}

	return { action: 'more-info' };
}

/**
 * Check if an actions config has any clickable action
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
 * Hold timer interface
 */
export interface HoldTimer {
	start: (callback: () => void) => void;
	clear: () => void;
	fired: boolean;
}

/**
 * Create a hold timer for long-press detection
 */
export function createHoldTimer(): HoldTimer {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let fired = false;

	return {
		get fired() {
			return fired;
		},
		start(callback: () => void) {
			this.clear();
			fired = false;
			timeout = setTimeout(() => {
				fired = true;
				callback();
			}, HOLD_TIMEOUT_MS);
		},
		clear() {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
		},
	};
}
