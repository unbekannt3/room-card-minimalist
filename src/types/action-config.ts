/**
 * Action Configuration Types
 * Types for tap, hold, and double-tap actions
 */

// Action types supported by Home Assistant
export type ActionType =
	| 'none'
	| 'toggle'
	| 'more-info'
	| 'navigate'
	| 'url'
	| 'call-service'
	| 'perform-action'
	| 'fire-dom-event'
	| 'assist';

// Base action config interface
export interface BaseActionConfig {
	action: ActionType;
	confirmation?: ConfirmationConfig;
}

// Confirmation dialog config
export interface ConfirmationConfig {
	text?: string;
	exemptions?: { user: string }[];
}

// No action
export interface NoActionConfig extends BaseActionConfig {
	action: 'none';
}

// Toggle action
export interface ToggleActionConfig extends BaseActionConfig {
	action: 'toggle';
}

// More info action
export interface MoreInfoActionConfig extends BaseActionConfig {
	action: 'more-info';
}

// Navigate action
export interface NavigateActionConfig extends BaseActionConfig {
	action: 'navigate';
	navigation_path: string;
	navigation_replace?: boolean;
}

// URL action
export interface UrlActionConfig extends BaseActionConfig {
	action: 'url';
	url_path: string;
}

// Call service action
export interface CallServiceActionConfig extends BaseActionConfig {
	action: 'call-service';
	service: string;
	service_data?: Record<string, unknown>;
	data?: Record<string, unknown>;
	target?: {
		entity_id?: string | string[];
		device_id?: string | string[];
		area_id?: string | string[];
	};
}

// Perform action (newer name for call-service)
export interface PerformActionConfig extends BaseActionConfig {
	action: 'perform-action';
	perform_action: string;
	data?: Record<string, unknown>;
	target?: {
		entity_id?: string | string[];
		device_id?: string | string[];
		area_id?: string | string[];
	};
}

// Fire DOM event action
export interface FireDomEventActionConfig extends BaseActionConfig {
	action: 'fire-dom-event';
	browser_mod?: Record<string, unknown>;
	[key: string]: unknown;
}

// Assist action
export interface AssistActionConfig extends BaseActionConfig {
	action: 'assist';
	pipeline_id?: string;
	start_listening?: boolean;
}

// Union type for all action configs
export type ActionConfig =
	| NoActionConfig
	| ToggleActionConfig
	| MoreInfoActionConfig
	| NavigateActionConfig
	| UrlActionConfig
	| CallServiceActionConfig
	| PerformActionConfig
	| FireDomEventActionConfig
	| AssistActionConfig;

// Interface for items that can have actions
export interface ActionsConfig {
	entity?: string;
	tap_action?: ActionConfig;
	hold_action?: ActionConfig;
	double_tap_action?: ActionConfig;
}

// Type guard helpers
export function isCallServiceAction(action: ActionConfig): action is CallServiceActionConfig {
	return action.action === 'call-service';
}

export function isNavigateAction(action: ActionConfig): action is NavigateActionConfig {
	return action.action === 'navigate';
}

export function isUrlAction(action: ActionConfig): action is UrlActionConfig {
	return action.action === 'url';
}
