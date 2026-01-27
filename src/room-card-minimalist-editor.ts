/**
 * Room Card Minimalist Editor
 * Visual configuration editor for the Room Card Minimalist component
 */

import { LitElement, html, PropertyValues, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

// Types
import type {
	HomeAssistant,
	RoomCardConfig,
	RoomCardConfigWithLegacy,
	BackgroundType,
	EntityConfig,
	SchemaItem,
} from './types';

// Constants
import { getMultiStatePreset } from './constants';

// Localize
import { localize } from './localize/localize';

// Styles
import { editorStyles } from './styles';

// Editor modules
import { getEntitySchema, getMainSchema, type SchemaContext } from './editor';

// Extend Window interface for customCards
declare global {
	interface Window {
		customCards?: Array<{
			type: string;
			name: string;
			preview: boolean;
			description: string;
			documentationURL?: string;
		}>;
	}
}

/**
 * Room Card Minimalist Editor Component
 * Provides a visual editor for configuring the room card
 */
export class RoomCardEditor extends LitElement {
	/**
	 * Home Assistant instance - passed from HA
	 */
	@property({ attribute: false })
	hass: HomeAssistant | undefined;

	/**
	 * Card configuration
	 */
	@state()
	private _config: RoomCardConfig | undefined;

	/**
	 * Background type for reactive schema updates
	 */
	@state()
	private _backgroundType: BackgroundType | undefined;

	static override styles = editorStyles;

	/**
	 * Get the schema context for schema generators
	 */
	private _getSchemaContext(): SchemaContext {
		return {
			hass: this.hass,
			config: this._config,
		};
	}

	/**
	 * Dispatch config changed event
	 */
	private _dispatchConfigChanged(config: RoomCardConfig): void {
		this._config = config;
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config } }));
	}

	/**
	 * Set the card configuration
	 * Handles migration of legacy config properties
	 */
	setConfig(config: RoomCardConfigWithLegacy): void {
		// Migrate old config to new background_type system
		let migratedBackgroundType: BackgroundType | undefined = config.background_type;

		if (!migratedBackgroundType || migratedBackgroundType === ('' as BackgroundType)) {
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
		} as RoomCardConfig;

		// Clean up old properties
		delete (this._config as RoomCardConfigWithLegacy).show_background_circle;
		delete (this._config as RoomCardConfigWithLegacy).use_background_image;
		delete (this._config as RoomCardConfigWithLegacy).background_settings;

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

	protected override willUpdate(changedProps: PropertyValues): void {
		super.willUpdate(changedProps);

		// Update background type for reactive schema before render
		if (changedProps.has('_config') && this._config) {
			const newBackgroundType = this._config.background_type || 'color';
			if (this._backgroundType !== newBackgroundType) {
				this._backgroundType = newBackgroundType;
			}
		}
	}

	/**
	 * Delete a state entity at the given index
	 */
	private _deleteStateEntity(idx: number): void {
		if (!this._config) return;

		const entities = [...(this._config.entities || [])];
		entities.splice(idx, 1);

		this._dispatchConfigChanged({ ...this._config, entities });
	}

	/**
	 * Move a state entity up or down
	 */
	private _moveStateEntity(idx: number, pos: number): void {
		if (!this._config) return;

		const entities = [...(this._config.entities || [])];
		[entities[idx], entities[idx + pos]] = [entities[idx + pos], entities[idx]];

		this._dispatchConfigChanged({ ...this._config, entities });
	}

	/**
	 * Add a new state entity (template type by default)
	 */
	private _addEntityState(): void {
		if (!this._config) return;

		// Prevent adding more than 4 entities
		if (this._config.entities && this._config.entities.length >= 4) {
			return;
		}

		const entities = [...(this._config.entities || [])];
		entities.push({ type: 'template' } as EntityConfig);

		this._dispatchConfigChanged({ ...this._config, entities });
	}

	/**
	 * Get the icon for an entity configuration
	 */
	private _getEntityIcon(entity: EntityConfig): string {
		if (entity.type === 'template') {
			if (entity.icon) {
				return entity.icon;
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
				const domainIcons: Record<string, string> = {
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

	/**
	 * Get display name for an entity configuration
	 */
	private _getEntityDisplayName(entity: EntityConfig, index: number): string {
		const baseText =
			entity.type === 'template'
				? localize(this.hass, 'entity_type_template', 'Template')
				: localize(this.hass, 'entity_type_entity', 'Entity');

		if (entity.type === 'entity' && entity.entity && this.hass) {
			const entityObj = this.hass.states[entity.entity];
			if (entityObj && entityObj.attributes.friendly_name) {
				return `${baseText}: ${entityObj.attributes.friendly_name}`;
			}
			return `${baseText}: ${entity.entity}`;
		}

		return `${baseText} ${index + 1}`;
	}

	/**
	 * Handle main form value changes
	 */
	private _valueChanged(ev: CustomEvent): void {
		if (!this._config || !this.hass) {
			return;
		}

		const newConfig = ev.detail.value as RoomCardConfig;

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
		delete (newConfig as RoomCardConfigWithLegacy).background_settings;

		const event = new CustomEvent('config-changed', {
			detail: { config: newConfig },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Handle entity form value changes
	 */
	private _valueChangedEntity(entityIndex: number, ev: CustomEvent): void {
		if (!this._config || !this.hass) {
			return;
		}

		const entities = [...(this._config.entities || [])];
		const oldValue = entities[entityIndex];
		const newValue = ev.detail.value as EntityConfig;

		// Auto-fill custom_states when use_multi_state is enabled and custom_states is empty
		if (
			newValue.type === 'entity' &&
			newValue.use_multi_state &&
			(!oldValue || oldValue.type !== 'entity' || !oldValue.use_multi_state) &&
			(!newValue.custom_states || newValue.custom_states.trim() === '')
		) {
			const preset = getMultiStatePreset(newValue.entity);
			if (preset.length > 0) {
				(newValue as EntityConfig & { custom_states: string }).custom_states =
					preset.join(', ');
			}
		}

		entities[entityIndex] = newValue;

		this._config = { ...this._config, entities };

		const event = new CustomEvent('config-changed', {
			detail: { config: this._config },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	/**
	 * Get the first person entity from Home Assistant
	 */
	private _getFirstPersonEntity(): string {
		if (!this.hass || !this.hass.states) return '';

		const personEntities = Object.keys(this.hass.states)
			.filter((entityId) => entityId.startsWith('person.'))
			.sort();

		return personEntities.length > 0 ? personEntities[0] : '';
	}

	// ==================== Drag and Drop State ====================

	private _dragState: {
		isDragging: boolean;
		dragIndex: number;
		startY: number;
	} | null = null;

	// ==================== Mouse-based Drag and Drop Handlers ====================

	private _handleMouseDown(ev: MouseEvent, index: number): void {
		// Only handle left mouse button
		if (ev.button !== 0) return;

		ev.preventDefault();
		ev.stopPropagation();

		this._dragState = {
			isDragging: true,
			dragIndex: index,
			startY: ev.clientY,
		};

		const handle = ev.currentTarget as HTMLElement;
		const dragElement = handle?.closest('.box');
		if (dragElement) {
			dragElement.classList.add('dragging');
		}

		handle?.classList.add('dragging');
		this.classList.add('dragging');
		document.body.style.cursor = 'grabbing';

		// Add global listeners
		document.addEventListener('mousemove', this._boundMouseMove);
		document.addEventListener('mouseup', this._boundMouseUp);
	}

	private _boundMouseMove = (ev: MouseEvent): void => {
		if (!this._dragState?.isDragging) return;

		ev.preventDefault();

		// Find box under cursor
		const boxes = this.shadowRoot?.querySelectorAll('.box');
		if (!boxes) return;

		boxes.forEach((box, idx) => {
			const rect = box.getBoundingClientRect();
			if (
				ev.clientY >= rect.top &&
				ev.clientY <= rect.bottom &&
				idx !== this._dragState?.dragIndex
			) {
				box.classList.add('drag-over');
			} else {
				box.classList.remove('drag-over');
			}
		});
	};

	private _boundMouseUp = (ev: MouseEvent): void => {
		if (!this._dragState?.isDragging || !this._config) {
			this._cleanupDrag();
			return;
		}

		ev.preventDefault();

		// Find drop target
		const boxes = this.shadowRoot?.querySelectorAll('.box');
		let dropIndex = -1;

		boxes?.forEach((box, idx) => {
			const rect = box.getBoundingClientRect();
			if (ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
				dropIndex = idx;
			}
		});

		const dragIndex = this._dragState.dragIndex;

		// Clean up before state change
		this._cleanupDrag();

		// Perform reorder if valid
		if (dropIndex !== -1 && dropIndex !== dragIndex) {
			const entities = [...(this._config.entities || [])];
			const draggedEntity = entities[dragIndex];

			entities.splice(dragIndex, 1);
			entities.splice(dropIndex, 0, draggedEntity);

			this._dispatchConfigChanged({ ...this._config, entities });
		}
	};

	private _cleanupDrag(): void {
		this._dragState = null;

		this.shadowRoot?.querySelectorAll('.box').forEach((box) => {
			box.classList.remove('dragging', 'drag-over');
		});

		this.shadowRoot?.querySelectorAll('.drag-handle').forEach((handle) => {
			handle.classList.remove('dragging');
		});

		this.classList.remove('dragging');
		document.body.style.cursor = '';

		document.removeEventListener('mousemove', this._boundMouseMove);
		document.removeEventListener('mouseup', this._boundMouseUp);
	}

	/**
	 * Render the entities section
	 */
	private _renderEntities(): TemplateResult {
		if (!this._config) {
			return html``;
		}

		const entities = this._config.entities || [];

		return html`
			${entities.map(
				(entity, entity_idx) => html`
					<div class="box">
						<div class="entity-header">
							<div class="entity-info">
								<div
									class="drag-handle"
									@mousedown=${(ev: MouseEvent) =>
										this._handleMouseDown(ev, entity_idx)}
								>
									<ha-icon .icon=${'mdi:drag'}></ha-icon>
								</div>
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
									(this._config?.entities?.length || 0) - 1}
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
							.schema=${getEntitySchema(this._getSchemaContext(), entity)}
							.data=${entity}
							.computeLabel=${(s: SchemaItem) =>
								(s as { label?: string }).label ?? s.name}
							@value-changed=${(ev: CustomEvent) =>
								this._valueChangedEntity(entity_idx, ev)}
						></ha-form>
					</div>
				`
			)}
		`;
	}

	/**
	 * Main render method
	 */
	override render(): TemplateResult {
		if (!this._config) {
			return html`<div>Loading...</div>`;
		}

		return html`
			<ha-form
				.hass=${this.hass}
				.data=${this._config}
				.schema=${getMainSchema(this._getSchemaContext())}
				.computeLabel=${(s: SchemaItem) => (s as { label?: string }).label ?? s.name}
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
}

// Register custom element
customElements.define('room-card-minimalist-editor', RoomCardEditor);

// Register card for Home Assistant card picker
window.customCards = window.customCards || [];
window.customCards.push({
	type: 'room-card-minimalist',
	name: 'Room Card Minimalist',
	preview: true,
	description: 'Display the state of a room at a glance - in UI Lovelace Minimalist style',
	documentationURL: 'https://github.com/unbekannt3/room-card-minimalist',
});
