/**
 * Localization Functions
 * i18n helpers for the card
 */

import type { HomeAssistant, SelectOption } from '../types';
import type { Translations, SupportedLanguage } from './types';
import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';

// Translation dictionary
const translations: Record<string, Translations> = {
	en: enTranslations as Translations,
	de: deTranslations as Translations,
};

/**
 * Get the current language from Home Assistant
 */
function getLanguage(hass: HomeAssistant | undefined): string {
	return hass?.locale?.language || hass?.language || 'en';
}

/**
 * Localize a string key
 * @param hass - Home Assistant instance
 * @param key - Translation key (supports dot notation for nested keys like 'colors.blue')
 * @param fallback - Fallback value if key not found
 */
export function localize(
	hass: HomeAssistant | undefined,
	key: string,
	fallback: string = key
): string {
	if (!hass) {
		return fallback;
	}

	const lang = getLanguage(hass);
	const langTranslations = translations[lang] || translations['en'] || {};

	// Support nested keys like 'colors.blue'
	if (key.includes('.')) {
		const keys = key.split('.');
		let value: unknown = langTranslations;
		for (const k of keys) {
			value = (value as Record<string, unknown>)?.[k];
			if (value === undefined) break;
		}
		return (value as string) || fallback;
	}

	const result = (langTranslations as unknown as Record<string, unknown>)[key];
	return (result as string) || fallback;
}

/**
 * Get color template options for select dropdowns
 */
export function getColorTemplateOptions(hass: HomeAssistant | undefined): SelectOption[] {
	const lang = getLanguage(hass);
	const langTranslations = translations[lang] || translations['en'] || {};
	const colors = langTranslations.colors || {};

	return [
		{ label: localize(hass, 'card_template_none', 'None'), value: 'none' },
		...Object.entries(colors).map(([key, label]) => ({
			label: label as string,
			value: key,
		})),
	];
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): SupportedLanguage[] {
	return Object.keys(translations) as SupportedLanguage[];
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(lang: string): lang is SupportedLanguage {
	return lang in translations;
}
