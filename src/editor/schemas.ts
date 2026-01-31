/**
 * Editor Schema Generators
 * Schema generation functions for the visual editor forms
 */

import type {
	HomeAssistant,
	RoomCardConfig,
	RoomCardConfigWithLegacy,
	BackgroundType,
	EntityConfig,
	Schema,
	SchemaItem,
	HvacMode,
	SelectOption,
} from '../types';

import { localize, getColorTemplateOptions } from '../localize/localize';
import {
	isLightEntityConfig,
	isClimateEntityConfig,
	getClimateHvacModes,
	parseCustomStates,
} from '../utils/entity-helpers';

import { hasMultiStatePreset, getMultiStatePreset } from '../constants/multi-state-presets';

/**
 * Context for schema generation functions
 */
export interface SchemaContext {
	hass: HomeAssistant | undefined;
	config?: RoomCardConfig;
}

/**
 * Get available state options for multi-state selector
 * Returns options from HVAC modes (for climate) or presets (for other entities)
 */
function getAvailableStateOptions(
	ctx: SchemaContext,
	entityId: string | undefined,
	isClimate: boolean
): SelectOption[] {
	let states: string[] = [];

	if (isClimate && entityId) {
		// Get HVAC modes from entity attributes
		states = getClimateHvacModes(ctx.hass, entityId);
	} else if (entityId) {
		// Get preset states for the entity domain
		states = getMultiStatePreset(entityId);
	}

	// Convert to SelectOption format with nice labels
	return states.map((state) => ({
		value: state,
		label: state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' '),
	}));
}

/**
 * Get custom multi-state schema for entity
 * Creates expandable sections for each custom state defined
 */
export function getCustomMultiStateSchema(ctx: SchemaContext, item: EntityConfig): SchemaItem[] {
	if (item.type !== 'entity') {
		return [];
	}

	const customStates = (item as EntityConfig & { custom_states?: string }).custom_states;
	if (!customStates || customStates.trim() === '') {
		return [];
	}

	const states = parseCustomStates(customStates);

	if (states.length === 0) {
		return [];
	}

	const schema: SchemaItem[] = [];

	states.forEach((state) => {
		const stateLabel = state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');

		schema.push({
			type: 'expandable',
			expanded: false,
			name: '',
			title: `${stateLabel}`,
			schema: [
				{
					name: `icon_${state}`,
					label: `Icon`,
					selector: { icon: {} },
					context: { icon_entity: 'entity' },
				},
				{
					name: `template_${state}`,
					label: localize(ctx.hass, 'card_template', 'Template'),
					selector: {
						select: {
							multiple: false,
							mode: 'dropdown',
							options: getColorTemplateOptions(ctx.hass) as SelectOption[],
						},
					},
				},
				{
					type: 'grid',
					name: '',
					schema: [
						{
							name: `color_${state}`,
							label: localize(ctx.hass, 'icon_color', 'Color'),
							selector: { text: {} },
						},
						{
							name: `background_color_${state}`,
							label: localize(ctx.hass, 'background_circle_color', 'Background'),
							selector: { text: {} },
						},
					],
				},
			],
		});
	});

	return schema;
}

/**
 * Get schema for climate entity configuration
 * Creates expandable sections for each available HVAC mode
 */
export function getClimateEntitySchema(ctx: SchemaContext, item: EntityConfig): SchemaItem[] {
	if (item.type !== 'entity') {
		return [];
	}

	const entityId = (item as EntityConfig & { entity?: string }).entity;
	const hvacModes = getClimateHvacModes(ctx.hass, entityId) as HvacMode[];

	if (hvacModes.length === 0) {
		// Fallback to regular on_state if no HVAC modes available
		return [
			{
				name: 'on_state',
				label: 'On State',
				required: true,
				selector: { text: {} },
			},
		];
	}

	const schema: SchemaItem[] = [];

	// Create configuration fields for each HVAC mode
	hvacModes.forEach((mode) => {
		const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1).replace('_', ' ');

		schema.push({
			type: 'expandable',
			expanded: false,
			name: '',
			title: `${modeLabel} Mode`,
			schema: [
				{
					type: 'grid',
					name: '',
					schema: [
						{
							name: `color_${mode}`,
							label: `Color for ${modeLabel}`,
							selector: { text: {} },
						},
						{
							name: `background_color_${mode}`,
							label: `${localize(ctx.hass, 'background_color_for', 'Background Color for')} ${modeLabel}`,
							selector: { text: {} },
						},
					],
				},
				{
					type: 'grid',
					name: '',
					schema: [
						{
							name: `template_${mode}`,
							label: `Template for ${modeLabel}`,
							selector: {
								select: {
									multiple: false,
									mode: 'dropdown',
									options: getColorTemplateOptions(ctx.hass) as SelectOption[],
								},
							},
						},
					],
				},
			],
		});
	});

	return schema;
}

/**
 * Get schema for entity configuration form
 * Builds the complete schema for a single entity configuration
 */
export function getEntitySchema(ctx: SchemaContext, item: EntityConfig): Schema {
	// For the editor UI, show multi-state fields when toggle is enabled (even if custom_states is empty)
	// This differs from isMultiStateEntityConfig which requires non-empty custom_states for runtime
	const isMultiStateEnabled =
		item.type === 'entity' &&
		(item as EntityConfig & { use_multi_state?: boolean }).use_multi_state === true;
	const isClimate = isClimateEntityConfig(item);

	let baseSchema: SchemaItem[] = [
		{
			name: 'type',
			label: localize(ctx.hass, 'state_type', 'State Type'),
			selector: {
				select: {
					multiple: false,
					mode: 'dropdown',
					options: [
						{
							label: localize(ctx.hass, 'entity_type_entity', 'Entity'),
							value: 'entity',
						},
						{
							label: localize(ctx.hass, 'entity_type_template', 'Template'),
							value: 'template',
						},
					],
				},
			},
		},
		// Icon fields - different layout for multi-state vs regular entities
		...(isMultiStateEnabled
			? [
					{
						name: 'icon',
						label: localize(ctx.hass, 'icon_fallback', 'Icon (Fallback)'),
						required: true,
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
				]
			: [
					{
						type: 'grid' as const,
						name: '',
						schema: [
							{
								name: 'icon',
								label: localize(ctx.hass, 'icon_on', 'Icon (On)'),
								required: true,
								selector: { icon: {} },
								context: { icon_entity: 'entity' },
							},
							{
								name: 'icon_off',
								label: localize(ctx.hass, 'icon_off', 'Icon (Off)'),
								selector: { icon: {} },
								context: { icon_entity: 'entity' },
							},
						],
					},
				]),
		// Only show color/template fields for non-climate and non-multi-state entities
		...(isClimate || isMultiStateEnabled
			? []
			: ([
					{
						type: 'grid' as const,
						name: '',
						schema: [
							{
								name: 'color_on',
								label: localize(ctx.hass, 'color_on', 'Color (On)'),
								selector: { text: {} },
							},
							{
								name: 'color_off',
								label: localize(ctx.hass, 'color_off', 'Color (Off)'),
								selector: { text: {} },
							},
						],
					},
					{
						type: 'grid' as const,
						name: '',
						schema: [
							{
								name: 'template_on',
								label: localize(ctx.hass, 'template_on', 'Template (On)'),
								selector: {
									select: {
										multiple: false,
										mode: 'dropdown',
										options: getColorTemplateOptions(
											ctx.hass
										) as SelectOption[],
									},
								},
							},
							{
								name: 'template_off',
								label: localize(ctx.hass, 'template_off', 'Template (Off)'),
								selector: {
									select: {
										multiple: false,
										mode: 'dropdown',
										options: getColorTemplateOptions(
											ctx.hass
										) as SelectOption[],
									},
								},
							},
						],
					},
					{
						type: 'grid' as const,
						name: '',
						schema: [
							{
								name: 'background_color_on',
								label: localize(
									ctx.hass,
									'background_color_on',
									'Background Color (On)'
								),
								selector: { text: {} },
							},
							{
								name: 'background_color_off',
								label: localize(
									ctx.hass,
									'background_color_off',
									'Background Color (Off)'
								),
								selector: { text: {} },
							},
						],
					},
				] as SchemaItem[])),
		// Show Value fields
		{
			name: 'show_value',
			label: localize(ctx.hass, 'show_value', 'Show Value'),
			selector: { boolean: {} },
		},
		...(item.show_value
			? ([
					{
						name: 'value_template',
						label: localize(ctx.hass, 'value_template', 'Value Template'),
						selector: { template: {} },
					},
				] as SchemaItem[])
			: []),
		{
			type: 'grid' as const,
			name: '',
			schema: [
				{
					name: 'tap_action',
					label:
						ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.tap_action') ||
						'Tap Action',
					selector: { 'ui-action': {} },
				},
				{
					name: 'hold_action',
					label:
						ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.hold_action') ||
						'Hold Action',
					selector: { 'ui-action': {} },
				},
			],
		},
		...(isLightEntityConfig(item)
			? ([
					{
						name: 'use_light_color',
						label: localize(
							ctx.hass,
							'use_light_color_description',
							'Use Light Color as icon and background color'
						),
						selector: { boolean: {} },
					},
				] as SchemaItem[])
			: []),
	];

	const templateSchema: SchemaItem[] = [
		{
			type: 'grid',
			name: '',
			schema: [
				{
					name: 'condition',
					label: localize(ctx.hass, 'template_condition', 'Template Condition'),
					required: true,
					selector: { template: {} },
				},
			],
		},
	];

	// Check if entity domain supports multi-state (including climate)
	const entityId =
		item.type === 'entity' ? (item as EntityConfig & { entity?: string }).entity : undefined;
	const entityDomain = entityId ? entityId.split('.')[0] : '';
	const supportsMultiState = isClimate || hasMultiStatePreset(entityDomain);

	const entitySchema: SchemaItem[] = [
		{
			name: 'entity',
			label: localize(ctx.hass, 'entity_type_entity', 'Entity'),
			required: true,
			selector: { entity: {} },
		},
		// Multi-state toggle (show for climate and entities with multi-state presets)
		...(supportsMultiState
			? ([
					{
						name: 'use_multi_state',
						label: localize(
							ctx.hass,
							'use_multi_state_description',
							'Enable Multi-State Mode for custom state colors'
						),
						selector: { boolean: {} },
					},
				] as SchemaItem[])
			: []),
		// Show on_state only for non-climate and non-multi-state entities
		...(isClimate || isMultiStateEnabled
			? []
			: ([
					{
						name: 'on_state',
						label: localize(ctx.hass, 'on_state', 'On State'),
						required: true,
						selector: { text: {} },
					},
				] as SchemaItem[])),
		// Multi-state custom states field (shown when multi-state is enabled)
		...(isMultiStateEnabled
			? ([
					{
						name: 'custom_states',
						label: localize(ctx.hass, 'add_state', 'Add State'),
						helper: localize(
							ctx.hass,
							'custom_states_helper',
							'Select states to configure individual colors and icons'
						),
						selector: {
							select: {
								multiple: true,
								custom_value: true,
								mode: 'list',
								options: getAvailableStateOptions(ctx, entityId, isClimate),
							},
						},
					},
				] as SchemaItem[])
			: []),
		// Legacy climate entity schema (only when multi-state is NOT enabled)
		...(isClimate && !isMultiStateEnabled ? getClimateEntitySchema(ctx, item) : []),
		// Multi-state schema (dynamic fields for each state - unified for all entity types)
		...(isMultiStateEnabled ? getCustomMultiStateSchema(ctx, item) : []),
	];

	if (item.type === 'template') {
		baseSchema.push(...templateSchema);
	}

	if (item.type === 'entity') {
		baseSchema.push(...entitySchema);
	}

	// Only expand if completely new/empty (no icon set yet)
	const isNew = !item.icon;
	return [
		{
			type: 'expandable',
			expanded: isNew,
			name: '',
			title: `${localize(ctx.hass, 'state_label', 'State')}: ${localize(ctx.hass, `entity_type_${item.type}`, item.type)}`,
			schema: baseSchema,
		},
	];
}

/**
 * Get schema for background configuration based on background_type
 */
export function getBackgroundSchema(ctx: SchemaContext): SchemaItem[] {
	let backgroundType = ctx.config?.background_type;

	// Migration logic for editor
	if (!backgroundType || backgroundType === ('' as BackgroundType)) {
		if ((ctx.config as RoomCardConfigWithLegacy)?.use_background_image === true) {
			if (ctx.config?.background_person_entity) {
				backgroundType = 'person';
			} else if (ctx.config?.background_image) {
				backgroundType = 'image';
			} else {
				backgroundType = 'color';
			}
		} else {
			backgroundType = 'color';
		}
	}

	// Icon color field - shown for 'none' and 'color' background types
	const iconColorField: SchemaItem = {
		name: 'icon_color',
		label: localize(ctx.hass, 'icon_color', 'Icon Color'),
		selector: { template: {} },
	};

	switch (backgroundType) {
		case 'none':
			return [iconColorField];

		case 'color':
			return [
				iconColorField,
				{
					name: 'background_circle_color',
					label: localize(
						ctx.hass,
						'background_circle_color_template_hint',
						'Background Circle Color - empty for template color'
					),
					selector: { template: {} },
				},
			];

		case 'image':
			return [
				{
					name: 'background_image',
					label: localize(ctx.hass, 'background_image', 'Background Image'),
					selector: { text: {} },
				},
				{
					name: 'background_image_square',
					label: localize(ctx.hass, 'background_image_square', 'Square Background'),
					selector: { boolean: {} },
				},
			];

		case 'person':
			return [
				{
					name: 'background_person_entity',
					label: localize(ctx.hass, 'background_person_entity', 'Person Entity'),
					required: true,
					selector: { entity: { domain: 'person' } },
				},
				{
					name: 'background_image_square',
					label: localize(ctx.hass, 'background_image_square', 'Square Background'),
					selector: { boolean: {} },
				},
			];

		default:
			// Fallback to old color circle schema
			return [
				iconColorField,
				{
					name: 'background_circle_color',
					label: localize(
						ctx.hass,
						'background_circle_color_template_hint',
						'Background Circle Color - empty for template color'
					),
					selector: { template: {} },
				},
			];
	}
}

/**
 * Get the main card configuration schema
 */
export function getMainSchema(ctx: SchemaContext): Schema {
	// Expand secondary/tertiary sections if they have values configured
	const hasSecondary = !!ctx.config?.secondary;
	const hasTertiary = !!ctx.config?.tertiary;

	return [
		{
			name: 'name',
			label: ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.name') || 'Name',
			required: true,
			selector: { text: {} },
		},
		{
			name: 'icon',
			label: ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.icon') || 'Icon',
			required: true,
			selector: { icon: {} },
			context: { icon_entity: 'entity' },
		},
		{
			name: 'card_template',
			label: localize(ctx.hass, 'card_template', 'Card Color Template'),
			selector: {
				select: {
					multiple: false,
					mode: 'dropdown',
					options: getColorTemplateOptions(ctx.hass) as SelectOption[],
				},
			},
		},
		{
			name: 'tap_action',
			label:
				ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.tap_action') ||
				'Tap Action',
			selector: { 'ui-action': {} },
		},
		{
			name: 'hold_action',
			label:
				ctx.hass?.localize?.('ui.panel.lovelace.editor.card.generic.hold_action') ||
				'Hold Action',
			selector: { 'ui-action': {} },
		},
		{
			name: 'use_template_color_for_title',
			label: localize(
				ctx.hass,
				'use_template_color_for_title',
				'Use template color for Name'
			),
			selector: { boolean: {} },
		},
		// Secondary Info - Expandable Section
		{
			type: 'expandable',
			expanded: hasSecondary,
			name: '',
			title: localize(ctx.hass, 'secondary', 'Secondary Info'),
			schema: [
				{
					name: 'secondary',
					label: localize(ctx.hass, 'secondary', 'Secondary Info'),
					selector: { template: {} },
				},
				{
					name: 'secondary_color',
					label: localize(ctx.hass, 'secondary_color', 'Secondary Info Color'),
					selector: { template: {} },
				},
				{
					name: 'use_template_color_for_secondary',
					label: localize(
						ctx.hass,
						'use_template_color_for_secondary',
						'Use template color for secondary info'
					),
					selector: { boolean: {} },
				},
				{
					name: 'secondary_allow_html',
					label: localize(
						ctx.hass,
						'secondary_allow_html',
						'Allow HTML in secondary info'
					),
					selector: { boolean: {} },
				},
				{
					name: 'secondary_entity',
					label: localize(
						ctx.hass,
						'secondary_entity',
						'Secondary Info Entity (for actions)'
					),
					selector: { entity: {} },
				},
				{
					type: 'grid',
					name: '',
					schema: [
						{
							name: 'secondary_tap_action',
							label: `${localize(ctx.hass, 'secondary', 'Secondary')} ${
								ctx.hass?.localize?.(
									'ui.panel.lovelace.editor.card.generic.tap_action'
								) || 'Tap Action'
							}`,
							selector: { 'ui-action': {} },
						},
						{
							name: 'secondary_hold_action',
							label: `${localize(ctx.hass, 'secondary', 'Secondary')} ${
								ctx.hass?.localize?.(
									'ui.panel.lovelace.editor.card.generic.hold_action'
								) || 'Hold Action'
							}`,
							selector: { 'ui-action': {} },
						},
					],
				},
			],
		},
		// Tertiary Info - Expandable Section
		{
			type: 'expandable',
			expanded: hasTertiary,
			name: '',
			title: localize(ctx.hass, 'tertiary', 'Tertiary Info'),
			schema: [
				{
					name: 'tertiary',
					label: localize(ctx.hass, 'tertiary', 'Tertiary Info'),
					selector: { template: {} },
				},
				{
					name: 'tertiary_color',
					label: localize(ctx.hass, 'tertiary_color', 'Tertiary Info Color'),
					selector: { template: {} },
				},
				{
					name: 'use_template_color_for_tertiary',
					label: localize(
						ctx.hass,
						'use_template_color_for_tertiary',
						'Use template color for tertiary info'
					),
					selector: { boolean: {} },
				},
				{
					name: 'tertiary_allow_html',
					label: localize(ctx.hass, 'tertiary_allow_html', 'Allow HTML in tertiary info'),
					selector: { boolean: {} },
				},
				{
					name: 'tertiary_entity',
					label: localize(
						ctx.hass,
						'tertiary_entity',
						'Tertiary Info Entity (for actions)'
					),
					selector: { entity: {} },
				},
				{
					type: 'grid',
					name: '',
					schema: [
						{
							name: 'tertiary_tap_action',
							label: `${localize(ctx.hass, 'tertiary', 'Tertiary')} ${
								ctx.hass?.localize?.(
									'ui.panel.lovelace.editor.card.generic.tap_action'
								) || 'Tap Action'
							}`,
							selector: { 'ui-action': {} },
						},
						{
							name: 'tertiary_hold_action',
							label: `${localize(ctx.hass, 'tertiary', 'Tertiary')} ${
								ctx.hass?.localize?.(
									'ui.panel.lovelace.editor.card.generic.hold_action'
								) || 'Hold Action'
							}`,
							selector: { 'ui-action': {} },
						},
					],
				},
			],
		},
		// Background - Expandable Section
		{
			type: 'expandable',
			expanded: false,
			name: '',
			title: localize(ctx.hass, 'card_icon_image', 'Card Icon/Image'),
			schema: [
				{
					name: 'background_type',
					label: localize(ctx.hass, 'background_type', 'Background Type'),
					selector: {
						select: {
							multiple: false,
							mode: 'dropdown',
							options: [
								{
									value: 'none',
									label: localize(
										ctx.hass,
										'background_type_none',
										'No Background'
									),
								},
								{
									value: 'color',
									label: localize(
										ctx.hass,
										'background_type_color',
										'Color Circle'
									),
								},
								{
									value: 'image',
									label: localize(
										ctx.hass,
										'background_type_image',
										'Custom Image'
									),
								},
								{
									value: 'person',
									label: localize(
										ctx.hass,
										'background_type_person',
										'Person Profile Picture'
									),
								},
							],
						},
					},
				},
				...getBackgroundSchema(ctx),
			],
		},
		{
			name: 'entities_reverse_order',
			label: localize(ctx.hass, 'entities_reverse_order', 'Reverse Entity Order'),
			selector: { boolean: {} },
		},
	];
}
