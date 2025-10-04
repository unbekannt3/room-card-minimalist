import { LitElement, html, css } from 'lit-element';
import { localize, getColorTemplateOptions } from './localize/localize.js';

class RoomCardEditor extends LitElement {
	constructor() {
		super();
	}

	static get styles() {
		return css`
			:host {
				display: block;
				box-sizing: border-box;
				width: 100%;
				overflow-x: hidden;
			}

			*,
			*::before,
			*::after {
				box-sizing: border-box;
			}

			.box {
				border: 1px solid var(--divider-color);
				border-radius: 8px;
				margin: 8px 0;
				padding: 16px;
				transition: all 0.2s ease;
				background: var(--card-background-color, white);
				box-sizing: border-box;
				width: 100%;
				max-width: 100%;
			}

			.box:hover {
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			}

			.box.drag-over {
				border-color: var(--primary-color);
				background-color: var(--primary-color-fade, rgba(var(--rgb-primary-color), 0.1));
				transform: scale(1.02);
			}

			.entity-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12px;
				padding-bottom: 8px;
				border-bottom: 1px solid var(--divider-color);
			}

			.entity-info {
				display: flex;
				align-items: center;
				gap: 8px;
				flex: 1;
				min-width: 0; /* Allow shrinking */
			}

			.entity-icon {
				color: var(--primary-color);
				--mdc-icon-size: 20px;
				flex-shrink: 0; /* Don't shrink the icon */
			}

			.entity-title {
				font-weight: 500;
				color: var(--primary-text-color);
				font-size: 14px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				min-width: 0; /* Allow shrinking */
			}

			.entity-controls {
				display: flex;
				align-items: center;
				gap: 4px;
				flex-shrink: 0; /* Never shrink the controls */
			}

			.drag-handle {
				color: var(--secondary-text-color);
				cursor: grab;
				padding: 8px;
				border-radius: 4px;
				transition: all 0.2s ease;
				--mdc-icon-size: 20px;
				margin: -4px;
				flex-shrink: 0;
				user-select: none;
			}

			.drag-handle:hover {
				color: var(--primary-color);
				background-color: var(--divider-color);
				cursor: grab;
			}

			.drag-handle:active {
				cursor: grabbing !important;
				color: var(--primary-color);
			}

			.drag-handle[draggable='true']:active {
				cursor: grabbing !important;
			}

			/* Force cursor during drag operation */
			.box.dragging .drag-handle,
			.drag-handle.dragging {
				cursor: grabbing !important;
			}

			/* Global cursor override during drag */
			:host(.dragging) * {
				cursor: grabbing !important;
			}

			.toolbar {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
			}

			/* Ensure forms don't interfere with dragging */
			ha-form {
				pointer-events: auto;
				width: 100%;
			}

			/* Force grid layout to work properly in forms - override HA's responsive behavior */
			ha-form .grid,
			ha-form [data-type='grid'],
			ha-form .form-group.grid {
				display: grid !important;
				grid-template-columns: 1fr 1fr !important;
				gap: 12px !important;
				width: 100% !important;
			}

			/* Ensure individual form elements don't break the grid */
			ha-form .form-group.grid > * {
				min-width: 0 !important;
				width: 100% !important;
			}

			/* Make the boxes more compact to give more space for the form */
			.box {
				padding: 12px !important;
				margin: 6px 0 !important;
			}
		`;
	}

	setConfig(config) {
		// Migrate old config to new background_type system
		let migratedBackgroundType = config.background_type;

		if (!migratedBackgroundType || migratedBackgroundType === '') {
			if (config.use_background_image === true) {
				if (config.background_person_entity) {
					migratedBackgroundType = 'person';
				} else if (config.background_image) {
					migratedBackgroundType = 'image';
				} else {
					migratedBackgroundType = 'color';
				}
			} else if (config.show_background_circle === false) {
				migratedBackgroundType = 'none';
			} else {
				migratedBackgroundType = 'color';
			}
		}

		this._config = {
			background_type: migratedBackgroundType,
			entities: [],
			...config,
		};
		this._currentTab = 0;

		// Clean up old properties
		delete this._config.show_background_circle;
		delete this._config.use_background_image;
		delete this._config.background_settings;

		// If we migrated or cleaned up, dispatch the config change to save the new format
		if (
			migratedBackgroundType !== config.background_type ||
			config.show_background_circle !== undefined ||
			config.use_background_image !== undefined
		) {
			setTimeout(() => {
				this.dispatchEvent(
					new CustomEvent('config-changed', { detail: { config: this._config } })
				);
			}, 0);
		}
	}

	static get properties() {
		return {
			hass: { attribute: false },
			_config: { state: true },
			_backgroundType: { state: true }, // Track background type for reactive schema
		};
	}

	updated(changedProps) {
		super.updated(changedProps);

		// Update background type for reactive schema
		if (changedProps.has('_config') && this._config) {
			const newBackgroundType = this._config.background_type || 'color';
			if (this._backgroundType !== newBackgroundType) {
				this._backgroundType = newBackgroundType;
				// Force re-render of the form
				this.requestUpdate();
			}
		}
	}

	_deleteStateEntity(idx) {
		if (!this._config) return;

		const entities = [...this._config.entities];
		entities.splice(idx, 1);

		this._config = { ...this._config, entities };
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_moveStateEntity(idx, pos) {
		if (!this._config) return;

		const entities = [...this._config.entities];
		[entities[idx], entities[idx + pos]] = [entities[idx + pos], entities[idx]];

		this._config = { ...this._config, entities };
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_addEntityState() {
		if (!this._config) return;

		// Prevent adding more than 4 entities
		if (this._config.entities && this._config.entities.length >= 4) {
			return;
		}

		const entities = [...this._config.entities];
		entities.push({ type: 'template' });

		this._config = { ...this._config, entities };
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_handleDragStart(ev, index) {
		ev.dataTransfer.setData('text/plain', index.toString());
		ev.dataTransfer.effectAllowed = 'move';

		// Create visual feedback and cursor control
		const dragElement = ev.target.closest('.box');
		if (dragElement) {
			dragElement.classList.add('dragging');
		}

		// Add dragging class to handle and host
		ev.target.classList.add('dragging');
		this.classList.add('dragging');

		// Force cursor
		document.body.style.cursor = 'grabbing';
	}

	_handleDragEnd(ev) {
		// Remove all drag classes and reset cursor
		this.shadowRoot.querySelectorAll('.box').forEach((box) => {
			box.classList.remove('dragging', 'drag-over');
		});

		// Remove dragging classes
		this.shadowRoot.querySelectorAll('.drag-handle').forEach((handle) => {
			handle.classList.remove('dragging');
		});

		this.classList.remove('dragging');

		// Reset body cursor
		document.body.style.cursor = '';
	}

	_handleDragOver(ev) {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move';

		// Add visual feedback for drop target
		const dropTarget = ev.target.closest('.box');
		if (dropTarget) {
			dropTarget.classList.add('drag-over');
		}
	}

	_handleDragLeave(ev) {
		const dropTarget = ev.target.closest('.box');
		if (dropTarget) {
			dropTarget.classList.remove('drag-over');
		}
	}

	_handleDrop(ev, dropIndex) {
		ev.preventDefault();

		const dropTarget = ev.target.closest('.box');
		if (dropTarget) {
			dropTarget.classList.remove('drag-over');
		}

		const dragIndex = parseInt(ev.dataTransfer.getData('text/plain'));

		if (dragIndex === dropIndex) return;

		const entities = [...this._config.entities];
		const draggedEntity = entities[dragIndex];

		// Remove the dragged entity
		entities.splice(dragIndex, 1);
		// Insert it at the new position
		entities.splice(dropIndex, 0, draggedEntity);

		this._config = { ...this._config, entities };
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_getEntityIcon(entity) {
		if (entity.type === 'template') {
			if (entity.icon_on) {
				return entity.icon_on;
			}
			if (entity.icon_off) {
				return entity.icon_off;
			}
			return 'mdi:code-braces';
		}

		if (entity.type === 'entity' && entity.entity && this.hass) {
			const entityObj = this.hass.states[entity.entity];
			if (entityObj) {
				// Use entity's icon or derive from domain
				if (entityObj.attributes.icon) {
					return entityObj.attributes.icon;
				}

				// Fallback icons based on domain
				const domain = entity.entity.split('.')[0];
				const domainIcons = {
					light: 'mdi:lightbulb',
					switch: 'mdi:toggle-switch',
					fan: 'mdi:fan',
					climate: 'mdi:thermostat',
					cover: 'mdi:window-shutter',
					lock: 'mdi:lock',
					sensor: 'mdi:gauge',
					binary_sensor: 'mdi:checkbox-marked-circle',
					camera: 'mdi:camera',
					media_player: 'mdi:speaker',
					automation: 'mdi:robot',
					script: 'mdi:script-text',
					scene: 'mdi:palette',
				};

				return domainIcons[domain] || 'mdi:help-circle';
			}
		}

		return 'mdi:help-circle'; // Default fallback
	}

	_getEntityDisplayName(entity, index) {
		const baseText =
			entity.type === 'template'
				? localize(this.hass, 'entity_type_template', 'Template')
				: localize(this.hass, 'entity_type_entity', 'Entity');

		if (entity.entity && this.hass) {
			const entityObj = this.hass.states[entity.entity];
			if (entityObj && entityObj.attributes.friendly_name) {
				return `${baseText}: ${entityObj.attributes.friendly_name}`;
			}
			return `${baseText}: ${entity.entity}`;
		}

		return `${baseText} ${index + 1}`;
	}

	_valueChanged(ev) {
		if (!this._config || !this.hass) {
			return;
		}

		const newConfig = ev.detail.value;

		// Special handling for background_type changes
		if (newConfig.background_type !== this._config.background_type) {
			if (newConfig.background_type === 'person' && !newConfig.background_person_entity) {
				// Auto-select first person when switching to person mode
				const firstPerson = this._getFirstPersonEntity();
				if (firstPerson) {
					newConfig.background_person_entity = firstPerson;
				}
			}
		}

		// Update internal config to trigger re-render
		this._config = newConfig;

		// Clean up old config keys that might still be present
		delete newConfig.background_settings;

		const event = new CustomEvent('config-changed', {
			detail: { config: newConfig },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}
	_valueChangedEntity(entity, ev) {
		if (!this._config || !this.hass) {
			return;
		}

		const entities = [...this._config.entities];
		entities[entity] = ev.detail.value;

		this._config = { ...this._config, entities };

		const event = new CustomEvent('config-changed', {
			detail: { config: this._config },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	_getEntitySchema(item) {
		let baseSchema = [
			{
				name: 'type',
				label: localize(this.hass, 'state_type', 'State Type'),
				selector: {
					select: {
						multiple: false,
						mode: 'dropdown',
						options: [
							{
								label: localize(this.hass, 'entity_type_entity', 'Entity'),
								value: 'entity',
							},
							{
								label: localize(this.hass, 'entity_type_template', 'Template'),
								value: 'template',
							},
						],
					},
				},
			},
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'icon',
						label: localize(this.hass, 'icon_on', 'Icon (On)'),
						required: true,
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
					{
						name: 'icon_off',
						label: localize(this.hass, 'icon_off', 'Icon (Off)'),
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
				],
			},
			// Only show color/template fields for non-climate entities
			...(item.type === 'entity' && this._isClimateEntity(item)
				? []
				: [
						{
							type: 'grid',
							name: '',
							schema: [
								{
									name: 'color_on',
									label: localize(this.hass, 'color_on', 'Color (On)'),
									selector: { text: {} },
								},
								{
									name: 'color_off',
									label: localize(this.hass, 'color_off', 'Color (Off)'),
									selector: { text: {} },
								},
							],
						},
						{
							type: 'grid',
							name: '',
							schema: [
								{
									name: 'template_on',
									label: localize(this.hass, 'template_on', 'Template (On)'),
									selector: {
										select: {
											multiple: false,
											mode: 'dropdown',
											options: getColorTemplateOptions(this.hass),
										},
									},
								},
								{
									name: 'template_off',
									label: localize(this.hass, 'template_off', 'Template (Off)'),
									selector: {
										select: {
											multiple: false,
											mode: 'dropdown',
											options: getColorTemplateOptions(this.hass),
										},
									},
								},
							],
						},
						{
							type: 'grid',
							name: '',
							schema: [
								{
									name: 'background_color_on',
									label: localize(
										this.hass,
										'background_color_on',
										'Background Color (On)'
									),
									selector: { text: {} },
								},
								{
									name: 'background_color_off',
									label: localize(
										this.hass,
										'background_color_off',
										'Background Color (Off)'
									),
									selector: { text: {} },
								},
							],
						},
					]),
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'tap_action',
						label:
							this.hass?.localize?.(
								'ui.panel.lovelace.editor.card.generic.tap_action'
							) || 'Tap Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'hold_action',
						label:
							this.hass?.localize?.(
								'ui.panel.lovelace.editor.card.generic.hold_action'
							) || 'Hold Action',
						selector: { 'ui-action': {} },
					},
				],
			},
			...(this._isLightEntity(item)
				? [
						{
							name: 'use_light_color',
							label: localize(
								this.hass,
								'use_light_color_description',
								'Use Light Color as icon and background color'
							),
							selector: { boolean: {} },
						},
					]
				: []),
		];
		const templateSchema = [
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'condition',
						label: localize(this.hass, 'template_condition', 'Template Condition'),
						required: true,
						selector: { template: {} },
					},
				],
			},
		];

		const entitySchema = [
			{
				name: 'entity',
				label: localize(this.hass, 'entity_type_entity', 'Entity'),
				required: true,
				selector: { entity: {} },
			},
			...(this._isClimateEntity(item)
				? []
				: [
						{
							name: 'on_state',
							label: localize(this.hass, 'on_state', 'On State'),
							required: true,
							selector: { text: {} },
						},
					]),
			...(this._isClimateEntity(item) ? this._getClimateEntitySchema(item) : []),
		];

		if (item.type === 'template') {
			baseSchema.push(...templateSchema);
		}

		if (item.type === 'entity') {
			baseSchema.push(...entitySchema);
		}

		const shouldExpand =
			(item.type == 'template' && item.condition == undefined) ||
			(item.type == 'entity' && item.entity == undefined);
		return [
			{
				type: 'expandable',
				expanded: shouldExpand,
				name: '',
				title: `${localize(this.hass, 'state_label', 'State')}: ${localize(this.hass, `entity_type_${item.type}`, item.type)}`,
				schema: baseSchema,
			},
		];
	}

	_renderEntities() {
		if (this._config.entities === undefined) {
			this._config = { ...this._config, entities: [] };
		}

		return html`
			${this._config.entities?.map(
				(entity, entity_idx) => html`
					<div
						class="box"
						@dragover=${this._handleDragOver}
						@dragleave=${this._handleDragLeave}
						@drop=${(ev) => this._handleDrop(ev, entity_idx)}
					>
						<div class="entity-header">
							<div class="entity-info">
								<ha-icon
									.icon=${'mdi:drag'}
									class="drag-handle"
									draggable="true"
									@dragstart=${(ev) => this._handleDragStart(ev, entity_idx)}
									@dragend=${this._handleDragEnd}
								></ha-icon>
								<ha-icon
									.icon=${this._getEntityIcon(entity)}
									class="entity-icon"
								></ha-icon>
								<span class="entity-title">
									${this._getEntityDisplayName(entity, entity_idx)}
								</span>
							</div>
							<div class="entity-controls">
								<mwc-icon-button
									.disabled=${entity_idx === 0}
									@click=${() => this._moveStateEntity(entity_idx, -1)}
									title="${localize(this.hass, 'move_up', 'Move Up')}"
								>
									<ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
								</mwc-icon-button>
								<mwc-icon-button
									.disabled=${entity_idx ===
									(this._config.entities?.length || 0) - 1}
									@click=${() => this._moveStateEntity(entity_idx, 1)}
									title="${localize(this.hass, 'move_down', 'Move Down')}"
								>
									<ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
								</mwc-icon-button>
								<mwc-icon-button
									@click=${() => this._deleteStateEntity(entity_idx)}
									title="${localize(this.hass, 'delete', 'Delete')}"
								>
									<ha-icon .icon=${'mdi:close'}></ha-icon>
								</mwc-icon-button>
							</div>
						</div>

						<ha-form
							.hass=${this.hass}
							.schema=${this._getEntitySchema(entity)}
							.data=${entity}
							.computeLabel=${(s) => s.label ?? s.name}
							@value-changed=${(ev) => this._valueChangedEntity(entity_idx, ev)}
						></ha-form>
					</div>
				`
			)}
		`;
	}

	// The render() function of a LitElement returns the HTML of your card, and any time one or the
	// properties defined above are updated, the correct parts of the rendered html are magically
	// replaced with the new values.  Check https://lit.dev for more info.
	render() {
		if (!this._config) {
			return html`<div>Loading...</div>`;
		}

		return html`
			<ha-form
				.hass=${this.hass}
				.data=${this._config}
				.schema=${[
					{
						name: 'name',
						label:
							this.hass?.localize?.('ui.panel.lovelace.editor.card.generic.name') ||
							'Name',
						required: true,
						selector: { text: {} },
					},
					{
						name: 'icon',
						label:
							this.hass?.localize?.('ui.panel.lovelace.editor.card.generic.icon') ||
							'Icon',
						required: true,
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
					{
						name: 'card_template',
						label: localize(this.hass, 'card_template', 'Card Color Template'),
						selector: {
							select: {
								multiple: false,
								mode: 'dropdown',
								options: getColorTemplateOptions(this.hass),
							},
						},
					},
					{
						name: 'tap_action',
						label:
							this.hass?.localize?.(
								'ui.panel.lovelace.editor.card.generic.tap_action'
							) || 'Tap Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'hold_action',
						label:
							this.hass?.localize?.(
								'ui.panel.lovelace.editor.card.generic.hold_action'
							) || 'Hold Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'icon_color',
						label: localize(this.hass, 'icon_color', 'Icon Color'),
						selector: { template: {} },
					},
					{
						name: 'secondary',
						label: localize(this.hass, 'secondary', 'Secondary Info'),
						selector: { template: {} },
					},
					{
						name: 'secondary_color',
						label: localize(this.hass, 'secondary_color', 'Secondary Info Color'),
						selector: { template: {} },
					},
					{
						name: 'use_template_color_for_title',
						label: localize(
							this.hass,
							'use_template_color_for_title',
							'Use template color for Name'
						),
						selector: { boolean: {} },
					},
					{
						name: 'use_template_color_for_secondary',
						label: localize(
							this.hass,
							'use_template_color_for_secondary',
							'Use template color for secondary info'
						),
						selector: { boolean: {} },
					},
					{
						name: 'background_type',
						label: localize(this.hass, 'background_type', 'Background Type'),
						selector: {
							select: {
								multiple: false,
								mode: 'dropdown',
								options: [
									{
										value: 'none',
										label: localize(
											this.hass,
											'background_type_none',
											'No Background'
										),
									},
									{
										value: 'color',
										label: localize(
											this.hass,
											'background_type_color',
											'Color Circle'
										),
									},
									{
										value: 'image',
										label: localize(
											this.hass,
											'background_type_image',
											'Custom Image'
										),
									},
									{
										value: 'person',
										label: localize(
											this.hass,
											'background_type_person',
											'Person Profile Picture'
										),
									},
								],
							},
						},
					},
					...this._getBackgroundSchema(),
					{
						name: 'entities_reverse_order',
						label: localize(
							this.hass,
							'entities_reverse_order',
							'Reverse Entity Order'
						),
						selector: { boolean: {} },
					},
				]}
				.computeLabel=${(s) => s.label ?? s.name}
				@value-changed=${this._valueChanged}
			></ha-form>

			<div style="display: flex;justify-content: space-between; margin-top: 20px;">
				<p>${localize(this.hass, 'states', 'States')}</p>
				${this._config.entities && this._config.entities.length >= 4
					? html`<mwc-button
							style="margin-top: 5px; cursor: not-allowed;"
							disabled
							title="${localize(
								this.hass,
								'maximum_states_reached',
								'Maximum 4 states reached'
							)}"
						>
							<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
								this.hass,
								'add_state',
								'Add State'
							)}
						</mwc-button>`
					: html`<mwc-button
							style="margin-top: 5px; cursor: pointer;"
							@click=${this._addEntityState}
						>
							<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
								this.hass,
								'add_state',
								'Add State'
							)}
						</mwc-button>`}
			</div>

			${this._renderEntities()}
		`;
	}

	// Helper method to check if an entity is a light
	_isLightEntity(entityConfig) {
		if (!entityConfig || !entityConfig.entity) {
			return false;
		}

		if (entityConfig.entity.startsWith('light.')) {
			return true;
		}

		if (this.hass && this.hass.states && this.hass.states[entityConfig.entity]) {
			const entityState = this.hass.states[entityConfig.entity];
			return entityState.entity_id.startsWith('light.');
		}

		return false;
	}

	_isClimateEntity(entityConfig) {
		if (!entityConfig || !entityConfig.entity) {
			return false;
		}

		if (entityConfig.entity.startsWith('climate.')) {
			return true;
		}

		if (this.hass && this.hass.states && this.hass.states[entityConfig.entity]) {
			const entityState = this.hass.states[entityConfig.entity];
			return entityState.entity_id.startsWith('climate.');
		}

		return false;
	}

	_getClimateHvacModes(entityConfig) {
		if (!this._isClimateEntity(entityConfig) || !this.hass || !this.hass.states) {
			return [];
		}

		const entityState = this.hass.states[entityConfig.entity];
		if (!entityState || !entityState.attributes || !entityState.attributes.hvac_modes) {
			return [];
		}

		return entityState.attributes.hvac_modes;
	}

	// Get schema for climate entity configuration
	_getClimateEntitySchema(item) {
		const hvacModes = this._getClimateHvacModes(item);

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

		const schema = [];

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
								label: `${localize(this.hass, 'background_color_for', 'Background Color for')} ${modeLabel}`,
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
										options: getColorTemplateOptions(this.hass),
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

	_getFirstPersonEntity() {
		if (!this.hass || !this.hass.states) return '';

		const personEntities = Object.keys(this.hass.states)
			.filter((entityId) => entityId.startsWith('person.'))
			.sort();

		return personEntities.length > 0 ? personEntities[0] : '';
	}

	_getBackgroundSchema() {
		let backgroundType = this._config?.background_type;

		// Migration logic for editor
		if (!backgroundType || backgroundType === '') {
			if (this._config?.use_background_image === true) {
				if (this._config?.background_person_entity) {
					backgroundType = 'person';
				} else if (this._config?.background_image) {
					backgroundType = 'image';
				} else {
					backgroundType = 'color';
				}
			} else {
				backgroundType = 'color';
			}
		}

		switch (backgroundType) {
			case 'none':
				return [];

			case 'color':
				return [
					{
						name: 'background_circle_color',
						label: localize(
							this.hass,
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
						label: localize(this.hass, 'background_image', 'Background Image'),
						selector: { text: {} },
					},
					{
						name: 'background_image_square',
						label: localize(this.hass, 'background_image_square', 'Square Background'),
						selector: { boolean: {} },
					},
				];

			case 'person':
				return [
					{
						name: 'background_person_entity',
						label: localize(this.hass, 'background_person_entity', 'Person Entity'),
						required: true,
						selector: { entity: { domain: 'person' } },
					},
					{
						name: 'background_image_square',
						label: localize(this.hass, 'background_image_square', 'Square Background'),
						selector: { boolean: {} },
					},
				];

			default:
				// Fallback to old color circle schema (should be migrated automatically when opening the editor but you never know what happens to the beatuy of JS)
				return [
					{
						name: 'background_circle_color',
						label: localize(
							this.hass,
							'background_circle_color_template_hint',
							'Background Circle Color - empty for template color'
						),
						selector: { template: {} },
					},
				];
		}
	}
}

customElements.define('room-card-minimalist-editor', RoomCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'room-card-minimalist',
	name: 'Room Card Minimalist',
	preview: true,
	description: 'Display the state of a room at a glance - in UI Lovelace Minimalist style',
	documentationURL: 'https://github.com/unbekannt3/room-card-minimalist',
});
