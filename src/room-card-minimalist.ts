/**
 * Room Card Minimalist
 * A minimalist room card for Home Assistant Lovelace UI
 */

import { LitElement, html, PropertyValues, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import packageInfo from '../package.json';

// Types
import type {
	HomeAssistant,
	RoomCardConfig,
	RoomCardInternalConfig,
	EntityConfig,
	StandardEntityConfig,
	ColorTemplateName,
	ActionsConfig,
} from './types';

// Constants
import { getRandomColorTemplate, MAX_ENTITIES } from './constants';

// Services
import {
	processConfig,
	TemplateService,
	createTemplateService,
	isClickable,
	isEntityItemClickable,
} from './services';

// Utils
import {
	applyCardTemplate,
	ActionController,
	getEntityStateResult,
	applyEntityTemplates,
	getFinalColors,
	getEntityIcon,
	renderEntityItem,
	renderInvalidEntity,
	isTemplate,
} from './utils';

// Styles
import { cardStyles } from './styles';

/**
 * RoomCard - Main card component
 * Displays a room with icon, name, secondary info, and up to 4 entity state indicators
 */
export class RoomCard extends LitElement {
	/**
	 * Home Assistant instance - updated by HA whenever state changes
	 */
	@property({ attribute: false })
	hass: HomeAssistant | undefined;

	/**
	 * Internal card configuration with defaults applied
	 */
	@state()
	private _config: RoomCardInternalConfig | undefined;

	/**
	 * Template results update counter - triggers re-renders when templates update
	 */
	@state()
	private _templateResultsVersion = 0;

	/**
	 * Template service for managing subscriptions
	 */
	private _templateService: TemplateService = createTemplateService();

	/**
	 * Action controller for handling tap/hold events
	 */
	private _actionController: ActionController = new ActionController(this);

	/**
	 * Static styles for the card
	 */
	static override styles = cardStyles;

	/**
	 * Card size for Home Assistant masonry layout
	 * Returns 4 (4 * 50px = 200px)
	 */
	getCardSize(): number {
		return 4;
	}

	/**
	 * Grid options for sections view layout
	 */
	getGridOptions(): {
		columns: number;
		min_columns: number;
		max_columns: number;
		rows: number;
		min_rows: number;
		max_rows: number;
	} {
		return {
			columns: 6,
			min_columns: 6,
			max_columns: 12,
			rows: 4,
			min_rows: 4,
			max_rows: 4,
		};
	}

	/**
	 * Register the visual config editor component
	 */
	static getConfigElement(): HTMLElement {
		return document.createElement('room-card-minimalist-editor');
	}

	/**
	 * Provide stub config for card preview
	 */
	static getStubConfig(): RoomCardConfig {
		const randomTemplate = getRandomColorTemplate() as ColorTemplateName;

		return {
			type: 'custom:room-card-minimalist',
			name: 'Living Room',
			icon: 'mdi:sofa',
			card_template: randomTemplate,
			secondary: '22.5°C',
			background_type: 'color',
			tap_action: { action: 'none' },
			hold_action: { action: 'none' },
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

	constructor() {
		super();
		// Set up template service callback to trigger re-renders
		this._templateService.setUpdateCallback(() => {
			this._templateResultsVersion++;
		});
	}

	/**
	 * Called by Home Assistant when config is updated
	 */
	setConfig(config: RoomCardConfig): void {
		this._templateService.unsubscribeAll();
		this._config = processConfig(config);
		this._templateService.setConfig(this._config);
	}

	/**
	 * Lifecycle: Called when properties change
	 */
	protected override updated(changedProps: PropertyValues): void {
		super.updated(changedProps);
		if (!this._config || !this.hass) return;

		this._templateService.setHass(this.hass);
		this._subscribeTemplates();
	}

	/**
	 * Lifecycle: Called when element is added to DOM
	 */
	override connectedCallback(): void {
		super.connectedCallback();
		if (this.hass) {
			this._templateService.setHass(this.hass);
		}
		this._subscribeTemplates();
	}

	/**
	 * Lifecycle: Called when element is removed from DOM
	 */
	override disconnectedCallback(): void {
		this._templateService.unsubscribeAll();
		super.disconnectedCallback();
	}

	/**
	 * Subscribe to all templates used in config
	 */
	private _subscribeTemplates(): void {
		if (!this._config) return;

		// Subscribe to secondary template
		if (this._config.secondary) {
			this._templateService.subscribe(this._config.secondary);
		}
		// Subscribe to secondary_color template
		if (this._config.secondary_color) {
			this._templateService.subscribe(this._config.secondary_color);
		}
		// Subscribe to tertiary template
		if (this._config.tertiary) {
			this._templateService.subscribe(this._config.tertiary);
		}
		// Subscribe to tertiary_color template
		if (this._config.tertiary_color) {
			this._templateService.subscribe(this._config.tertiary_color);
		}
		// Subscribe to background_image template
		if (this._config.background_image) {
			this._templateService.subscribe(this._config.background_image);
		}
		// Subscribe to background_circle_color template
		if (this._config.background_circle_color) {
			this._templateService.subscribe(this._config.background_circle_color);
		}
		// Subscribe to icon_color template
		if (this._config.icon_color) {
			this._templateService.subscribe(this._config.icon_color);
		}
		// Subscribe to entity templates (value/template/color/icon/background_color)
		for (const entity of this._config.entities) {
			// value template
			if (entity.show_value && entity.value_template) {
				this._templateService.subscribe(entity.value_template);
			}

			// subscribe to any templated color/icon fields on the entity
			for (const key of Object.keys(entity)) {
				const val = (entity as any)[key];
				if (typeof val === 'string' && isTemplate(val)) {
					this._templateService.subscribe(val);
				}
			}
		}
	}

	/**
	 * Get value - either from template result or raw
	 */
	private _getValue(item: string | undefined): string | undefined {
		return this._templateService.getEntityOrTemplateValue(item);
	}

	/**
	 * Get raw value or template result
	 */
	private _getValueRawOrTemplate(item: string | undefined): string | undefined {
		return this._templateService.getValue(item);
	}

	/**
	 * Main render method
	 */
	protected override render(): TemplateResult | typeof nothing {
		if (!this._config) return nothing;

		const secondary = this._getValueRawOrTemplate(this._config.secondary);
		const secondaryColor = this._getValueRawOrTemplate(this._config.secondary_color);
		const tertiary = this._getValueRawOrTemplate(this._config.tertiary);
		const tertiaryColor = this._getValueRawOrTemplate(this._config.tertiary_color);
		let entitiesToShow = this._config.entities.slice(0, MAX_ENTITIES);

		if (this._config.entities_reverse_order) {
			entitiesToShow = [...entitiesToShow].reverse();
		}

		const backgroundCircleColor = this._getValueRawOrTemplate(
			this._config.background_circle_color
		);

		// Evaluate icon color (might be a template)
		const iconColorOverride = this._getValueRawOrTemplate(this._config.icon_color);

		const cardColors = applyCardTemplate(
			this._config.card_template,
			iconColorOverride,
			backgroundCircleColor
		);

		const titleColor = this._config.use_template_color_for_title
			? this._getValueRawOrTemplate(cardColors.text_color)
			: 'var(--primary-text-color)';
		const finalSecondaryColor = this._config.use_template_color_for_secondary
			? this._getValueRawOrTemplate(cardColors.text_color)
			: secondaryColor;
		const finalTertiaryColor = this._config.use_template_color_for_tertiary
			? this._getValueRawOrTemplate(cardColors.text_color)
			: tertiaryColor;

		const isCardClickable = isClickable(this._config);
		const isSecondaryClickable = this._isSecondaryClickable();
		const isTertiaryClickable = this._isTertiaryClickable();

		// Create handlers for card, secondary, and tertiary
		const cardHandlers = isCardClickable
			? this._actionController.createHandlers(this._config, {
					ignoreSelector: '.state-item, .secondary.clickable, .tertiary.clickable',
				})
			: null;
		const secondaryHandlers = isSecondaryClickable
			? this._actionController.createHandlers(this._getSecondaryConfig())
			: null;
		const tertiaryHandlers = isTertiaryClickable
			? this._actionController.createHandlers(this._getTertiaryConfig())
			: null;

		return html`
			<ha-card
				@click=${cardHandlers?.onClick}
				@dblclick=${cardHandlers?.onDblClick}
				@mousedown=${cardHandlers?.onMouseDown}
				@mouseup=${cardHandlers?.onMouseUp}
				@mouseleave=${cardHandlers?.onMouseLeave}
				@touchstart=${cardHandlers?.onTouchStart}
				@touchend=${cardHandlers?.onTouchEnd}
				@contextmenu=${cardHandlers?.onContextMenu}
				.config=${this._config}
				class="${isCardClickable ? 'clickable' : 'non-clickable'}"
				tabindex="${isCardClickable ? '0' : '-1'}"
			>
				<div class="container">
					<div class="content-main">
						<div class="text-content">
							<span class="primary" style="color: ${titleColor}"
								>${this._config.name}</span
							>
							${this._renderSecondary(
								secondary,
								finalSecondaryColor,
								isSecondaryClickable,
								secondaryHandlers
							)}
							${this._renderTertiary(
								tertiary,
								finalTertiaryColor,
								isTertiaryClickable,
								tertiaryHandlers
							)}
						</div>
						${this._renderIconContainer(cardColors)}
					</div>
					<div class="content-right">
						<div
							class="states ${this._config.entities_reverse_order
								? 'states-reverse'
								: ''}"
						>
							${entitiesToShow.map((item) => this._renderItem(item))}
						</div>
					</div>
				</div>
			</ha-card>
		`;
	}

	/**
	 * Render secondary text element
	 */
	private _renderSecondary(
		secondary: string | undefined,
		color: string | undefined,
		isClickable: boolean,
		handlers: ReturnType<ActionController['createHandlers']> | null
	): TemplateResult | string {
		if (!secondary) return '';

		const content = this._config?.secondary_allow_html ? unsafeHTML(secondary) : secondary;

		return html`
			<span
				class="secondary ${isClickable ? 'clickable' : ''}"
				style="color: ${color}"
				@click=${handlers?.onClick}
				@dblclick=${handlers?.onDblClick}
				@mousedown=${handlers?.onMouseDown}
				@mouseup=${handlers?.onMouseUp}
				@mouseleave=${handlers?.onMouseLeave}
				@touchstart=${handlers?.onTouchStart}
				@touchend=${handlers?.onTouchEnd}
				@contextmenu=${handlers?.onContextMenu}
				tabindex="${isClickable ? '0' : '-1'}"
				>${content}</span
			>
		`;
	}

	/**
	 * Render tertiary text element
	 */
	private _renderTertiary(
		tertiary: string | undefined,
		color: string | undefined,
		isClickable: boolean,
		handlers: ReturnType<ActionController['createHandlers']> | null
	): TemplateResult | string {
		if (!tertiary) return '';

		const content = this._config?.tertiary_allow_html ? unsafeHTML(tertiary) : tertiary;

		return html`
			<span
				class="tertiary ${isClickable ? 'clickable' : ''}"
				style="color: ${color}"
				@click=${handlers?.onClick}
				@dblclick=${handlers?.onDblClick}
				@mousedown=${handlers?.onMouseDown}
				@mouseup=${handlers?.onMouseUp}
				@mouseleave=${handlers?.onMouseLeave}
				@touchstart=${handlers?.onTouchStart}
				@touchend=${handlers?.onTouchEnd}
				@contextmenu=${handlers?.onContextMenu}
				tabindex="${isClickable ? '0' : '-1'}"
				>${content}</span
			>
		`;
	}

	/**
	 * Render icon container with background
	 */
	private _renderIconContainer(colors: ReturnType<typeof applyCardTemplate>): TemplateResult {
		const shouldUseImage = this._shouldUseBackgroundImage();
		const imageUrl = this._getBackgroundImageUrl();
		const hasImage = shouldUseImage && imageUrl;

		return html`
			<div class="icon-container">
				${this._config?.background_type !== 'none'
					? hasImage
						? html`
								<div
									class="icon-background icon-background-image ${this._config
										?.background_image_square
										? 'icon-background-square'
										: ''}"
									style="background-image: url('${imageUrl}');"
								></div>
							`
						: html`
								<div
									class="icon-background"
									style="background-color: ${this._getValueRawOrTemplate(
										colors.background_color
									)}"
								></div>
							`
					: ''}
				${!hasImage
					? html`
							<div
								class="icon"
								style="--icon-color: ${this._getValueRawOrTemplate(
									colors.icon_color
								)};"
							>
								<ha-icon .icon=${this._config?.icon} />
							</div>
						`
					: ''}
			</div>
		`;
	}

	/**
	 * Render entity state item
	 */
	private _renderItem(item: EntityConfig): TemplateResult {
		if (item.type !== 'entity' && item.type !== 'template') {
			return renderInvalidEntity(this.hass);
		}

		const stateResult = getEntityStateResult(item, this.hass, (i) => this._getValue(i));
		const { isOn, currentHvacMode, currentEntityState, stateValue } = stateResult;

		// Resolve any templated color/icon fields on the entity before applying templates
		const resolvedItem = this._resolveEntityTemplateFields(item);

		const baseColors = applyEntityTemplates(
			resolvedItem,
			isOn ? 'on' : 'off',
			currentHvacMode,
			currentEntityState
		);

		const { iconColor, backgroundColor } = getFinalColors(
			resolvedItem,
			isOn,
			baseColors,
			this.hass
		);
		const icon = getEntityIcon(resolvedItem, isOn, currentHvacMode, currentEntityState);

		// Get display value if show_value is enabled
		let displayValue: string | undefined;
		if (item.show_value) {
			if (item.value_template) {
				// Use value_template if provided
				displayValue = this._getValueRawOrTemplate(item.value_template);
			} else if (item.type === 'entity') {
				// Use entity state directly for entity type
				const entityItem = item as StandardEntityConfig;
				const entityState = this.hass?.states[entityItem.entity];
				displayValue = entityState?.state;
			} else if (item.type === 'template') {
				// Use stateValue (template result) for template type
				displayValue = stateValue;
			}
		}

		const handlers = isEntityItemClickable(item)
			? this._actionController.createHandlers(item as ActionsConfig)
			: null;

		return renderEntityItem(
			item,
			handlers,
			iconColor,
			backgroundColor,
			icon,
			isOn,
			displayValue
		);
	}

	// ==================== Helper Methods ====================

	/**
	 * Resolve templated fields on an entity (colors/icons) to their evaluated values
	 */
	private _resolveEntityTemplateFields(entity: EntityConfig): EntityConfig {
		const copy: any = { ...entity };
		for (const key of Object.keys(entity)) {
			// Only resolve color and icon related keys
			if (
				key.startsWith('color_') ||
				key.startsWith('background_color_') ||
				key === 'color_on' ||
				key === 'color_off' ||
				key === 'background_color_on' ||
				key === 'background_color_off' ||
				key.startsWith('icon_')
			) {
				const val = (entity as any)[key];
				if (typeof val === 'string') {
					const resolved = this._getValueRawOrTemplate(val);
					if (resolved !== undefined) copy[key] = resolved;
				}
			}
		}
		return copy as EntityConfig;
	}
	/**
	 * Check if secondary text should be clickable
	 */
	private _isSecondaryClickable(): boolean {
		if (!this._config?.secondary || !this._config.secondary_entity) return false;
		return isClickable({
			entity: this._config.secondary_entity,
			tap_action: this._config.secondary_tap_action,
			hold_action: this._config.secondary_hold_action,
			double_tap_action: this._config.secondary_double_tap_action,
		});
	}

	/**
	 * Get secondary action config
	 */
	private _getSecondaryConfig(): ActionsConfig {
		return {
			entity: this._config?.secondary_entity,
			tap_action: this._config?.secondary_tap_action,
			hold_action: this._config?.secondary_hold_action,
			double_tap_action: this._config?.secondary_double_tap_action,
		};
	}

	/**
	 * Check if tertiary text should be clickable
	 */
	private _isTertiaryClickable(): boolean {
		if (!this._config?.tertiary || !this._config.tertiary_entity) return false;
		return isClickable({
			entity: this._config.tertiary_entity,
			tap_action: this._config.tertiary_tap_action,
			hold_action: this._config.tertiary_hold_action,
			double_tap_action: this._config.tertiary_double_tap_action,
		});
	}

	/**
	 * Get tertiary action config
	 */
	private _getTertiaryConfig(): ActionsConfig {
		return {
			entity: this._config?.tertiary_entity,
			tap_action: this._config?.tertiary_tap_action,
			hold_action: this._config?.tertiary_hold_action,
			double_tap_action: this._config?.tertiary_double_tap_action,
		};
	}

	/**
	 * Get background image URL
	 */
	private _getBackgroundImageUrl(): string | null {
		if (!this._config) return null;

		if (this._config.background_type === 'person' && this._config.background_person_entity) {
			const personEntity = this.hass?.states[this._config.background_person_entity];
			if (personEntity?.attributes?.entity_picture) {
				let entityPicture = personEntity.attributes.entity_picture as string;
				if (entityPicture.startsWith('http')) return entityPicture;
				if (!entityPicture.startsWith('/')) entityPicture = `/${entityPicture}`;
				return `${window.location.origin}${entityPicture}`;
			}
		}

		if (this._config.background_type === 'image' && this._config.background_image) {
			return this._getValueRawOrTemplate(this._config.background_image) || null;
		}

		return null;
	}

	/**
	 * Check if background image should be used
	 */
	private _shouldUseBackgroundImage(): boolean {
		return (
			this._config?.background_type === 'image' || this._config?.background_type === 'person'
		);
	}
}

// Register the custom element
customElements.define('room-card-minimalist', RoomCard);

// Log version info
console.log(
	`%c RoomCardMinimalist %c ${packageInfo.version}`,
	'color: white; background: #039be5; font-weight: 700;',
	'color: #039be5; background: white; font-weight: 700;'
);

// Declare global for Home Assistant custom card registration
declare global {
	interface HTMLElementTagNameMap {
		'room-card-minimalist': RoomCard;
	}
}
