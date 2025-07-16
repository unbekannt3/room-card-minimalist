import { LitElement, html } from 'lit-element';

// UI-Lovelace-Minimalist kompatible Templates für Dropdown
const TEMPLATE_OPTIONS = [
	{ label: 'Blue No State', value: 'blue_no_state' },
	{ label: 'Red No State', value: 'red_no_state' },
	{ label: 'Green No State', value: 'green_no_state' },
	{ label: 'Yellow No State', value: 'yellow_no_state' },
	{ label: 'Purple No State', value: 'purple_no_state' },
	{ label: 'Orange No State', value: 'orange_no_state' },
	{ label: 'Pink No State', value: 'pink_no_state' },
	{ label: 'Red On', value: 'red_on' },
	{ label: 'Red Off', value: 'red_off' },
	{ label: 'Green On', value: 'green_on' },
	{ label: 'Green Off', value: 'green_off' },
	{ label: 'Blue On', value: 'blue_on' },
	{ label: 'Blue Off', value: 'blue_off' },
	{ label: 'Yellow On', value: 'yellow_on' },
	{ label: 'Yellow Off', value: 'yellow_off' },
	{ label: 'Purple On', value: 'purple_on' },
	{ label: 'Purple Off', value: 'purple_off' },
	{ label: 'Orange On', value: 'orange_on' },
	{ label: 'Orange Off', value: 'orange_off' },
	{ label: 'Pink On', value: 'pink_on' },
	{ label: 'Pink Off', value: 'pink_off' },
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
		this.dispatchEvent(
			new CustomEvent('config-changed', { detail: { config: this._config } })
		);
	}

	_moveStateEntity(idx, pos) {
		if (!this._config) return;

		[this._config.entities[idx], this._config.entities[idx + pos]] = [
			this._config.entities[idx + pos],
			this._config.entities[idx],
		];
		this.dispatchEvent(
			new CustomEvent('config-changed', { detail: { config: this._config } })
		);
	}

	_addEntityState() {
		if (!this._config) return;

		this._config.entities.push({ type: 'template' });
		this.dispatchEvent(
			new CustomEvent('config-changed', { detail: { config: this._config } })
		);
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
						name: 'templates_on',
						label: 'Templates On',
						selector: {
							select: {
								multiple: true,
								mode: 'dropdown',
								options: TEMPLATE_OPTIONS,
							},
						},
					},
					{
						name: 'templates_off',
						label: 'Templates Off',
						selector: {
							select: {
								multiple: true,
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
							<mwc-icon-button
								@click=${() => this._deleteStateEntity(entity_idx)}
							>
								<ha-icon .icon=${'mdi:close'}></ha-icon>
							</mwc-icon-button>

							<ha-form
								.hass=${this.hass}
								.schema=${this._getEntitySchema(entity)}
								.data=${entity}
								.computeLabel=${(s) => s.label ?? s.name}
								@value-changed=${(ev) =>
									this._valueChangedEntity(entity_idx, ev)}
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
						label: 'Card Template',
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
						name: 'double_tap_action',
						label: 'Double Tap Action',
						selector: { 'ui-action': {} },
					},
					{
						name: 'icon_color',
						label: 'Icon Color',
						selector: { template: {} },
					},
					{
						name: 'secondary',
						label: 'Secondary Info',
						selector: { template: {} },
					},
					{
						name: 'show_background_circle',
						label: 'Show Background Circle',
						selector: { boolean: {} },
					},
					{
						name: 'background_circle_color',
						label: 'Background Circle Color',
						selector: { template: {} },
					},
					{
						name: 'max_entities',
						label: 'Max Entities (1-4)',
						selector: { number: { min: 1, max: 4, step: 1 } },
					},
				]}
				.computeLabel=${(s) => s.label ?? s.name}
				@value-changed=${this._valueChanged}
			></ha-form>

			<div
				style="display: flex;justify-content: space-between; margin-top: 20px;"
			>
				<p>States</p>
				<mwc-button style="margin-top: 5px;" @click=${this._addEntityState}>
					<ha-icon .icon=${'mdi:plus'}></ha-icon>Add State
				</mwc-button>
			</div>

			${this._renderEntities()}
		`;
	}
}

customElements.define('room-card-minimalist-editor', RoomCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'room-card-minimalist',
	name: 'Room Card Minimalist',
	preview: false, // Optional - defaults to false
	description:
		'Display the state of a room at a glance with Material-You theme compatibility', // Optional
	documentationURL: 'https://github.com/unbekannt3/hass-room-card-minimalist', // Adds a help link in the frontend card editor
});
