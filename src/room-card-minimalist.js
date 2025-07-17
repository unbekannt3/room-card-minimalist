import { LitElement, html, css } from 'lit-element';
import packageInfo from '../package.json';

// Template colors
// if the user selected theme provides the --color- variables it will be used
// otherwise fallback colors are used
const COLOR_TEMPLATES = {
	blue: {
		icon_color: 'rgba(var(--color-blue, 61, 90, 254),1)',
		background_color: 'rgba(var(--color-blue, 61, 90, 254), 0.2)',
		text_color: 'rgba(var(--color-blue-text, 61, 90, 254),1)',
	},
	lightblue: {
		icon_color: 'rgba(var(--color-lightblue, 3, 169, 244),1)',
		background_color: 'rgba(var(--color-lightblue, 3, 169, 244), 0.2)',
		text_color: 'rgba(var(--color-lightblue-text, 3, 169, 244),1)',
	},
	red: {
		icon_color: 'rgba(var(--color-red, 245, 68, 54),1)',
		background_color: 'rgba(var(--color-red, 245, 68, 54), 0.2)',
		text_color: 'rgba(var(--color-red-text, 245, 68, 54),1)',
	},
	green: {
		icon_color: 'rgba(var(--color-green, 1, 200, 82),1)',
		background_color: 'rgba(var(--color-green, 1, 200, 82), 0.2)',
		text_color: 'rgba(var(--color-green-text, 1, 200, 82),1)',
	},
	lightgreen: {
		icon_color: 'rgba(var(--color-lightgreen, 139, 195, 74),1)',
		background_color: 'rgba(var(--color-lightgreen, 139, 195, 74), 0.2)',
		text_color: 'rgba(var(--color-lightgreen-text, 139, 195, 74),1)',
	},
	yellow: {
		icon_color: 'rgba(var(--color-yellow, 255, 145, 1),1)',
		background_color: 'rgba(var(--color-yellow, 255, 145, 1), 0.2)',
		text_color: 'rgba(var(--color-yellow-text, 255, 145, 1),1)',
	},
	purple: {
		icon_color: 'rgba(var(--color-purple, 102, 31, 255),1)',
		background_color: 'rgba(var(--color-purple, 102, 31, 255), 0.2)',
		text_color: 'rgba(var(--color-purple-text, 102, 31, 255),1)',
	},
	orange: {
		icon_color: 'rgba(var(--color-orange, 255, 87, 34),1)',
		background_color: 'rgba(var(--color-orange, 255, 87, 34), 0.2)',
		text_color: 'rgba(var(--color-orange-text, 255, 87, 34),1)',
	},
	pink: {
		icon_color: 'rgba(var(--color-pink, 233, 30, 99),1)',
		background_color: 'rgba(var(--color-pink, 233, 30, 99), 0.2)',
		text_color: 'rgba(var(--color-pink-text, 233, 30, 99),1)',
	},
	grey: {
		icon_color: 'rgba(var(--color-grey, 158, 158, 158),1)',
		background_color: 'rgba(var(--color-grey, 158, 158, 158), 0.2)',
		text_color: 'rgba(var(--color-grey-text, 158, 158, 158),1)',
	},
	teal: {
		icon_color: 'rgba(var(--color-teal, 0, 150, 136),1)',
		background_color: 'rgba(var(--color-teal, 0, 150, 136), 0.2)',
		text_color: 'rgba(var(--color-teal-text, 0, 150, 136),1)',
	},
	indigo: {
		icon_color: 'rgba(var(--color-indigo, 63, 81, 181),1)',
		background_color: 'rgba(var(--color-indigo, 63, 81, 181), 0.2)',
		text_color: 'rgba(var(--color-indigo-text, 63, 81, 181),1)',
	},
};

class RoomCard extends LitElement {
	// The height of your card. Home Assistant uses this to automatically
	// distribute all cards over the available columns.
	getCardSize() {
		return 2;
	}

	// This will make parts of the card rerender when this.hass or this._config is changed.
	// this.hass is updated by Home Assistant whenever anything happens in your system
	static get properties() {
		return {
			hass: { attribute: false },
			_config: { state: true },
			_templateResults: { state: true },
			_unsubRenderTemplates: { state: true },
		};
	}

	// Our initial states
	constructor() {
		super();
		this._templateResults = {};
		this._unsubRenderTemplates = new Map();
		this._holdTimeout = null;
		this._holdFired = false;
	}

	// Called by HASS when config is changed
	setConfig(config) {
		this._tryDisconnect();

		if (!config.name) {
			throw new Error('You need to define a name for the room');
		}

		if (!config.icon) {
			throw new Error('You need to define an Icon for the room');
		}

		this._config = {
			secondary: '',
			secondary_color: 'var(--secondary-text-color)',
			entities: [],
			show_background_circle: true,
			background_circle_color: 'var(--accent-color)',
			entities_reverse_order: false,
			use_template_color_for_title: false,
			use_template_color_for_secondary: false,
			...config,
		};
	}

	// Called by HASS
	updated(changedProps) {
		super.updated(changedProps);
		if (!this._config || !this.hass) {
			return;
		}

		this._tryConnect(this._config.secondary);
	}

	// Called by HASS
	connectedCallback() {
		super.connectedCallback();
		this._tryConnect(this._config.secondary);
	}

	// Called by HASS
	disconnectedCallback() {
		this._tryDisconnect();
	}

	// Register our custom editor
	static getConfigElement() {
		return document.createElement('room-card-minimalist-editor');
	}

	// Provide stub config for preview
	static getStubConfig() {
		return {
			name: 'Living Room',
			icon: 'mdi:sofa',
			card_template: 'blue_no_state',
			secondary: '22.5°C',
			entities: [
				{
					type: 'template',
					icon: 'mdi:ceiling-light',
					icon_off: 'mdi:ceiling-light-outline',
					condition: 'Lights On',
					template_on: 'yellow',
				},
				{
					type: 'template',
					icon: 'mdi:motion-sensor',
					icon_off: 'mdi:motion-sensor-off',
					condition: 'Motion',
					template_on: 'green',
				},
				{
					type: 'template',
					icon: 'mdi:radiator',
					icon_off: 'mdi:radiator-disabled',
					condition: '',
					template_off: 'red',
				},
			],
		};
	}

	// Apply card template to get background circle color and icon color
	_applyCardTemplate() {
		if (
			this._config.card_template &&
			COLOR_TEMPLATES[this._config.card_template]
		) {
			const template = COLOR_TEMPLATES[this._config.card_template];
			return {
				background_circle_color: template.background_color,
				icon_color: template.icon_color,
				text_color: template.text_color,
			};
		}
		return {
			background_circle_color:
				this._config.background_circle_color || 'var(--accent-color)',
			icon_color: this._config.icon_color || 'rgb(var(--rgb-white))',
			text_color: 'var(--primary-text-color)',
		};
	}

	// The render() function of a LitElement returns the HTML of your card, and any time one or the
	// properties defined above are updated, the correct parts of the rendered html are magically
	// replaced with the new values.  Check https://lit.dev for more info.
	render() {
		const secondary = this._getValueRawOrTemplate(this._config.secondary);
		const secondaryColor = this._getValueRawOrTemplate(
			this._config.secondary_color
		);
		let entitiesToShow = this._config.entities.slice(0, 4); // Always show max 4 entities

		// Reverse order if configured
		if (this._config.entities_reverse_order) {
			entitiesToShow = [...entitiesToShow].reverse();
		}

		const { background_circle_color, icon_color, text_color } =
			this._applyCardTemplate();

		// Determine title and secondary colors
		const titleColor = this._config.use_template_color_for_title
			? this._getValueRawOrTemplate(text_color)
			: 'var(--primary-text-color)';
		const finalSecondaryColor = this._config.use_template_color_for_secondary
			? this._getValueRawOrTemplate(text_color)
			: secondaryColor;

		return html`
			<ha-card
				@click=${(e) => this._handleCardClick(e)}
				@mousedown=${(e) => this._handleCardMouseDown(e)}
				@mouseup=${(e) => this._handleCardMouseUp(e)}
				@mouseleave=${(e) => this._handleCardMouseLeave(e)}
				@touchstart=${(e) => this._handleCardTouchStart(e)}
				@touchend=${(e) => this._handleCardTouchEnd(e)}
				@contextmenu=${(e) => this._handleCardContextMenu(e)}
				.config=${this._config}
				tabindex="0"
			>
				<div class="container">
					<div class="content-main">
						<div class="text-content">
							<span class="primary" style="color: ${titleColor}"
								>${this._config.name}</span
							>
							${secondary
								? html`<span
										class="secondary"
										style="color: ${finalSecondaryColor}"
										>${secondary}</span
								  >`
								: ''}
						</div>

						<div class="icon-container">
							${this._config.show_background_circle !== false
								? html`
										<div
											class="icon-background"
											style="background-color: ${this._getValueRawOrTemplate(
												background_circle_color
											)}"
										></div>
								  `
								: ''}
							<div
								class="icon"
								style="--icon-color: ${this._getValueRawOrTemplate(
									icon_color
								)};"
							>
								<ha-icon .icon=${this._config.icon} />
							</div>
						</div>
					</div>

					<div class="content-right">
						<div
							class="states ${this._config.entities_reverse_order
								? 'reverse-order'
								: ''}"
						>
							${entitiesToShow.map((item) => {
								return this._getItemHTML(item);
							})}
						</div>
					</div>
				</div>
			</ha-card>
		`;
	}

	// Apply templates to get final colors
	_applyTemplates(item, state) {
		// Support both new (template_on/template_off) and legacy (templates_on/templates_off) naming
		const templates =
			state === 'on'
				? item.template_on || item.templates_on
				: item.template_off || item.templates_off;
		let result = {
			icon_color: 'var(--primary-text-color)',
			background_color: 'var(--secondary-background-color)',
			text_color: 'var(--primary-text-color)',
		};

		if (templates) {
			// Handle both single template (string) and legacy array format
			const templateList = Array.isArray(templates) ? templates : [templates];
			templateList.forEach((template) => {
				if (COLOR_TEMPLATES[template]) {
					result = { ...result, ...COLOR_TEMPLATES[template] };
				}
			});
		}

		// Override with explicit colors if provided
		if (state === 'on') {
			if (item.color_on) result.icon_color = item.color_on;
			if (item.background_color_on)
				result.background_color = item.background_color_on;
		} else {
			if (item.color_off) result.icon_color = item.color_off;
			if (item.background_color_off)
				result.background_color = item.background_color_off;
		}

		return result;
	}

	// Handle card click
	_handleCardClick(e) {
		if (this._holdFired) {
			this._holdFired = false;
			return;
		}
		e.stopPropagation();
		this._fireHassAction(this._config, 'tap');
	}

	// Handle card mouse down
	_handleCardMouseDown(e) {
		if (e.button !== 0) return; // Only left mouse button
		// Don't start hold timer if clicking on a state item
		if (e.target.closest('.state-item')) return;
		this._startHoldTimer(() => this._fireHassAction(this._config, 'hold'));
	}

	// Handle card mouse up
	_handleCardMouseUp() {
		this._clearHoldTimer();
	}

	// Handle card mouse leave
	_handleCardMouseLeave() {
		this._clearHoldTimer();
	}

	// Handle card touch start
	_handleCardTouchStart(e) {
		// Don't start hold timer if touching a state item
		if (e.target.closest('.state-item')) return;
		this._startHoldTimer(() => this._fireHassAction(this._config, 'hold'));
	}

	// Handle card touch end
	_handleCardTouchEnd() {
		this._clearHoldTimer();
	}

	// Handle card context menu (right-click)
	_handleCardContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this._fireHassAction(this._config, 'hold');
	}

	// Handle item click
	_handleItemClick(e, item) {
		if (this._holdFired) {
			this._holdFired = false;
			return;
		}
		e.stopPropagation();
		this._fireHassAction(item, 'tap');
	}

	// Handle item mouse down
	_handleItemMouseDown(e, item) {
		if (e.button !== 0) return; // Only left mouse button
		e.stopPropagation(); // Prevent card from handling this
		this._startHoldTimer(() => this._fireHassAction(item, 'hold'));
	}

	// Handle item mouse up
	_handleItemMouseUp() {
		this._clearHoldTimer();
	}

	// Handle item mouse leave
	_handleItemMouseLeave() {
		this._clearHoldTimer();
	}

	// Handle item touch start
	_handleItemTouchStart(e, item) {
		e.stopPropagation(); // Prevent card from handling this
		this._startHoldTimer(() => this._fireHassAction(item, 'hold'));
	}

	// Handle item touch end
	_handleItemTouchEnd() {
		this._clearHoldTimer();
	}

	// Handle item context menu (right-click)
	_handleItemContextMenu(e, item) {
		e.preventDefault();
		e.stopPropagation();
		this._fireHassAction(item, 'hold');
	}

	// Start hold timer
	_startHoldTimer(callback) {
		this._clearHoldTimer();
		this._holdFired = false;
		this._holdTimeout = setTimeout(() => {
			this._holdFired = true;
			callback();
		}, 500); // 500ms hold time
	}

	// Clear hold timer
	_clearHoldTimer() {
		if (this._holdTimeout) {
			clearTimeout(this._holdTimeout);
			this._holdTimeout = null;
		}
	}

	// Fire HA action event
	_fireHassAction(config, action) {
		const event = new Event('hass-action', {
			bubbles: true,
			composed: true,
		});

		// Create action config with entity if available
		const actionConfig = {
			entity: config.entity,
			tap_action: config.tap_action || this._getDefaultAction(config),
			hold_action: config.hold_action,
			double_tap_action: config.double_tap_action,
		};

		event.detail = {
			config: actionConfig,
			action: action,
		};

		this.dispatchEvent(event);
	}

	// Get default action for config
	_getDefaultAction(config) {
		// For main card, default to more-info or navigation
		if (!config.type) {
			return config.tap_action || { action: 'more-info' };
		}

		// For entity items, default to toggle for certain domains
		if (config.type === 'entity' && config.entity) {
			const domain = config.entity.split('.')[0];
			if (
				[
					'light',
					'switch',
					'fan',
					'automation',
					'script',
					'input_boolean',
				].includes(domain)
			) {
				return {
					action: 'call-service',
					service: domain + '.toggle',
					target: { entity_id: config.entity },
				};
			}
		}

		return { action: 'more-info' };
	}

	// Get the state icon for an item
	_getItemHTML(item) {
		let stateValue = '';
		let stateIsOn = false;
		if (item.type === 'entity') {
			stateValue = this._getValue(item.entity);
			stateIsOn = stateValue == item.on_state;
		} else if (item.type == 'template') {
			stateValue = this._getValue(item.condition);
			stateIsOn = stateValue != '';
		} else {
			return html`<span class="invalid-entity">invalid type</span>`;
		}

		const { icon_color, background_color } = this._applyTemplates(
			item,
			stateIsOn ? 'on' : 'off'
		);

		// Get actual color from light entity if use_light_color is enabled
		let finalIconColor = icon_color;
		let finalBackgroundColor = background_color;
		if (item.use_light_color && stateIsOn && item.type === 'entity') {
			const entityState = this.hass.states[item.entity];
			if (entityState && entityState.attributes.rgb_color) {
				const [r, g, b] = entityState.attributes.rgb_color;
				finalIconColor = `rgb(${r}, ${g}, ${b})`;
				// Create a darker/transparent background color similar to color templates
				finalBackgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
			}
		}

		const icon = stateIsOn
			? item.icon
			: item.icon_off
			? item.icon_off
			: item.icon;
		const iconClass = !stateIsOn ? 'off' : 'on';

		return html`
			<ha-card
				@click=${(e) => this._handleItemClick(e, item)}
				@mousedown=${(e) => this._handleItemMouseDown(e, item)}
				@mouseup=${(e) => this._handleItemMouseUp(e, item)}
				@mouseleave=${(e) => this._handleItemMouseLeave(e, item)}
				@touchstart=${(e) => this._handleItemTouchStart(e, item)}
				@touchend=${(e) => this._handleItemTouchEnd(e, item)}
				@contextmenu=${(e) => this._handleItemContextMenu(e, item)}
				.config=${item}
				tabindex="0"
				class="state-item"
				style="background-color: ${finalBackgroundColor}"
			>
				<ha-icon
					class="state-icon ${iconClass}"
					.icon=${icon}
					style="color: ${finalIconColor}"
				/>
			</ha-card>
		`;
	}

	// Check if an item is a template
	_isTemplate(item) {
		return item?.includes('{');
	}

	// Get the value, by checking if it's a template, otherwise assume it's
	// an entity and get it's state
	_getValue(item) {
		if (this._isTemplate(item)) {
			this._tryConnect(item);
		}

		return this._isTemplate(item)
			? this._templateResults[item]?.result?.toString()
			: this.hass.states[item]?.state;
	}

	// Returns the raw value passed if not a template, otherwise evaluate the template
	_getValueRawOrTemplate(item) {
		if (this._isTemplate(item)) {
			this._tryConnect(item);
		}

		return this._isTemplate(item)
			? this._templateResults[item]?.result?.toString()
			: item;
	}

	// Disconnect all template subscriptions
	async _tryDisconnect() {
		for (const item in this._templateResults) {
			this._tryDisconnectKey(item);
		}
	}

	async _tryDisconnectKey(item) {
		const unsubRenderTemplate = this._unsubRenderTemplates.get(item);
		if (!unsubRenderTemplate) {
			return;
		}

		try {
			const unsub = await unsubRenderTemplate;
			unsub();
			this._unsubRenderTemplates.delete(item);
		} catch (err) {
			if (err.code === 'not_found' || err.code === 'template_error') {
				// If we get here, the connection was probably already closed. Ignore.
			} else {
				throw err;
			}
		}
	}

	// Try and subscribe to a template
	async _tryConnect(item) {
		if (
			this._unsubRenderTemplates.get(item) !== undefined ||
			!this.hass ||
			!this._config ||
			!this._isTemplate(item)
		) {
			return;
		}

		try {
			const sub = this._subscribeRenderTemplate(
				this.hass.connection,
				(result) => {
					this._templateResults = {
						...this._templateResults,
						[item]: result,
					};
				},
				{
					template: item ?? '',
					variables: {
						config: this._config,
						user: this.hass.user?.name,
						entity: this.hass.states[this._config.entity],
					},
					strict: true,
				}
			);

			this._unsubRenderTemplates.set(item, sub);
			await sub;
		} catch (err) {
			this._unsubRenderTemplates.delete(item);
		}
	}

	async _subscribeRenderTemplate(conn, onChange, params) {
		return conn.subscribeMessage((msg) => onChange(msg), {
			type: 'render_template',
			...params,
		});
	}

	forwardHaptic(hapticType) {
		this._fireEvent(this, 'haptic', hapticType);
	}

	// Send a dom event
	_fireEvent(node, type, detail, options) {
		options = options || {};
		detail = detail === null || detail === undefined ? {} : detail;
		const event = new Event(type, {
			bubbles: options.bubbles === undefined ? true : options.bubbles,
			cancelable: Boolean(options.cancelable),
			composed: options.composed === undefined ? true : options.composed,
		});
		event.detail = detail;
		node.dispatchEvent(event);
		return event;
	}

	static get styles() {
		return css`
			:host {
				--main-color: rgb(var(--rgb-grey));
				--icon-size: 80px;
				--icon-background-size: 175px;
				--state-icon-size: 1.8rem;
				--state-item-size: 45px;
				--card-primary-font-size: 18px;
				--card-primary-font-weight: 600;
				--card-primary-line-height: 1.3;
				--card-secondary-font-weight: 400;
				--card-secondary-font-size: 14px;
				--card-secondary-line-height: 1.2;
				--spacing: 8px;
				--border-radius: 12px;
				--state-border-radius: 50%;

				/* Home Assistant card defaults */
				box-sizing: border-box;
				border-radius: var(--ha-card-border-radius, 12px);
				border-width: var(--ha-card-border-width, 1px);
				border-style: solid;
				border-color: var(
					--ha-card-border-color,
					var(--divider-color, #e0e0e0)
				);

				/* Card shadows */
				box-shadow: var(
					--ha-card-box-shadow,
					var(--material-shadow-elevation-2)
				);
				transition: box-shadow 0.3s ease;
			}

			:host:hover {
				box-shadow: var(--material-shadow-elevation-4);
			}

			ha-card {
				border-radius: inherit;
				background: var(--card-background-color);
				overflow: hidden;
				position: relative;
				z-index: 1;
				border: none;
				width: 100%;
				height: 100%;
				box-shadow: none;
			}

			ha-card:hover {
				cursor: pointer;
			}

			.container {
				display: flex;
				align-items: stretch;
				justify-content: space-between;
				padding: 16px 8px 16px 16px;
				height: 204px; /* 236px - 32px padding = 204px */
				position: relative;
				z-index: 2;
				/* Ensure background circle can overflow */
				overflow: visible;
			}

			.content-main {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				flex: 1;
				min-width: 0;
				gap: 12px;
			}

			.text-content {
				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				min-width: 0;
				align-self: flex-start;
			}

			.icon-container {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				align-self: flex-start;
				width: var(--icon-size);
				height: var(--icon-size);
				/* Allow background circle to overflow */
				overflow: visible;
			}

			.icon-background {
				position: absolute;
				/* Position the large circle to overflow bottom-left */
				top: calc(var(--icon-size) / 2 - var(--icon-background-size) / 2);
				left: calc(var(--icon-size) / 2 - var(--icon-background-size) / 2);
				width: var(--icon-background-size);
				height: var(--icon-background-size);
				border-radius: 50%;
				opacity: 0.2;
				z-index: 1;
			}

			.icon {
				position: relative;
				z-index: 2;
				display: flex;
				align-items: center;
				justify-content: center;
				width: var(--icon-size);
				height: var(--icon-size);
			}

			.icon ha-icon {
				--mdc-icon-size: var(--icon-size);
				color: var(--icon-color);
				filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
			}

			.primary {
				font-weight: var(--card-primary-font-weight);
				font-size: var(--card-primary-font-size);
				line-height: var(--card-primary-line-height);
				color: var(--primary-text-color);
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				margin-bottom: 6px;
			}

			.secondary {
				font-weight: var(--card-secondary-font-weight);
				font-size: var(--card-secondary-font-size);
				line-height: var(--card-secondary-line-height);
				color: var(--secondary-text-color);
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}

			.content-right {
				display: flex;
				align-items: center;
				flex-shrink: 0;
			}

			.states {
				display: flex;
				flex-direction: column;
				gap: 12px;
				align-items: center;
				height: 236px;
				justify-content: flex-start;
				padding-top: 20px;
			}

			.states.reverse-order {
				flex-direction: column-reverse;
				padding-bottom: 20px;
				padding-top: 0;
			}

			.state-item {
				display: flex;
				align-items: center;
				justify-content: center;
				width: var(--state-item-size);
				height: var(--state-item-size);
				border-radius: var(--state-border-radius);
				transition: all 0.2s ease;
				position: relative;
				z-index: 1;
				border: none;
			}

			.state-item:hover {
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			}

			.state-icon {
				--mdc-icon-size: var(--state-icon-size);
				transition: color 0.2s ease;
				color: var(--primary-text-color);
			}

			.state-icon.on {
				color: var(--primary-color);
			}

			.state-icon.off {
				color: var(--secondary-text-color);
			}

			.invalid-entity {
				color: var(--error-color);
				font-size: 10px;
				text-align: center;
			}

			/* Material-You Theme Compatibility */
			@media (prefers-color-scheme: dark) {
				ha-card {
					background: var(
						--card-background-color,
						var(--ha-card-background, #1f1f1f)
					);
				}

				.icon-background {
					opacity: 0.3;
				}
			}

			/* Responsive adjustments */
			@media (max-width: 768px) {
				.container {
					padding: 12px 6px 12px 12px;
					height: 176px; /* 200px - 24px padding = 176px */
				}

				.states {
					height: 176px;
					padding-top: 0;
					gap: 8px;
				}

				.states.reverse-order {
					padding-top: 0;
					padding-bottom: 0;
				}

				:host {
					--icon-size: 60px;
					--icon-background-size: 140px;
					--state-item-size: 38px;
					--state-icon-size: 1.4rem;
				}
			}
		`;
	}
}

customElements.define('room-card-minimalist', RoomCard);

console.log(
	`%c RoomCardMinimalist %c ${packageInfo.version}`,
	'color: white; background: #039be5; font-weight: 700;',
	'color: #039be5; background: white; font-weight: 700;'
);
