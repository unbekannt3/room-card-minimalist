import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';

const translations = {
	en: enTranslations,
	de: deTranslations,
};

export function localize(hass, key, fallback = key) {
	if (!hass || !hass.locale) {
		return fallback;
	}

	const lang = hass.locale.language || hass.language || 'en';
	const langTranslations = translations[lang] || translations['en'] || {};

	// Support nested keys like 'colors.blue'
	if (key.includes('.')) {
		const keys = key.split('.');
		let value = langTranslations;
		for (const k of keys) {
			value = value?.[k];
			if (value === undefined) break;
		}
		return value || fallback;
	}

	return langTranslations[key] || fallback;
}

export function getColorTemplateOptions(hass) {
	const lang = hass?.locale?.language || hass?.language || 'en';
	const langTranslations = translations[lang] || translations['en'] || {};
	const colors = langTranslations.colors || {};

	return [
		{ label: localize(hass, 'card_template_none', 'None'), value: 'none' },
		...Object.entries(colors).map(([key, label]) => ({
			label,
			value: key,
		})),
	];
}

export function getAvailableLanguages() {
	return Object.keys(translations);
}
