/**
 * Template Helper Functions
 * Utilities for working with Jinja2 templates
 */

/**
 * Check if a value contains Jinja2 template syntax
 * Templates are identified by containing curly braces
 */
export function isTemplate(value: string | undefined | null): boolean {
	if (!value || typeof value !== 'string') return false;
	return value.includes('{');
}

/**
 * Check if a value is a raw (non-template) value
 */
export function isRawValue(value: string | undefined | null): boolean {
	return !isTemplate(value);
}

/**
 * Check if a string is a valid entity ID
 */
export function isEntityId(value: string | undefined | null): boolean {
	if (!value || typeof value !== 'string') return false;
	return /^[a-z_]+\.[a-z0-9_]+$/.test(value);
}
