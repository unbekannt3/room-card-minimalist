/**
 * Constants Index
 * Barrel export for all constants
 */

export { COLOR_TEMPLATES, getColorTemplateNames, getRandomColorTemplate } from './color-templates';

export {
	MULTI_STATE_PRESETS,
	getMultiStatePreset,
	hasMultiStatePreset,
	getMultiStatePresetDomains,
} from './multi-state-presets';

export {
	DEFAULT_COLORS,
	DEFAULT_ENTITY_OFF_COLORS,
	HOLD_TIMEOUT_MS,
	DOUBLE_TAP_TIMEOUT_MS,
	DEFAULT_DOUBLE_TAP_ACTION,
	MAX_ENTITIES,
	TOGGLEABLE_DOMAINS,
	DOMAIN_ICONS,
	isToggleableDomain,
	getDomainIcon,
} from './defaults';
export type { ToggleableDomain } from './defaults';
