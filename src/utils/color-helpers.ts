/**
 * Color Helper Functions
 * Utilities for working with colors and color templates
 */

import type { ColorTemplate, AppliedColorTemplate, ColorTemplateName } from '../types';
import { COLOR_TEMPLATES, DEFAULT_ENTITY_OFF_COLORS } from '../constants';

/**
 * Get a color template by name
 */
export function getColorTemplate(name: ColorTemplateName | string): ColorTemplate | undefined {
	return COLOR_TEMPLATES[name as ColorTemplateName];
}

/**
 * Apply a color template with optional overrides
 */
export function applyColorTemplate(
	templateName: string | undefined,
	overrides?: Partial<ColorTemplate>
): AppliedColorTemplate {
	let result: AppliedColorTemplate = { ...DEFAULT_ENTITY_OFF_COLORS };

	if (templateName && COLOR_TEMPLATES[templateName as ColorTemplateName]) {
		result = { ...result, ...COLOR_TEMPLATES[templateName as ColorTemplateName] };
	}

	if (overrides) {
		if (overrides.icon_color) result.icon_color = overrides.icon_color;
		if (overrides.background_color) result.background_color = overrides.background_color;
		if (overrides.text_color) result.text_color = overrides.text_color;
	}

	return result;
}

/**
 * Convert an RGB array to a CSS rgb string
 */
export function rgbArrayToString(rgb: [number, number, number]): string {
	return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/**
 * Convert an RGB array to a CSS rgba string with alpha
 */
export function rgbArrayToRgba(rgb: [number, number, number], alpha: number): string {
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Get light colors from RGB values (for use_light_color feature)
 */
export function getLightColors(rgb: [number, number, number]): {
	iconColor: string;
	backgroundColor: string;
} {
	return {
		iconColor: rgbArrayToString(rgb),
		backgroundColor: rgbArrayToRgba(rgb, 0.2),
	};
}

/**
 * Apply card-level template and get colors
 */
export function applyCardTemplate(
	templateName: string | undefined,
	iconColorOverride?: string,
	backgroundColorOverride?: string
): AppliedColorTemplate {
	if (templateName && COLOR_TEMPLATES[templateName as ColorTemplateName]) {
		const template = COLOR_TEMPLATES[templateName as ColorTemplateName];
		return {
			background_color: backgroundColorOverride?.trim() || template.background_color,
			icon_color: iconColorOverride?.trim() || template.icon_color,
			text_color: template.text_color,
		};
	}

	return {
		background_color: backgroundColorOverride || 'var(--accent-color)',
		icon_color: iconColorOverride || 'rgb(var(--rgb-white))',
		text_color: 'var(--primary-text-color)',
	};
}
