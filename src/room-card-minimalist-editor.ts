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
import {
	getMultiStatePreset,
	getDomainIcon,
	MAX_CONFIGURABLE_ENTITIES,
} from './constants';

type EntityGroup = 'outer' | 'inner';

// Utils
import { getClimateHvacModes, isClimateEntityId } from './utils/entity-helpers';

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
	 * Helpers for column-aware entity manipulation
	 */
	private _getGroupList(group: EntityGroup): EntityConfig[] {
		if (!this._config) return [];
		return group === 'inner'
			? [...(this._config.entities_inner || [])]
			: [...(this._config.entities || [])];
	}

	private _dispatchGroupChange(group: EntityGroup, list: EntityConfig[]): void {
		if (!this._config) return;
		if (group === 'inner') {
			this._dispatchConfigChanged({ ...this._config, entities_inner: list });
		} else {
			this._dispatchConfigChanged({ ...this._config, entities: list });
		}
	}

	/**
	 * Delete an entity from the given column at the given index
	 */
	private _deleteStateEntity(group: EntityGroup, idx: number): void {
		const list = this._getGroupList(group);
		list.splice(idx, 1);
		this._dispatchGroupChange(group, list);
	}

	/**
	 * Move an entity up or down within its column
	 */
	private _moveStateEntity(group: EntityGroup, idx: number, pos: number): void {
		const list = this._getGroupList(group);
		const target = idx + pos;
		if (target < 0 || target >= list.length) return;
		[list[idx], list[target]] = [list[target], list[idx]];
		this._dispatchGroupChange(group, list);
	}

	/**
	 * Add a new entity to the given column (template type by default)
	 */
	private _addEntityState(group: EntityGroup = 'outer'): void {
		if (!this._config) return;
		const list = this._getGroupList(group);
		if (list.length >= MAX_CONFIGURABLE_ENTITIES) return;
		list.push({ type: 'template' } as EntityConfig);
		this._dispatchGroupChange(group, list);
	}

	/**
	 * Transform entity data for ha-form (convert custom_states string to array)
	 */
	private _getEntityFormData(entity: EntityConfig): Record<string, unknown> {
		if (entity.type !== 'entity' || !entity.custom_states) {
			return entity as unknown as Record<string, unknown>;
		}

		// Convert comma-separated string to array for multi-select
		const customStatesArray =
			typeof entity.custom_states === 'string'
				? entity.custom_states
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s !== '')
				: entity.custom_states;

		return {
			...(entity as unknown as Record<string, unknown>),
			custom_states: customStatesArray,
		};
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

				// Fallback icons based on domain (using centralized DOMAIN_ICONS)
				const domain = entity.entity.split('.')[0];
				return getDomainIcon(domain);
			}
		}

		return 'mdi:help-circle'; // Default fallback
	}

	/**
	 * Get display name for an entity configuration
	 */
	private _getEntityDisplayName(entity: EntityConfig, index: number): string {
		if (entity.title) {
			return entity.title;
		}

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
	private _valueChangedEntity(
		group: EntityGroup,
		entityIndex: number,
		ev: CustomEvent
	): void {
		if (!this._config || !this.hass) {
			return;
		}

		const list = this._getGroupList(group);
		const oldValue = list[entityIndex];
		const newValue = ev.detail.value as EntityConfig & { custom_states?: string | string[] };

		// Convert custom_states array back to comma-separated string
		if (newValue.custom_states && Array.isArray(newValue.custom_states)) {
			(newValue as EntityConfig & { custom_states: string }).custom_states =
				newValue.custom_states.join(', ');
		}

		// Auto-fill custom_states when use_multi_state is enabled and custom_states is empty
		const customStatesEmpty =
			!newValue.custom_states ||
			(typeof newValue.custom_states === 'string' && newValue.custom_states.trim() === '');

		if (
			newValue.type === 'entity' &&
			newValue.use_multi_state &&
			(!oldValue || oldValue.type !== 'entity' || !oldValue.use_multi_state) &&
			customStatesEmpty
		) {
			let states: string[] = [];

			// For climate entities, get HVAC modes from entity attributes
			if (isClimateEntityId(newValue.entity)) {
				states = getClimateHvacModes(this.hass, newValue.entity);
			} else {
				// For other entities, get preset states
				states = getMultiStatePreset(newValue.entity);
			}

			if (states.length > 0) {
				(newValue as EntityConfig & { custom_states: string }).custom_states =
					states.join(', ');
			}
		}

		list[entityIndex] = newValue as EntityConfig;

		if (group === 'inner') {
			this._config = { ...this._config, entities_inner: list };
		} else {
			this._config = { ...this._config, entities: list };
		}

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
		dragGroup: EntityGroup;
		dragIndex: number;
		startY: number;
	} | null = null;

	// ==================== Mouse-based Drag and Drop Handlers ====================

	private _handleMouseDown(ev: MouseEvent, group: EntityGroup, index: number): void {
		// Only handle left mouse button
		if (ev.button !== 0) return;

		ev.preventDefault();
		ev.stopPropagation();

		this._dragState = {
			isDragging: true,
			dragGroup: group,
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

		const boxes = this.shadowRoot?.querySelectorAll<HTMLElement>('.box');
		if (!boxes) return;

		boxes.forEach((box) => {
			const rect = box.getBoundingClientRect();
			const boxGroup = (box.dataset.group as EntityGroup) || 'outer';
			const boxIndex = Number(box.dataset.index ?? -1);
			const isSelf =
				boxGroup === this._dragState?.dragGroup &&
				boxIndex === this._dragState?.dragIndex;
			if (
				!isSelf &&
				ev.clientY >= rect.top &&
				ev.clientY <= rect.bottom &&
				ev.clientX >= rect.left &&
				ev.clientX <= rect.right
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

		const boxes = this.shadowRoot?.querySelectorAll<HTMLElement>('.box');
		let dropGroup: EntityGroup | null = null;
		let dropIndex = -1;

		boxes?.forEach((box) => {
			const rect = box.getBoundingClientRect();
			if (
				ev.clientY >= rect.top &&
				ev.clientY <= rect.bottom &&
				ev.clientX >= rect.left &&
				ev.clientX <= rect.right
			) {
				dropGroup = (box.dataset.group as EntityGroup) || 'outer';
				dropIndex = Number(box.dataset.index ?? -1);
			}
		});

		const { dragGroup, dragIndex } = this._dragState;
		this._cleanupDrag();

		if (dropGroup === null || dropIndex < 0) return;
		if (dropGroup === dragGroup && dropIndex === dragIndex) return;

		const srcList = this._getGroupList(dragGroup);
		const dragged = srcList[dragIndex];
		if (!dragged) return;

		if (dropGroup === dragGroup) {
			srcList.splice(dragIndex, 1);
			srcList.splice(dropIndex, 0, dragged);
			this._dispatchGroupChange(dragGroup, srcList);
			return;
		}

		// Cross-group move
		const dstList = this._getGroupList(dropGroup);
		if (dstList.length >= MAX_CONFIGURABLE_ENTITIES) return;
		srcList.splice(dragIndex, 1);
		dstList.splice(dropIndex, 0, dragged);

		if (!this._config) return;
		const updated: RoomCardConfig = {
			...this._config,
			...(dragGroup === 'inner'
				? { entities_inner: srcList }
				: { entities: srcList }),
			...(dropGroup === 'inner'
				? { entities_inner: dstList }
				: { entities: dstList }),
		};
		this._dispatchConfigChanged(updated);
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
	 * Render a single entity box. entity_idx is the index within the given
	 * group; reorder/delete/drag handlers operate on that group's array.
	 */
	private _renderEntityBox(
		entity: EntityConfig,
		group: EntityGroup,
		entity_idx: number
	): TemplateResult {
		const list =
			group === 'inner'
				? this._config?.entities_inner || []
				: this._config?.entities || [];
		const total = list.length;
		return html`
			<div class="box" data-group=${group} data-index=${entity_idx}>
				<div class="entity-header">
					<div class="entity-info">
						<div
							class="drag-handle"
							@mousedown=${(ev: MouseEvent) =>
								this._handleMouseDown(ev, group, entity_idx)}
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
						${entity.visibility_condition
							? html`<ha-icon
									.icon=${'mdi:eye-check-outline'}
									style="--mdc-icon-size: 16px; color: var(--secondary-text-color); margin-left: 4px;"
									title="${localize(this.hass, 'has_visibility_condition', 'Has visibility condition')}"
								></ha-icon>`
							: ''}
					</div>
					<div class="entity-controls">
						<mwc-icon-button
							.disabled=${entity_idx === 0}
							@click=${() => this._moveStateEntity(group, entity_idx, -1)}
							title="${localize(this.hass, 'move_up', 'Move Up')}"
						>
							<ha-icon .icon=${'mdi:arrow-up'}></ha-icon>
						</mwc-icon-button>
						<mwc-icon-button
							.disabled=${entity_idx === total - 1}
							@click=${() => this._moveStateEntity(group, entity_idx, 1)}
							title="${localize(this.hass, 'move_down', 'Move Down')}"
						>
							<ha-icon .icon=${'mdi:arrow-down'}></ha-icon>
						</mwc-icon-button>
						<mwc-icon-button
							@click=${() => this._deleteStateEntity(group, entity_idx)}
							title="${localize(this.hass, 'delete', 'Delete')}"
						>
							<ha-icon .icon=${'mdi:close'}></ha-icon>
						</mwc-icon-button>
					</div>
				</div>

				<ha-form
					.hass=${this.hass}
					.schema=${getEntitySchema(this._getSchemaContext(), entity)}
					.data=${this._getEntityFormData(entity)}
					.computeLabel=${(s: SchemaItem) => (s as { label?: string }).label ?? s.name}
					@value-changed=${(ev: CustomEvent) =>
						this._valueChangedEntity(group, entity_idx, ev)}
				></ha-form>
			</div>
		`;
	}

	/**
	 * Render the entities section. In two-column mode the outer column maps
	 * to `entities`, the inner column to `entities_inner`. Entities can be
	 * dragged between columns.
	 */
	private _renderEntities(): TemplateResult {
		if (!this._config) {
			return html``;
		}

		const outer = this._config.entities || [];

		if (!this._config.entities_two_columns) {
			return html`${outer.map((e, i) => this._renderEntityBox(e, 'outer', i))}`;
		}

		const inner = this._config.entities_inner || [];
		const outerFull = outer.length >= MAX_CONFIGURABLE_ENTITIES;
		const innerFull = inner.length >= MAX_CONFIGURABLE_ENTITIES;

		return html`
			<div class="column-group">
				<div class="column-group-header">
					<p class="column-group-title">
						${localize(
							this.hass,
							'outer_column',
							'Outer Column (up to 8 candidates, 4 visible)'
						)}
					</p>
					${outerFull
						? html`<mwc-button disabled style="cursor: not-allowed;">
								<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
									this.hass,
									'add_state',
									'Add State'
								)}
							</mwc-button>`
						: html`<mwc-button @click=${() => this._addEntityState('outer')}>
								<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
									this.hass,
									'add_state',
									'Add State'
								)}
							</mwc-button>`}
				</div>
				<p class="column-group-hint">
					${localize(
						this.hass,
						'outer_column_hint',
						'Rightmost column on the card. First 4 visible entities are shown.'
					)}
				</p>
				${outer.map((e, i) => this._renderEntityBox(e, 'outer', i))}
			</div>
			<div class="column-group">
				<div class="column-group-header">
					<p class="column-group-title">
						${localize(
							this.hass,
							'inner_column',
							'Inner Column (up to 8 candidates, 4 visible)'
						)}
					</p>
					${innerFull
						? html`<mwc-button disabled style="cursor: not-allowed;">
								<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
									this.hass,
									'add_state',
									'Add State'
								)}
							</mwc-button>`
						: html`<mwc-button @click=${() => this._addEntityState('inner')}>
								<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
									this.hass,
									'add_state',
									'Add State'
								)}
							</mwc-button>`}
				</div>
				<p class="column-group-hint">
					${localize(
						this.hass,
						'inner_column_hint',
						'Second column from the right (closer to the room text). First 4 visible entities are shown.'
					)}
				</p>
				${inner.map((e, i) => this._renderEntityBox(e, 'inner', i))}
			</div>
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
				${this._config.entities_two_columns
					? ''
					: (this._config.entities?.length || 0) >= MAX_CONFIGURABLE_ENTITIES
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
								@click=${() => this._addEntityState('outer')}
							>
								<ha-icon .icon=${'mdi:plus'}></ha-icon>${localize(
									this.hass,
									'add_state',
									'Add State'
								)}
							</mwc-button>`}
			</div>
			<p style="margin: 0 0 8px; font-size: 12px; color: var(--secondary-text-color);">
				${this._config?.entities_two_columns
					? localize(
							this.hass,
							'visibility_hint_two_columns',
							'Up to 8 candidate entities per column (16 total). The first 4 visible entities of each column are displayed on the card. Use visibility conditions to control which entities are shown.'
						)
					: localize(
							this.hass,
							'visibility_hint',
							'Only the first 4 visible entities are displayed. Use visibility conditions to control which entities are shown.'
						)}
			</p>

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
