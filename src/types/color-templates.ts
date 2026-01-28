/**
 * Color Template Types
 * Types for the built-in color schemes
 */

// Available color template names
export type ColorTemplateName =
	| 'blue'
	| 'lightblue'
	| 'red'
	| 'green'
	| 'lightgreen'
	| 'yellow'
	| 'purple'
	| 'orange'
	| 'pink'
	| 'grey'
	| 'teal'
	| 'indigo';

// Color template structure
export interface ColorTemplate {
	icon_color: string;
	background_color: string;
	text_color: string;
}

// Applied color template (with overrides applied)
export interface AppliedColorTemplate {
	icon_color: string;
	background_color: string;
	text_color: string;
}

// Record type for color templates collection
export type ColorTemplates = Record<ColorTemplateName, ColorTemplate>;

// Type guard to check if a string is a valid color template name
export function isColorTemplateName(name: string): name is ColorTemplateName {
	const validNames: ColorTemplateName[] = [
		'blue',
		'lightblue',
		'red',
		'green',
		'lightgreen',
		'yellow',
		'purple',
		'orange',
		'pink',
		'grey',
		'teal',
		'indigo',
	];
	return validNames.includes(name as ColorTemplateName);
}
