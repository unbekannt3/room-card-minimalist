/**
 * Editor Schema Types
 * Types for ha-form schema definitions used in the visual editor
 */

// Selector types supported by ha-form
export interface TextSelector {
	text: {
		multiline?: boolean;
		type?:
			| 'text'
			| 'password'
			| 'email'
			| 'url'
			| 'number'
			| 'search'
			| 'tel'
			| 'date'
			| 'time';
		suffix?: string;
		autocomplete?: string;
	};
}

export interface NumberSelector {
	number: {
		min?: number;
		max?: number;
		step?: number;
		mode?: 'box' | 'slider';
		unit_of_measurement?: string;
	};
}

export interface BooleanSelector {
	boolean: Record<string, never>;
}

export interface EntitySelector {
	entity: {
		domain?: string | string[];
		device_class?: string | string[];
		integration?: string;
		multiple?: boolean;
	};
}

export interface IconSelector {
	icon: {
		placeholder?: string;
	};
}

export interface SelectOption {
	label: string;
	value: string;
}

export interface SelectSelector {
	select: {
		multiple?: boolean;
		mode?: 'dropdown' | 'list';
		options: SelectOption[] | string[];
		custom_value?: boolean;
		sort?: boolean;
	};
}

export interface TemplateSelector {
	template: Record<string, never>;
}

export interface UiActionSelector {
	'ui-action': {
		default_action?: string;
	};
}

export interface ColorSelector {
	color_rgb: Record<string, never>;
}

// Union of all selectors
export type Selector =
	| TextSelector
	| NumberSelector
	| BooleanSelector
	| EntitySelector
	| IconSelector
	| SelectSelector
	| TemplateSelector
	| UiActionSelector
	| ColorSelector
	| { [key: string]: unknown };

// Base schema item
export interface BaseSchemaItem {
	name: string;
	label?: string;
	helper?: string;
	required?: boolean;
	disabled?: boolean;
	context?: Record<string, string>;
}

// Standard schema item with selector
export interface SelectorSchemaItem extends BaseSchemaItem {
	selector: Selector;
}

// Grid schema item (arranges children in a grid)
export interface GridSchemaItem {
	type: 'grid';
	name: string;
	schema: SchemaItem[];
}

// Expandable schema item (collapsible section)
export interface ExpandableSchemaItem {
	type: 'expandable';
	name: string;
	title: string;
	expanded?: boolean;
	schema: SchemaItem[];
}

// Union type for all schema items
export type SchemaItem = SelectorSchemaItem | GridSchemaItem | ExpandableSchemaItem;

// Schema array type
export type Schema = SchemaItem[];

// Helper to create a grid schema
export function createGridSchema(name: string, children: SchemaItem[]): GridSchemaItem {
	return {
		type: 'grid',
		name,
		schema: children,
	};
}

// Helper to create an expandable schema
export function createExpandableSchema(
	name: string,
	title: string,
	children: SchemaItem[],
	expanded = false
): ExpandableSchemaItem {
	return {
		type: 'expandable',
		name,
		title,
		expanded,
		schema: children,
	};
}

// Helper to create a selector schema item
export function createSelectorSchema(
	name: string,
	label: string,
	selector: Selector,
	options?: Partial<BaseSchemaItem>
): SelectorSchemaItem {
	return {
		name,
		label,
		selector,
		...options,
	};
}
