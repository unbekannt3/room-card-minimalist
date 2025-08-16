import { LitElement, html, css } from 'lit-element';
import packageInfo from '../package.json';

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
	// distribute all cards over the available columns (https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-masonry-view).
	getCardSize() {
		// Card height is 200px, so return 4 (4 * 50px = 200px)
		return 4;
	}

	// Grid options for sections view - card takes specific size based on design
	getGridOptions() {
		return {
			columns: 6, // Default to 6 columns (multiple of 3 as recommended)
			min_columns: 6, // Minimum 6 columns for proper layout
			max_columns: 12, // Can expand to full width
			rows: 4, // Default to 4 rows (4 * 56px + gaps ≈ 200px)
			min_rows: 4, // Fixed height, minimum 4 rows
			max_rows: 4, // Fixed height, maximum 4 rows
		};
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
			secondary: '',
			secondary_color: 'var(--secondary-text-color)',
			entities: [],
			background_type: migratedBackgroundType,
			background_image: '',
			background_person_entity: '',
			background_image_square: false,
			entities_reverse_order: false,
			use_template_color_for_title: false,
			use_template_color_for_secondary: false,
			...config,
		};

		// Clean up old properties
		delete this._config.show_background_circle;
		delete this._config.use_background_image;
		delete this._config.background_settings;
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
		this._tryConnect(this._config?.secondary);
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
		// Pick a random color template
		const availableTemplates = Object.keys(COLOR_TEMPLATES);
		const randomTemplate =
			availableTemplates[Math.floor(Math.random() * availableTemplates.length)];

		return {
			name: 'Living Room',
			icon: 'mdi:sofa',
			card_template: randomTemplate,
			secondary: '22.5°C',
			background_type: 'color',
			tap_action: {
				action: 'none',
			},
			hold_action: {
				action: 'none',
			},
			use_template_color_for_title: true,
			use_template_color_for_secondary: true,
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

	_applyCardTemplate() {
		if (this._config.card_template && COLOR_TEMPLATES[this._config.card_template]) {
			const template = COLOR_TEMPLATES[this._config.card_template];
			return {
				background_circle_color:
					(this._config.background_circle_color &&
						this._config.background_circle_color.trim()) ||
					template.background_color,
				icon_color:
					(this._config.icon_color && this._config.icon_color.trim()) ||
					template.icon_color,
				text_color: template.text_color,
			};
		}
		return {
			background_circle_color: this._config.background_circle_color || 'var(--accent-color)',
			icon_color: this._config.icon_color || 'rgb(var(--rgb-white))',
			text_color: 'var(--primary-text-color)',
		};
	}

	// The render() function of a LitElement returns the HTML of your card, and any time one or the
	// properties defined above are updated, the correct parts of the rendered html are magically
	// replaced with the new values.  Check https://lit.dev for more info.
	render() {
		const secondary = this._getValueRawOrTemplate(this._config.secondary);
		const secondaryColor = this._getValueRawOrTemplate(this._config.secondary_color);
		let entitiesToShow = this._config.entities.slice(0, 4);

		if (this._config.entities_reverse_order) {
			entitiesToShow = [...entitiesToShow].reverse();
		}

		const { background_circle_color, icon_color, text_color } = this._applyCardTemplate();

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
								? html`<span class="secondary" style="color: ${finalSecondaryColor}"
										>${secondary}</span
									>`
								: ''}
						</div>

						<div class="icon-container">
							${this._config.background_type !== 'none'
								? this._shouldUseBackgroundImage() && this._getBackgroundImageUrl()
									? html`
											<div
												class="icon-background icon-background-image ${this
													._config.background_image_square
													? 'icon-background-square'
													: ''}"
												style="background-image: url('${this._getBackgroundImageUrl()}');"
											></div>
										`
									: html`
											<div
												class="icon-background"
												style="background-color: ${this._getValueRawOrTemplate(
													background_circle_color
												)}"
											></div>
										`
								: ''}
							${!this._shouldUseBackgroundImage() || !this._getBackgroundImageUrl()
								? html`
										<div
											class="icon"
											style="--icon-color: ${this._getValueRawOrTemplate(
												icon_color
											)};"
										>
											<ha-icon .icon=${this._config.icon} />
										</div>
									`
								: ''}
						</div>
					</div>

					<div class="content-right">
						<div
							class="states ${this._config.entities_reverse_order
								? 'states-reverse'
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

	_isClimateEntity(entity) {
		return entity && entity.startsWith('climate.');
	}

	_applyTemplates(item, state, currentHvacMode = null) {
		if (this._isClimateEntity(item.entity) && currentHvacMode) {
			const modeTemplate = item[`template_${currentHvacMode}`];
			const modeColor = item[`color_${currentHvacMode}`];
			const modeBackgroundColor = item[`background_color_${currentHvacMode}`];

			let result = {
				icon_color: 'var(--primary-text-color)',
				background_color: 'var(--secondary-background-color)',
				text_color: 'var(--primary-text-color)',
			};

			if (modeTemplate && COLOR_TEMPLATES[modeTemplate]) {
				result = { ...result, ...COLOR_TEMPLATES[modeTemplate] };
			}

			if (modeColor) result.icon_color = modeColor;
			if (modeBackgroundColor) result.background_color = modeBackgroundColor;

			return result;
		}

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
			if (item.background_color_on) result.background_color = item.background_color_on;
		} else {
			if (item.color_off) result.icon_color = item.color_off;
			if (item.background_color_off) result.background_color = item.background_color_off;
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

	_handleCardMouseDown(e) {
		if (e.button !== 0) return; // Only left mouse button
		if (e.target.closest('.state-item')) return;
		this._startHoldTimer(() => this._fireHassAction(this._config, 'hold'));
	}

	_handleCardMouseUp() {
		this._clearHoldTimer();
	}

	_handleCardMouseLeave() {
		this._clearHoldTimer();
	}

	_handleCardTouchStart(e) {
		// Don't start hold timer if touching a state item
		if (e.target.closest('.state-item')) return;
		this._startHoldTimer(() => this._fireHassAction(this._config, 'hold'));
	}

	// Handle card touch end
	_handleCardTouchEnd() {
		this._clearHoldTimer();
	}

	_handleCardContextMenu(e) {
		e.preventDefault();
		e.stopPropagation();
		this._fireHassAction(this._config, 'hold');
	}

	_handleItemClick(e, item) {
		if (this._holdFired) {
			this._holdFired = false;
			return;
		}
		e.stopPropagation();
		this._fireHassAction(item, 'tap');
	}

	_handleItemMouseDown(e, item) {
		if (e.button !== 0) return;
		e.stopPropagation();
		this._startHoldTimer(() => this._fireHassAction(item, 'hold'));
	}

	_handleItemMouseUp() {
		this._clearHoldTimer();
	}

	_handleItemMouseLeave() {
		this._clearHoldTimer();
	}

	// Handle item touch start
	_handleItemTouchStart(e, item) {
		e.stopPropagation();
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

	_startHoldTimer(callback) {
		this._clearHoldTimer();
		this._holdFired = false;
		this._holdTimeout = setTimeout(() => {
			this._holdFired = true;
			callback();
		}, 500);
	}

	_clearHoldTimer() {
		if (this._holdTimeout) {
			clearTimeout(this._holdTimeout);
			this._holdTimeout = null;
		}
	}

	_fireHassAction(config, action) {
		const event = new Event('hass-action', {
			bubbles: true,
			composed: true,
		});

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

	_getDefaultAction(config) {
		if (!config.type) {
			return config.tap_action || { action: 'more-info' };
		}

		if (config.type === 'entity' && config.entity) {
			const domain = config.entity.split('.')[0];
			if (
				['light', 'switch', 'fan', 'automation', 'script', 'input_boolean'].includes(domain)
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
		let currentHvacMode = null;

		if (item.type === 'entity') {
			stateValue = this._getValue(item.entity);

			// Special handling for climate entities
			if (this._isClimateEntity(item.entity)) {
				const entityState = this.hass.states[item.entity];
				if (entityState && entityState.state) {
					currentHvacMode = entityState.state;
					// For climate entities, consider it "on" if not in "off" mode
					stateIsOn = currentHvacMode !== 'off';
				}
			} else {
				// Regular entity logic
				stateIsOn = stateValue == item.on_state;
			}
		} else if (item.type == 'template') {
			stateValue = this._getValue(item.condition);
			stateIsOn = stateValue != '';
		} else {
			return this._renderInvalidEntity();
		}

		const { icon_color, background_color } = this._applyTemplates(
			item,
			stateIsOn ? 'on' : 'off',
			currentHvacMode
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

		// Determine icon based on entity type and state
		let icon;
		if (this._isClimateEntity(item.entity) && currentHvacMode) {
			// For climate entities, use icon_off when in "off" mode, otherwise use main icon
			if (currentHvacMode === 'off' && item.icon_off) {
				icon = item.icon_off;
			} else {
				icon = item.icon;
			}
		} else {
			// For regular entities, use on/off logic
			icon = stateIsOn ? item.icon : item.icon_off ? item.icon_off : item.icon;
		}
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

		return this._isTemplate(item) ? this._templateResults[item]?.result?.toString() : item;
	}

	_getBackgroundImageUrl() {
		if (this._config.background_type === 'person' && this._config.background_person_entity) {
			const personEntity = this.hass.states[this._config.background_person_entity];
			if (personEntity && personEntity.attributes.entity_picture) {
				let entityPicture = personEntity.attributes.entity_picture;
				if (entityPicture.startsWith('http')) {
					return entityPicture;
				}

				// Ensure the path starts with / for local images
				if (!entityPicture.startsWith('/')) {
					entityPicture = `/${entityPicture}`;
				}
				// For non-admin users, try to use Home Assistant's image proxy for profile images
				if (entityPicture.includes('/api/image/serve/')) {
					return `${window.location.origin}${entityPicture}`;
				} else {
					// For other entity pictures, use them directly
					return `${window.location.origin}${entityPicture}`;
				}
			}
		}

		if (this._config.background_type === 'image' && this._config.background_image) {
			const imageUrl = this._getValueRawOrTemplate(this._config.background_image);
			return imageUrl;
		}

		return null;
	}

	_shouldUseBackgroundImage() {
		return (
			this._config.background_type === 'image' || this._config.background_type === 'person'
		);
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

	// Render invalid entity with localization
	_renderInvalidEntity() {
		const text = this.hass?.localize?.('ui.card.common.invalid_entity') || 'Invalid Entity';
		return html`<span class="invalid-entity">${text}</span>`;
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
				border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));

				/* Card shadows */
				box-shadow: var(--ha-card-box-shadow, var(--material-shadow-elevation-2));
				transition: box-shadow 0.3s ease;
				display: block;
				height: 236px;
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

			.icon-background-image {
				background-size: cover;
				background-position: center;
				background-repeat: no-repeat;
				opacity: 1 !important;
			}

			.icon-background-square {
				border-radius: var(--border-radius);
				width: 140px !important;
				height: 140px !important;
				left: -16px !important;
				top: -45px !important;
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

			.icon-background-image ~ .icon ha-icon {
				filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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

			.states-reverse {
				justify-content: flex-end;
				padding-top: 0;
				padding-bottom: 20px;
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
					background: var(--card-background-color, var(--ha-card-background, #1f1f1f));
				}

				.icon-background {
					opacity: 0.3;
				}
			}

			/* Responsive adjustments */
			@media (max-width: 768px) {
				:host {
					height: 200px;
					--icon-size: 60px;
					--icon-background-size: 140px;
					--state-item-size: 38px;
					--state-icon-size: 1.4rem;
				}

				.container {
					padding: 12px 6px 12px 12px;
					height: 176px; /* 200px - 24px padding = 176px */
				}

				.states {
					height: 176px;
					padding-top: 0;
					gap: 8px;
				}

				.states-reverse {
					padding-bottom: 0;
				}

				.icon-background-square {
					width: 115px !important;
					height: 115px !important;
					top: -45px !important;
					left: -13px !important;
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
