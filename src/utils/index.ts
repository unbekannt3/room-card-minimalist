/**
 * Utils Index
 * Barrel export for all utility functions
 */

export {
	isClimateEntityId,
	isLightEntityId,
	getEntityDomain,
	isClimateEntityConfig,
	isMultiStateEntityConfig,
	isLightEntityConfig,
	getEntityState,
	parseCustomStates,
	getClimateHvacModes,
} from './entity-helpers';

export { isTemplate, isRawValue, isEntityId } from './template-helpers';

export {
	getColorTemplate,
	applyColorTemplate,
	rgbArrayToString,
	rgbArrayToRgba,
	getLightColors,
	applyCardTemplate,
} from './color-helpers';

export {
	fireEvent,
	fireHassAction,
	getDefaultAction,
	isClickable,
	isEntityItemClickable,
	createHoldTimer,
} from './event-helpers';
export type { HoldTimer } from './event-helpers';

export { ActionController, createActionController, bindActionHandlers } from './action-handler';
export type { ActionHandlers, ActionHandlerOptions } from './action-handler';

export {
	isMultiStateItem,
	getEntityStateResult,
	applyEntityTemplates,
	getFinalColors,
	getEntityIcon,
	renderEntityItem,
	renderInvalidEntity,
} from './entity-state-renderer';
export type { EntityStateResult } from './entity-state-renderer';
