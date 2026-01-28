/**
 * Entity State Renderer
 * Handles rendering of entity state items in the room card
 */

import { html, nothing, TemplateResult } from 'lit';
import type {
	HomeAssistant,
	HassEntity,
	LightEntityAttributes,
	EntityConfig,
	StandardEntityConfig,
	TemplateEntityConfig,
	AppliedColorTemplate,
	ColorTemplateName,
} from '../types';
import { COLOR_TEMPLATES } from '../constants';
import { isClimateEntityId, getEntityState } from './entity-helpers';
import { applyColorTemplate, getLightColors } from './color-helpers';
import { isEntityItemClickable } from '../services';
import type { ActionHandlers } from './action-handler';

/**
 * Result of determining entity state
 */
export interface EntityStateResult {
	stateValue: string | undefined;
	isOn: boolean;
	currentHvacMode: string | null;
	currentEntityState: string | null;
}

/**
 * Check if item uses custom multi-state mode
 */
export function isMultiStateItem(item: EntityConfig): boolean {
	if (item.type !== 'entity') return false;
	const entityItem = item as StandardEntityConfig;
	return (
		entityItem.use_multi_state === true &&
		Boolean(entityItem.custom_states?.trim()) &&
		!isClimateEntityId(entityItem.entity)
	);
}

/**
 * Determine the current state of an entity
 */
export function getEntityStateResult(
	item: EntityConfig,
	hass: HomeAssistant | undefined,
	getValue: (item: string | undefined) => string | undefined
): EntityStateResult {
	let stateValue: string | undefined = '';
	let isOn = false;
	let currentHvacMode: string | null = null;
	let currentEntityState: string | null = null;

	if (item.type === 'entity') {
		const entityItem = item as StandardEntityConfig;
		stateValue = getValue(entityItem.entity);

		// Special handling for climate entities
		if (isClimateEntityId(entityItem.entity)) {
			const entityState = getEntityState(hass, entityItem.entity);
			if (entityState?.state) {
				currentHvacMode = entityState.state;
				isOn = currentHvacMode !== 'off';
			}
		} else if (isMultiStateItem(item)) {
			// Multi-state entity handling
			const entityState = getEntityState(hass, entityItem.entity);
			if (entityState?.state) {
				currentEntityState = entityState.state;
				isOn = currentEntityState !== 'off' && currentEntityState !== 'unavailable';
			}
		} else {
			// Regular entity logic
			isOn = stateValue == entityItem.on_state;
		}
	} else if (item.type === 'template') {
		const templateItem = item as TemplateEntityConfig;
		stateValue = getValue(templateItem.condition);
		isOn = stateValue !== '' && stateValue !== undefined;
	}

	return {
		stateValue,
		isOn,
		currentHvacMode,
		currentEntityState,
	};
}

/**
 * Apply color templates to an entity item based on its state
 */
export function applyEntityTemplates(
	item: EntityConfig,
	state: 'on' | 'off',
	currentHvacMode: string | null = null,
	currentEntityState: string | null = null
): AppliedColorTemplate {
	const standardItem = item as StandardEntityConfig;

	// Handle climate entities with HVAC modes
	if (isClimateEntityId(standardItem.entity) && currentHvacMode) {
		const modeTemplate = standardItem[`template_${currentHvacMode}`] as
			| ColorTemplateName
			| undefined;
		const modeColor = standardItem[`color_${currentHvacMode}`] as string | undefined;
		const modeBackgroundColor = standardItem[`background_color_${currentHvacMode}`] as
			| string
			| undefined;

		return applyColorTemplate(modeTemplate, {
			icon_color: modeColor,
			background_color: modeBackgroundColor,
		});
	}

	// Handle custom multi-state entities
	if (isMultiStateItem(item) && currentEntityState) {
		const stateTemplate = standardItem[`template_${currentEntityState}`] as
			| ColorTemplateName
			| undefined;
		const stateColor = standardItem[`color_${currentEntityState}`] as string | undefined;
		const stateBackgroundColor = standardItem[`background_color_${currentEntityState}`] as
			| string
			| undefined;

		return applyColorTemplate(stateTemplate, {
			icon_color: stateColor,
			background_color: stateBackgroundColor,
		});
	}

	// Support both new (template_on/template_off) and legacy (templates_on/templates_off) naming
	const itemWithLegacy = item as EntityConfig & {
		templates_on?: string | string[];
		templates_off?: string | string[];
	};
	const templates =
		state === 'on'
			? standardItem.template_on || itemWithLegacy.templates_on
			: standardItem.template_off || itemWithLegacy.templates_off;

	let result = applyColorTemplate(undefined);

	if (templates) {
		// Handle both single template (string) and legacy array format
		const templateList = Array.isArray(templates) ? templates : [templates];
		templateList.forEach((template) => {
			if (COLOR_TEMPLATES[template as ColorTemplateName]) {
				result = { ...result, ...COLOR_TEMPLATES[template as ColorTemplateName] };
			}
		});
	}

	// Override with explicit colors if provided
	if (state === 'on') {
		if (standardItem.color_on) result.icon_color = standardItem.color_on;
		if (standardItem.background_color_on)
			result.background_color = standardItem.background_color_on;
	} else {
		if (standardItem.color_off) result.icon_color = standardItem.color_off;
		if (standardItem.background_color_off)
			result.background_color = standardItem.background_color_off;
	}

	return result;
}

/**
 * Get final colors, accounting for light color feature
 */
export function getFinalColors(
	item: EntityConfig,
	isOn: boolean,
	baseColors: AppliedColorTemplate,
	hass: HomeAssistant | undefined
): { iconColor: string; backgroundColor: string } {
	let iconColor = baseColors.icon_color;
	let backgroundColor = baseColors.background_color;

	if (item.type === 'entity') {
		const entityItem = item as StandardEntityConfig;
		if (entityItem.use_light_color && isOn) {
			const entityState = getEntityState(hass, entityItem.entity) as
				| HassEntity<LightEntityAttributes>
				| undefined;
			if (entityState?.attributes?.rgb_color) {
				const lightColors = getLightColors(entityState.attributes.rgb_color);
				iconColor = lightColors.iconColor;
				backgroundColor = lightColors.backgroundColor;
			}
		}
	}

	return { iconColor, backgroundColor };
}

/**
 * Determine which icon to use based on entity state
 */
export function getEntityIcon(
	item: EntityConfig,
	isOn: boolean,
	currentHvacMode: string | null,
	currentEntityState: string | null
): string {
	if (item.type === 'entity') {
		const entityItem = item as StandardEntityConfig;

		if (isClimateEntityId(entityItem.entity) && currentHvacMode) {
			// For climate entities, use icon_off when in "off" mode, otherwise use main icon
			if (currentHvacMode === 'off' && item.icon_off) {
				return item.icon_off;
			}
			return item.icon;
		}

		if (isMultiStateItem(item) && currentEntityState) {
			// For multi-state entities, check for state-specific icon first
			const stateIcon = entityItem[`icon_${currentEntityState}`] as string | undefined;
			if (stateIcon) {
				return stateIcon;
			}
			// Use main icon as fallback for any unknown/unconfigured state
			return item.icon;
		}

		// For regular entities, use on/off logic
		return isOn ? item.icon : item.icon_off || item.icon;
	}

	// Template entities
	return isOn ? item.icon : item.icon_off || item.icon;
}

/**
 * Render an entity state item
 */
export function renderEntityItem(
	item: EntityConfig,
	handlers: ActionHandlers | null,
	iconColor: string,
	backgroundColor: string,
	icon: string,
	isOn: boolean,
	displayValue?: string
): TemplateResult {
	const isClickable = isEntityItemClickable(item);
	const iconClass = !isOn ? 'off' : 'on';
	const hasValue = displayValue !== undefined && displayValue !== '';

	return html`
		<div
			@click=${isClickable ? handlers?.onClick : null}
			@mousedown=${isClickable ? handlers?.onMouseDown : null}
			@mouseup=${isClickable ? handlers?.onMouseUp : null}
			@mouseleave=${isClickable ? handlers?.onMouseLeave : null}
			@touchstart=${isClickable ? handlers?.onTouchStart : null}
			@touchend=${isClickable ? handlers?.onTouchEnd : null}
			@contextmenu=${isClickable ? handlers?.onContextMenu : null}
			tabindex="${isClickable ? '0' : '-1'}"
			class="state-item ${isClickable ? 'clickable' : 'non-clickable'} ${hasValue
				? 'has-value'
				: ''}"
			style="background-color: ${backgroundColor}"
		>
			<ha-icon
				class="state-icon ${iconClass}"
				.icon=${icon}
				style="color: ${iconColor}"
			></ha-icon>
			${hasValue
				? html`<span class="state-value" style="color: ${iconColor}">${displayValue}</span>`
				: nothing}
		</div>
	`;
}

/**
 * Render invalid entity placeholder
 */
export function renderInvalidEntity(hass: HomeAssistant | undefined): TemplateResult {
	const text = hass?.localize?.('ui.card.common.invalid_entity') || 'Invalid Entity';
	return html`<span class="invalid-entity">${text}</span>`;
}
