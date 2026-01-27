/**
 * Color Templates
 * Built-in color schemes for the card
 */

import type { ColorTemplates } from '../types';

/**
 * COLOR_TEMPLATES defines the 12 built-in color schemes
 * Each template provides icon color, background color, and text color
 * Colors use CSS custom properties with RGB fallback values
 */
export const COLOR_TEMPLATES: ColorTemplates = {
	blue: {
		icon_color: 'rgba(var(--color-blue, 61, 90, 254),1)',
		background_color: 'rgba(var(--color-blue, 61, 90, 254), 0.2)',
		text_color: 'rgba(var(--color-blue-text, 61, 90, 254),1)',
	},
	lightblue: {
		icon_color: 'rgba(var(--color-lightblue, 3, 169, 244),1)',
		background_color: 'rgba(var(--color-lightblue, 3, 169, 244), 0.2)',
		text_color: 'rgba(var(--color-lightblue-text, 3, 169, 244),1)',
	},
	red: {
		icon_color: 'rgba(var(--color-red, 245, 68, 54),1)',
		background_color: 'rgba(var(--color-red, 245, 68, 54), 0.2)',
		text_color: 'rgba(var(--color-red-text, 245, 68, 54),1)',
	},
	green: {
		icon_color: 'rgba(var(--color-green, 1, 200, 82),1)',
		background_color: 'rgba(var(--color-green, 1, 200, 82), 0.2)',
		text_color: 'rgba(var(--color-green-text, 1, 200, 82),1)',
	},
	lightgreen: {
		icon_color: 'rgba(var(--color-lightgreen, 139, 195, 74),1)',
		background_color: 'rgba(var(--color-lightgreen, 139, 195, 74), 0.2)',
		text_color: 'rgba(var(--color-lightgreen-text, 139, 195, 74),1)',
	},
	yellow: {
		icon_color: 'rgba(var(--color-yellow, 255, 145, 1),1)',
		background_color: 'rgba(var(--color-yellow, 255, 145, 1), 0.2)',
		text_color: 'rgba(var(--color-yellow-text, 255, 145, 1),1)',
	},
	purple: {
		icon_color: 'rgba(var(--color-purple, 102, 31, 255),1)',
		background_color: 'rgba(var(--color-purple, 102, 31, 255), 0.2)',
		text_color: 'rgba(var(--color-purple-text, 102, 31, 255),1)',
	},
	orange: {
		icon_color: 'rgba(var(--color-orange, 255, 87, 34),1)',
		background_color: 'rgba(var(--color-orange, 255, 87, 34), 0.2)',
		text_color: 'rgba(var(--color-orange-text, 255, 87, 34),1)',
	},
	pink: {
		icon_color: 'rgba(var(--color-pink, 233, 30, 99),1)',
		background_color: 'rgba(var(--color-pink, 233, 30, 99), 0.2)',
		text_color: 'rgba(var(--color-pink-text, 233, 30, 99),1)',
	},
	grey: {
		icon_color: 'rgba(var(--color-grey, 158, 158, 158),1)',
		background_color: 'rgba(var(--color-grey, 158, 158, 158), 0.2)',
		text_color: 'rgba(var(--color-grey-text, 158, 158, 158),1)',
	},
	teal: {
		icon_color: 'rgba(var(--color-teal, 0, 150, 136),1)',
		background_color: 'rgba(var(--color-teal, 0, 150, 136), 0.2)',
		text_color: 'rgba(var(--color-teal-text, 0, 150, 136),1)',
	},
	indigo: {
		icon_color: 'rgba(var(--color-indigo, 63, 81, 181),1)',
		background_color: 'rgba(var(--color-indigo, 63, 81, 181), 0.2)',
		text_color: 'rgba(var(--color-indigo-text, 63, 81, 181),1)',
	},
};

/**
 * Get all available color template names
 */
export function getColorTemplateNames(): string[] {
	return Object.keys(COLOR_TEMPLATES);
}

/**
 * Pick a random color template name
 */
export function getRandomColorTemplate(): string {
	const names = getColorTemplateNames();
	return names[Math.floor(Math.random() * names.length)];
}
