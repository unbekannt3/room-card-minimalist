/**
 * Template Service
 * Manages Jinja2 template subscriptions with Home Assistant
 */

import type {
	HomeAssistant,
	RoomCardInternalConfig,
	TemplateResults,
	TemplateSubscriptions,
	ITemplateService,
	TemplateResult,
	TemplateUpdateCallback,
} from '../types';
import { isTemplate, getTemplateResultString } from '../types';

/**
 * TemplateService manages subscriptions to Home Assistant's render_template
 * WebSocket API for dynamic template evaluation
 */
export class TemplateService implements ITemplateService {
	private _hass: HomeAssistant | undefined;
	private _config: RoomCardInternalConfig | undefined;
	private _results: TemplateResults = {};
	private _subscriptions: TemplateSubscriptions = new Map();
	private _updateCallback: TemplateUpdateCallback | undefined;

	/**
	 * Set the Home Assistant instance
	 */
	setHass(hass: HomeAssistant): void {
		this._hass = hass;
	}

	/**
	 * Set the card configuration
	 */
	setConfig(config: RoomCardInternalConfig): void {
		this._config = config;
	}

	/**
	 * Set callback for when template results update
	 */
	setUpdateCallback(callback: TemplateUpdateCallback): void {
		this._updateCallback = callback;
	}

	/**
	 * Get all current template results
	 */
	get results(): TemplateResults {
		return this._results;
	}

	/**
	 * Build the storage key for a template
	 * The same template string can be rendered with different `entity` variables,
	 * so the entity context is part of the key
	 */
	private _key(template: string, entityId?: string): string {
		return entityId ? `${entityId}|${template}` : template;
	}

	/**
	 * Subscribe to a template for live updates
	 * When entityId is given, it is exposed to the template as the `entity` variable
	 */
	async subscribe(template: string, entityId?: string): Promise<void> {
		const key = this._key(template, entityId);

		// Skip if already subscribed, no hass, no config, or not a template
		if (this._subscriptions.has(key) || !this._hass || !this._config || !isTemplate(template)) {
			return;
		}

		try {
			const sub = this._subscribeRenderTemplate(template, entityId, (result) => {
				this._results = {
					...this._results,
					[key]: result,
				};
				this._updateCallback?.(this._results);
			});

			this._subscriptions.set(key, sub);
			await sub;
		} catch (err) {
			this._subscriptions.delete(key);
		}
	}

	/**
	 * Unsubscribe from a specific template
	 */
	async unsubscribe(template: string, entityId?: string): Promise<void> {
		return this._unsubscribeKey(this._key(template, entityId));
	}

	/**
	 * Unsubscribe from all templates
	 */
	async unsubscribeAll(): Promise<void> {
		const keys = Array.from(this._subscriptions.keys());
		await Promise.all(keys.map((k) => this._unsubscribeKey(k)));
		this._results = {};
	}

	/**
	 * Get the result for a specific template
	 */
	getResult(template: string, entityId?: string): string | undefined {
		return getTemplateResultString(this._results[this._key(template, entityId)]);
	}

	/**
	 * Get value - returns raw value or template result
	 * Used for values that might be either static or templates
	 */
	getValue(value: string | undefined, entityId?: string): string | undefined {
		if (!value) return undefined;
		if (isTemplate(value)) {
			return this.getResult(value, entityId);
		}
		return value;
	}

	/**
	 * Get entity state or template result
	 * Used for values that are either entity IDs or templates
	 */
	getEntityOrTemplateValue(value: string | undefined, entityId?: string): string | undefined {
		if (!value) return undefined;
		if (isTemplate(value)) {
			return this.getResult(value, entityId);
		}
		return this._hass?.states[value]?.state;
	}

	/**
	 * Unsubscribe a single subscription by its storage key
	 */
	private async _unsubscribeKey(key: string): Promise<void> {
		const unsubPromise = this._subscriptions.get(key);
		if (!unsubPromise) return;

		try {
			const unsub = await unsubPromise;
			unsub();
			this._subscriptions.delete(key);
			delete this._results[key];
		} catch (err: unknown) {
			const error = err as { code?: string };
			if (error.code !== 'not_found' && error.code !== 'template_error') {
				throw err;
			}
		}
	}

	/**
	 * Internal method to subscribe to render_template
	 */
	private async _subscribeRenderTemplate(
		template: string,
		entityId: string | undefined,
		onChange: (result: TemplateResult) => void
	): Promise<() => void> {
		if (!this._hass) {
			throw new Error('No Home Assistant connection');
		}

		return this._hass.connection.subscribeMessage((msg: TemplateResult) => onChange(msg), {
			type: 'render_template',
			template: template,
			variables: {
				config: this._config,
				user: this._hass.user?.name,
				...(entityId ? { entity: entityId } : {}),
			},
			strict: true,
		});
	}
}

/**
 * Create a new template service instance
 */
export function createTemplateService(): TemplateService {
	return new TemplateService();
}
