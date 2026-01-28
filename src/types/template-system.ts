/**
 * Template System Types
 * Types for Jinja2 template subscription and rendering
 */

import type { HomeAssistant } from './home-assistant';
import type { RoomCardInternalConfig } from './card-config';

// Template render result from Home Assistant
export interface TemplateResult {
	result: string | number | boolean | null;
	listeners?: {
		all?: boolean;
		domains?: string[];
		entities?: string[];
		time?: boolean;
	};
}

// Map of template strings to their results
export interface TemplateResults {
	[template: string]: TemplateResult | undefined;
}

// Subscription parameters for render_template
export interface TemplateSubscribeParams {
	template: string;
	variables?: {
		config?: RoomCardInternalConfig;
		user?: string;
		entity?: unknown;
	};
	strict?: boolean;
}

// Template subscription map
export type TemplateSubscriptions = Map<string, Promise<() => void>>;

// Template service interface
export interface ITemplateService {
	setHass(hass: HomeAssistant): void;
	setConfig(config: RoomCardInternalConfig): void;
	subscribe(template: string): Promise<void>;
	unsubscribe(template: string): Promise<void>;
	unsubscribeAll(): Promise<void>;
	getResult(template: string): string | undefined;
	getValue(value: string): string | undefined;
	get results(): TemplateResults;
}

// Callback type for template updates
export type TemplateUpdateCallback = (results: TemplateResults) => void;

// Helper to check if a value is a Jinja2 template
export function isTemplate(value: string | undefined | null): boolean {
	if (!value || typeof value !== 'string') return false;
	return value.includes('{');
}

// Helper to check if a value is a raw (non-template) value
export function isRawValue(value: string | undefined | null): boolean {
	return !isTemplate(value);
}

// Extract the string result from a template result
export function getTemplateResultString(result: TemplateResult | undefined): string | undefined {
	if (!result) return undefined;
	if (result.result === null || result.result === undefined) return undefined;
	return String(result.result);
}
