import { LitElement, html } from 'lit-element';

// Template colors
const TEMPLATE_OPTIONS = [
	{ label: 'Blue', value: 'blue' },
	{ label: 'Light Blue', value: 'lightblue' },
	{ label: 'Red', value: 'red' },
	{ label: 'Green', value: 'green' },
	{ label: 'Light Green', value: 'lightgreen' },
	{ label: 'Yellow', value: 'yellow' },
	{ label: 'Purple', value: 'purple' },
	{ label: 'Orange', value: 'orange' },
	{ label: 'Pink', value: 'pink' },
	{ label: 'Grey', value: 'grey' },
	{ label: 'Teal', value: 'teal' },
	{ label: 'Indigo', value: 'indigo' },
];

class RoomCardEditor extends LitElement {
	setConfig(config) {
		this._config = config;
		this._currentTab = 0;
	}

	static get properties() {
		return {
			hass: { attribute: false },
			_config: { state: true },
		};
	}

	_deleteStateEntity(idx) {
		if (!this._config) return;

		this._config.entities.splice(idx, 1);
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_moveStateEntity(idx, pos) {
		if (!this._config) return;

		[this._config.entities[idx], this._config.entities[idx + pos]] = [
			this._config.entities[idx + pos],
			this._config.entities[idx],
		];
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_addEntityState() {
		if (!this._config) return;

		this._config.entities.push({ type: 'template' });
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
	}

	_valueChanged(ev) {
		if (!this._config || !this.hass) {
			return;
		}

		const event = new CustomEvent('config-changed', {
			detail: { config: ev.detail.value },
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
		this._config.entities = entities;

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
				label: 'State Type',
				selector: {
					select: {
						multiple: false,
						mode: 'dropdown',
						options: [
							{ label: 'Entity', value: 'entity' },
							{ label: 'Template', value: 'template' },
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
						label: 'Icon On',
						required: true,
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
					{
						name: 'icon_off',
						label: 'Icon Off',
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
				],
			},
			{
				type: 'grid',
				name: '',
				schema: [
					{ name: 'color_on', label: 'Color On', selector: { text: {} } },
					{ name: 'color_off', label: 'Color Off', selector: { text: {} } },
				],
			},
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'template_on',
						label: 'Template On',
						selector: {
							select: {
								multiple: false,
								mode: 'dropdown',
								options: TEMPLATE_OPTIONS,
							},
						},
					},
					{
						name: 'template_off',
						label: 'Template Off',
						selector: {
							select: {
								multiple: false,
								mode: 'dropdown',
								options: TEMPLATE_OPTIONS,
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
						label: 'Background Color On',
						selector: { text: {} },
					},
					{
						name: 'background_color_off',
						label: 'Background Color Off',
						selector: { text: {} },
					},
				],
			},
			{
				type: 'grid',
				name: '',
				schema: [
					{
						name: 'tap_action',
						label: 'Tap Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'hold_action',
						label: 'Hold Action',
						selector: { 'ui-action': {} },
					},
				],
			},
			...(this._isLightEntity(item)
				? [
						{
							name: 'use_light_color',
							label: 'Use Light Color as icon and background color',
							selector: { boolean: {} },
						},
					]
				: []),
		];
		const templateSchema = [
			{
				name: 'condition',
				label: 'Template Condition',
				required: true,
				selector: { template: {} },
			},
		];

		const entitySchema = [
			{
				name: 'entity',
				label: 'Entity',
				required: true,
				selector: { entity: {} },
			},
			{
				name: 'on_state',
				label: 'On State',
				required: true,
				selector: { text: {} },
			},
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
				title: `State: ${item.type}`,
				schema: baseSchema,
			},
		];
	}

	_renderEntities() {
		if (this._config.entities === undefined) {
			this._config.entities = [];
		}

		return html`
			${this._config.entities?.map(
				(entity, entity_idx) => html`
					<div class="box">
						<div class="toolbar">
							<mwc-icon-button
								.disabled=${entity_idx === 0}
								@click=${() => this._moveStateEntity(entity_idx, -1)}
							>
								<ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
							</mwc-icon-button>
							<mwc-icon-button
								.disabled=${entity_idx === this._config.entities.length - 1}
								@click=${() => this._moveStateEntity(entity_idx, 1)}
							>
								<ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
							</mwc-icon-button>
							<mwc-icon-button @click=${() => this._deleteStateEntity(entity_idx)}>
								<ha-icon .icon=${'mdi:close'}></ha-icon>
							</mwc-icon-button>

							<ha-form
								.hass=${this.hass}
								.schema=${this._getEntitySchema(entity)}
								.data=${entity}
								.computeLabel=${(s) => s.label ?? s.name}
								@value-changed=${(ev) => this._valueChangedEntity(entity_idx, ev)}
							></ha-form>
						</div>
					</div>
				`
			)}
		`;
	}

	// The render() function of a LitElement returns the HTML of your card, and any time one or the
	// properties defined above are updated, the correct parts of the rendered html are magically
	// replaced with the new values.  Check https://lit.dev for more info.
	render() {
		return html`
			<ha-form
				.hass=${this.hass}
				.data=${this._config}
				.schema=${[
					{
						name: 'name',
						label: 'Name',
						required: true,
						selector: { text: {} },
					},
					{
						name: 'icon',
						label: 'Icon',
						required: true,
						selector: { icon: {} },
						context: { icon_entity: 'entity' },
					},
					{
						name: 'card_template',
						label: 'Card Color Template',
						selector: {
							select: {
								multiple: false,
								mode: 'dropdown',
								options: TEMPLATE_OPTIONS,
							},
						},
					},
					{
						name: 'tap_action',
						label: 'Tap Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'hold_action',
						label: 'Hold Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'icon_color',
						label: 'Icon Color - gets overwritten when using card color template',
						selector: { template: {} },
					},
					{
						name: 'secondary',
						label: 'Secondary Info',
						selector: { template: {} },
					},
					{
						name: 'secondary_color',
						label: 'Secondary Info Color',
						selector: { template: {} },
					},
					{
						name: 'show_background_circle',
						label: 'Show Background Circle behind card icon',
						selector: { boolean: true },
					},
					{
						name: 'background_circle_color',
						label: 'Background Circle Color - empty for template color',
						selector: { template: {} },
					},
					{
						name: 'entities_reverse_order',
						label: 'Entities from bottom to top',
						selector: { boolean: {} },
					},
					{
						name: 'use_template_color_for_title',
						label: 'Use template color for Name',
						selector: { boolean: {} },
					},
					{
						name: 'use_template_color_for_secondary',
						label: 'Use template color for secondary info',
						selector: { boolean: {} },
					},
				]}
				.computeLabel=${(s) => s.label ?? s.name}
				@value-changed=${this._valueChanged}
			></ha-form>

			<div style="display: flex;justify-content: space-between; margin-top: 20px;">
				<p>States</p>
				<mwc-button style="margin-top: 5px;" @click=${this._addEntityState}>
					<ha-icon .icon=${'mdi:plus'}></ha-icon>Add State
				</mwc-button>
			</div>

			${this._renderEntities()}
		`;
	}

	// Helper method to check if an entity is a light
	_isLightEntity(entityConfig) {
		if (!entityConfig || !entityConfig.entity) {
			return false;
		}

		// Check if entity starts with 'light.'
		if (entityConfig.entity.startsWith('light.')) {
			return true;
		}

		// Also check if the entity exists in hass and has light domain
		if (this.hass && this.hass.states && this.hass.states[entityConfig.entity]) {
			const entityState = this.hass.states[entityConfig.entity];
			return entityState.entity_id.startsWith('light.');
		}

		return false;
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
