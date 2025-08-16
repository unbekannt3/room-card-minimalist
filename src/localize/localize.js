let translations = {};
let loadedLanguages = new Set();

async function loadLanguage(lang) {
	if (loadedLanguages.has(lang)) {
		return translations[lang];
	}

	try {
		const module = await import(`./locales/${lang}.json`);
		translations[lang] = module.default || module;
		loadedLanguages.add(lang);
		return translations[lang];
	} catch (error) {
		if (lang !== 'en') {
			return await loadLanguage('en');
		}
		return {};
	}
}

loadLanguage('en');

export function localize(hass, key, fallback = key) {
	if (!hass || !hass.locale) {
		return fallback;
	}

	const lang = hass.locale.language || hass.language || 'en';

	if (!loadedLanguages.has(lang)) {
		loadLanguage(lang).then(() => {
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('language-loaded'));
			}
		});
		return fallback;
	}

	const langTranslations = translations[lang] || translations['en'] || {};
	// Support nested keys like 'colors.blue'
	const value = key.split('.').reduce((obj, k) => obj && obj[k], langTranslations);
	return value || fallback;
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
	return Array.from(loadedLanguages);
}

export async function reloadLanguage(lang) {
	loadedLanguages.delete(lang);
	delete translations[lang];
	return await loadLanguage(lang);
}
