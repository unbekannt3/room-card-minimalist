/**
 * Types Index
 * Barrel export for all type definitions
 */

// Home Assistant types
export type {
	HomeAssistant,
	HassConnection,
	HassEntity,
	HassEntities,
	HassUser,
	HassLocale,
	HassEntityAttributeBase,
	LightEntityAttributes,
	ClimateEntityAttributes,
	PersonEntityAttributes,
	HvacMode,
	HvacAction,
} from './home-assistant';
export { isLightEntity, isClimateEntity, isPersonEntity } from './home-assistant';

// Action config types
export type {
	ActionType,
	ActionConfig,
	ActionsConfig,
	BaseActionConfig,
	NoActionConfig,
	ToggleActionConfig,
	MoreInfoActionConfig,
	NavigateActionConfig,
	UrlActionConfig,
	CallServiceActionConfig,
	PerformActionConfig,
	FireDomEventActionConfig,
	AssistActionConfig,
	ConfirmationConfig,
} from './action-config';
export { isCallServiceAction, isNavigateAction, isUrlAction } from './action-config';

// Color template types
export type {
	ColorTemplateName,
	ColorTemplate,
	AppliedColorTemplate,
	ColorTemplates,
} from './color-templates';
export { isColorTemplateName } from './color-templates';

// Entity config types
export type {
	EntityType,
	EntityConfig,
	BaseEntityConfig,
	StandardEntityConfig,
	TemplateEntityConfig,
	ClimateEntityConfig,
	MultiStateEntityConfig,
} from './entity-config';
export {
	isStandardEntityConfig,
	isTemplateEntityConfig,
	isClimateEntityConfig,
	isMultiStateEntityConfig,
	getHvacModePropertyName,
	parseCustomStates,
} from './entity-config';

// Card config types
export type {
	BackgroundType,
	RoomCardConfig,
	RoomCardConfigWithLegacy,
	RoomCardInternalConfig,
	LegacyConfigProperties,
} from './card-config';
export { DEFAULT_CARD_CONFIG, needsMigration, validateConfig } from './card-config';

// Template system types
export type {
	TemplateResult,
	TemplateResults,
	TemplateSubscribeParams,
	TemplateSubscriptions,
	ITemplateService,
	TemplateUpdateCallback,
} from './template-system';
export { isTemplate, isRawValue, getTemplateResultString } from './template-system';

// Editor schema types
export type {
	Schema,
	SchemaItem,
	BaseSchemaItem,
	SelectorSchemaItem,
	GridSchemaItem,
	ExpandableSchemaItem,
	Selector,
	TextSelector,
	NumberSelector,
	BooleanSelector,
	EntitySelector,
	IconSelector,
	SelectSelector,
	TemplateSelector,
	UiActionSelector,
	ColorSelector,
	SelectOption,
} from './editor-schema';
export { createGridSchema, createExpandableSchema, createSelectorSchema } from './editor-schema';
