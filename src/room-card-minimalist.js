import { LitElement, html, css } from 'lit-element';
import packageInfo from '../package.json';

// UI-Lovelace-Minimalist kompatible Templates
const COLOR_TEMPLATES = {
	// Basic Templates
	blue_no_state: {
		icon_color: 'rgba(var(--color-blue, 3, 155, 229),1)',
		background_color: 'rgba(var(--color-blue, 3, 155, 229), 0.2)',
		text_color: 'rgba(var(--color-blue-text, 3, 155, 229),1)',
	},
	red_no_state: {
		icon_color: 'rgba(var(--color-red, 244, 67, 54),1)',
		background_color: 'rgba(var(--color-red, 244, 67, 54), 0.2)',
		text_color: 'rgba(var(--color-red-text, 244, 67, 54),1)',
	},
	green_no_state: {
		icon_color: 'rgba(var(--color-green, 76, 175, 80),1)',
		background_color: 'rgba(var(--color-green, 76, 175, 80), 0.2)',
		text_color: 'rgba(var(--color-green-text, 76, 175, 80),1)',
	},
	yellow_no_state: {
		icon_color: 'rgba(var(--color-yellow, 255, 193, 7),1)',
		background_color: 'rgba(var(--color-yellow, 255, 193, 7), 0.2)',
		text_color: 'rgba(var(--color-yellow-text, 255, 193, 7),1)',
	},
	purple_no_state: {
		icon_color: 'rgba(var(--color-purple, 156, 39, 176),1)',
		background_color: 'rgba(var(--color-purple, 156, 39, 176), 0.2)',
		text_color: 'rgba(var(--color-purple-text, 156, 39, 176),1)',
	},
	orange_no_state: {
		icon_color: 'rgba(var(--color-orange, 255, 152, 0),1)',
		background_color: 'rgba(var(--color-orange, 255, 152, 0), 0.2)',
		text_color: 'rgba(var(--color-orange-text, 255, 152, 0),1)',
	},
	pink_no_state: {
		icon_color: 'rgba(var(--color-pink, 233, 30, 99),1)',
		background_color: 'rgba(var(--color-pink, 233, 30, 99), 0.2)',
		text_color: 'rgba(var(--color-pink-text, 233, 30, 99),1)',
	},

	// State-based Templates
	red_on: {
		icon_color: 'rgba(var(--color-red, 244, 67, 54),1)',
		background_color: 'rgba(var(--color-red, 244, 67, 54), 0.2)',
		text_color: 'rgba(var(--color-red-text, 244, 67, 54),1)',
	},
	red_off: {
		icon_color: 'rgba(var(--color-red, 244, 67, 54), 0.4)',
		background_color: 'rgba(var(--color-red, 244, 67, 54), 0.1)',
		text_color: 'rgba(var(--color-red-text, 244, 67, 54), 0.4)',
	},
	green_on: {
		icon_color: 'rgba(var(--color-green, 76, 175, 80),1)',
		background_color: 'rgba(var(--color-green, 76, 175, 80), 0.2)',
		text_color: 'rgba(var(--color-green-text, 76, 175, 80),1)',
	},
	green_off: {
		icon_color: 'rgba(var(--color-green, 76, 175, 80), 0.4)',
		background_color: 'rgba(var(--color-green, 76, 175, 80), 0.1)',
		text_color: 'rgba(var(--color-green-text, 76, 175, 80), 0.4)',
	},
	blue_on: {
		icon_color: 'rgba(var(--color-blue, 3, 155, 229),1)',
		background_color: 'rgba(var(--color-blue, 3, 155, 229), 0.2)',
		text_color: 'rgba(var(--color-blue-text, 3, 155, 229),1)',
	},
	blue_off: {
		icon_color: 'rgba(var(--color-blue, 3, 155, 229), 0.4)',
		background_color: 'rgba(var(--color-blue, 3, 155, 229), 0.1)',
		text_color: 'rgba(var(--color-blue-text, 3, 155, 229), 0.4)',
	},
	yellow_on: {
		icon_color: 'rgba(var(--color-yellow, 255, 193, 7),1)',
		background_color: 'rgba(var(--color-yellow, 255, 193, 7), 0.2)',
		text_color: 'rgba(var(--color-yellow-text, 255, 193, 7),1)',
	},
	yellow_off: {
		icon_color: 'rgba(var(--color-yellow, 255, 193, 7), 0.4)',
		background_color: 'rgba(var(--color-yellow, 255, 193, 7), 0.1)',
		text_color: 'rgba(var(--color-yellow-text, 255, 193, 7), 0.4)',
	},
	purple_on: {
		icon_color: 'rgba(var(--color-purple, 156, 39, 176),1)',
		background_color: 'rgba(var(--color-purple, 156, 39, 176), 0.2)',
		text_color: 'rgba(var(--color-purple-text, 156, 39, 176),1)',
	},
	purple_off: {
		icon_color: 'rgba(var(--color-purple, 156, 39, 176), 0.4)',
		background_color: 'rgba(var(--color-purple, 156, 39, 176), 0.1)',
		text_color: 'rgba(var(--color-purple-text, 156, 39, 176), 0.4)',
	},
	orange_on: {
		icon_color: 'rgba(var(--color-orange, 255, 152, 0),1)',
		background_color: 'rgba(var(--color-orange, 255, 152, 0), 0.2)',
		text_color: 'rgba(var(--color-orange-text, 255, 152, 0),1)',
	},
	orange_off: {
		icon_color: 'rgba(var(--color-orange, 255, 152, 0), 0.4)',
		background_color: 'rgba(var(--color-orange, 255, 152, 0), 0.1)',
		text_color: 'rgba(var(--color-orange-text, 255, 152, 0), 0.4)',
	},
	pink_on: {
		icon_color: 'rgba(var(--color-pink, 233, 30, 99),1)',
		background_color: 'rgba(var(--color-pink, 233, 30, 99), 0.2)',
		text_color: 'rgba(var(--color-pink-text, 233, 30, 99),1)',
	},
	pink_off: {
		icon_color: 'rgba(var(--color-pink, 233, 30, 99), 0.4)',
		background_color: 'rgba(var(--color-pink, 233, 30, 99), 0.1)',
		text_color: 'rgba(var(--color-pink-text, 233, 30, 99), 0.4)',
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
		this._clickTimer = null;
		this._holdTimeout = null;
		this._holdFired = false;
		this._hasMoved = false;
	}

	// Called by HAAS when config is changed
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
			entities: [],
			max_entities: 4,
			show_background_circle: true,
			background_circle_color: 'var(--accent-color)',
			...config,
		};
	}

	// Called by HAAS
	updated(changedProps) {
		super.updated(changedProps);
		if (!this._config || !this.hass) {
			return;
		}

		this._tryConnect(this._config.secondary);
	}

	// Called by HAAS
	connectedCallback() {
		super.connectedCallback();
		this._tryConnect(this._config.secondary);
	}

	// Called by HAAS
	disconnectedCallback() {
		this._tryDisconnect();
	}

	// Register our custom editor
	static getConfigElement() {
		return document.createElement('room-card-minimalist-editor');
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
			};
		}
		return {
			background_circle_color:
				this._config.background_circle_color || 'var(--accent-color)',
			icon_color: this._config.icon_color || 'rgb(var(--rgb-white))',
		};
	}

	// The render() function of a LitElement returns the HTML of your card, and any time one or the
	// properties defined above are updated, the correct parts of the rendered html are magically
	// replaced with the new values.  Check https://lit.dev for more info.
	render() {
		const secondary = this._getValueRawOrTemplate(this._config.secondary);
		const maxEntities = this._config.max_entities || 4;
		const entitiesToShow = this._config.entities.slice(0, maxEntities);

		const { background_circle_color, icon_color } = this._applyCardTemplate();

		return html`
			<ha-card
				@click=${this._handleAction}
				@pointerdown=${this._handleHoldAction}
			>
				<div class="container">
					<div class="content-left">
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

						<div class="text-content">
							<span class="primary">${this._config.name}</span>
							${secondary
								? html`<span class="secondary">${secondary}</span>`
								: ''}
						</div>
					</div>

					<div class="content-right">
						<div class="states">
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
		const templates = state === 'on' ? item.templates_on : item.templates_off;
		let result = {
			icon_color:
				item.color_on || item.color_off || 'var(--primary-text-color)',
			background_color:
				item.background_color_on ||
				item.background_color_off ||
				'var(--disabled-color)',
			text_color: 'var(--primary-text-color)',
		};

		if (templates && Array.isArray(templates)) {
			templates.forEach((template) => {
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

		const icon = stateIsOn
			? item.icon
			: item.icon_off
			? item.icon_off
			: item.icon;
		const iconClass = !stateIsOn ? 'off' : 'on';

		return html`
			<div class="state-item" style="background-color: ${background_color}">
				<ha-icon
					class="state-icon ${iconClass}"
					.icon=${icon}
					style="color: ${icon_color}"
				/>
			</div>
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

	// Handle holding
	_handleHoldAction(e) {
		e.preventDefault();
		this._holdFired = false;
		this._hasMoved = false;

		this._holdTimeout = setTimeout(() => {
			if (window.isScrolling || this._hasMoved) return;
			this._holdFired = true;

			if (this._config?.double_tap_action) {
				this._handleActionEvent('hold');
			}
		}, 300);

		const cleanup = () => {
			clearTimeout(this._holdTimeout);
			this._holdTimeout = null;
			this._holdFired = false;

			this.removeEventListener('pointerup', endHandler);
			this.removeEventListener('pointercancel', endHandler);
			document.removeEventListener('pointerup', endHandler);
			document.removeEventListener('scroll', scrollHandler);
		};

		const endHandler = (e) => {
			e.preventDefault();
			cleanup();
		};

		const scrollHandler = () => {
			this._hasMoved = true;
			cleanup();
		};

		this.addEventListener('pointerup', endHandler, { once: true });
		this.addEventListener('pointercancel', endHandler, { once: true });
		document.addEventListener('pointerup', endHandler, { once: true });
		document.addEventListener('scroll', scrollHandler, { once: true });
	}

	// Handle tap or double tap
	_handleAction(e) {
		if (window.isScrolling || this._hasMoved) return;
		e.preventDefault();

		// If hold was fired, don't fire tap
		if (this._holdFired) {
			return;
		}

		// If double tap is not enabled, just fire a tap event
		if (!this._config?.double_tap_action) {
			this.forwardHaptic('light');
			this._handleActionEvent('tap');
			return;
		}

		if (this._clickTimer == null) {
			this._clickTimer = setTimeout(() => {
				this.forwardHaptic('light');
				this._handleActionEvent('tap');
				this._clickTimer = null;
			}, 200);
		} else {
			clearTimeout(this._clickTimer);
			this._handleActionEvent('double_tap');
			this._clickTimer = null;
		}
	}

	_handleActionEvent(action) {
		const config = {};
		if (this._config?.action) {
			config.tap_action = this._config.action;
		}

		if (this._config?.double_tap_action) {
			config.double_tap_action = this._config.double_tap_action;
		} else {
			config.double_tap_action = config.tap_action;
		}

		if (this._config?.hold_action) {
			config.hold_action = this._config.hold_action;
		}

		this._fireEvent(this, 'hass-action', {
			config: config,
			action: action,
		});
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
				--icon-size: 2.5rem;
				--icon-background-size: 3.5rem;
				--state-icon-size: 1.2rem;
				--state-item-size: 2rem;
				--card-primary-font-size: 16px;
				--card-primary-font-weight: 600;
				--card-primary-line-height: 1.3;
				--card-secondary-font-weight: 400;
				--card-secondary-font-size: 12px;
				--card-secondary-line-height: 1.2;
				--spacing: 8px;
				--border-radius: 12px;
				--state-border-radius: 50%;
			}

			ha-card {
				border-radius: var(--border-radius);
				background: var(--card-background-color);
				box-shadow: var(--material-shadow-elevation-2);
				transition: all 0.3s ease;
				overflow: hidden;
				position: relative;
				z-index: 1;
			}

			ha-card:hover {
				cursor: pointer;
				box-shadow: var(--material-shadow-elevation-4);
				transform: translateY(-2px);
			}

			.container {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 16px;
				min-height: 72px;
				position: relative;
				z-index: 2;
			}

			.content-left {
				display: flex;
				align-items: center;
				gap: 12px;
				flex: 1;
				min-width: 0;
			}

			.icon-container {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
			}

			.icon-background {
				position: absolute;
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

			.text-content {
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-width: 0;
				flex: 1;
			}

			.primary {
				font-weight: var(--card-primary-font-weight);
				font-size: var(--card-primary-font-size);
				line-height: var(--card-primary-line-height);
				color: var(--primary-text-color);
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				margin-bottom: 2px;
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
				gap: 8px;
				align-items: center;
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
			}

			.state-item:hover {
				transform: scale(1.1);
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			}

			.state-icon {
				--mdc-icon-size: var(--state-icon-size);
				transition: color 0.2s ease;
			}

			.state-icon.on {
				color: var(--state-icon-color);
			}

			.state-icon.off {
				color: var(--state-icon-color-off);
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
					padding: 12px;
					min-height: 64px;
				}

				:host {
					--icon-size: 2rem;
					--icon-background-size: 3rem;
					--state-item-size: 1.8rem;
					--state-icon-size: 1rem;
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
