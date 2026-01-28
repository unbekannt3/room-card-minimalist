/**
 * Localization Types
 * Type definitions for the i18n system
 */

// Supported language codes
export type SupportedLanguage = 'en' | 'de';

// Color translations
export interface ColorTranslations {
	blue: string;
	lightblue: string;
	red: string;
	green: string;
	lightgreen: string;
	yellow: string;
	purple: string;
	orange: string;
	pink: string;
	grey: string;
	teal: string;
	indigo: string;
}

// All available translation keys
export interface Translations {
	show_value: string;
	value_template: string;
	use_multi_state: string;
	use_multi_state_description: string;
	custom_states: string;
	custom_states_hint: string;
	card_template: string;
	card_template_none: string;
	card_icon_image: string;
	background_type: string;
	background_type_none: string;
	background_type_color: string;
	background_type_image: string;
	background_type_person: string;
	background_circle_color: string;
	background_image: string;
	background_image_square: string;
	background_person_entity: string;
	use_template_color_for_title: string;
	use_template_color_for_secondary: string;
	use_template_color_for_tertiary: string;
	secondary_allow_html: string;
	tertiary: string;
	tertiary_color: string;
	tertiary_entity: string;
	tertiary_allow_html: string;
	entities_reverse_order: string;
	secondary: string;
	secondary_color: string;
	secondary_entity: string;
	icon_color: string;
	add_entity: string;
	move_up: string;
	move_down: string;
	delete: string;
	entity_type: string;
	entity_type_entity: string;
	entity_type_template: string;
	condition: string;
	icon_on: string;
	icon_off: string;
	icon_fallback: string;
	on_state: string;
	template_on: string;
	template_off: string;
	color_on: string;
	color_off: string;
	background_color_on: string;
	background_color_off: string;
	use_light_color: string;
	states: string;
	add_state: string;
	state_type: string;
	maximum_states_reached: string;
	template_condition: string;
	state_label: string;
	use_light_color_description: string;
	background_color_for: string;
	background_circle_color_template_hint: string;
	colors: ColorTranslations;
}

// Translation dictionary type
export type TranslationDictionary = Record<SupportedLanguage, Translations>;
