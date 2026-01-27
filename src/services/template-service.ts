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
	 * Subscribe to a template for live updates
	 */
	async subscribe(template: string): Promise<void> {
		// Skip if already subscribed, no hass, no config, or not a template
		if (
			this._subscriptions.has(template) ||
			!this._hass ||
			!this._config ||
			!isTemplate(template)
		) {
			return;
		}

		try {
			const sub = this._subscribeRenderTemplate(template, (result) => {
				this._results = {
					...this._results,
					[template]: result,
				};
				this._updateCallback?.(this._results);
			});

			this._subscriptions.set(template, sub);
			await sub;
		} catch (err) {
			this._subscriptions.delete(template);
		}
	}

	/**
	 * Unsubscribe from a specific template
	 */
	async unsubscribe(template: string): Promise<void> {
		const unsubPromise = this._subscriptions.get(template);
		if (!unsubPromise) return;

		try {
			const unsub = await unsubPromise;
			unsub();
			this._subscriptions.delete(template);
			delete this._results[template];
		} catch (err: unknown) {
			const error = err as { code?: string };
			if (error.code !== 'not_found' && error.code !== 'template_error') {
				throw err;
			}
		}
	}

	/**
	 * Unsubscribe from all templates
	 */
	async unsubscribeAll(): Promise<void> {
		const templates = Array.from(this._subscriptions.keys());
		await Promise.all(templates.map((t) => this.unsubscribe(t)));
		this._results = {};
	}

	/**
	 * Get the result for a specific template
	 */
	getResult(template: string): string | undefined {
		return getTemplateResultString(this._results[template]);
	}

	/**
	 * Get value - returns raw value or template result
	 * Used for values that might be either static or templates
	 */
	getValue(value: string | undefined): string | undefined {
		if (!value) return undefined;
		if (isTemplate(value)) {
			return this.getResult(value);
		}
		return value;
	}

	/**
	 * Get entity state or template result
	 * Used for values that are either entity IDs or templates
	 */
	getEntityOrTemplateValue(value: string | undefined): string | undefined {
		if (!value) return undefined;
		if (isTemplate(value)) {
			return this.getResult(value);
		}
		return this._hass?.states[value]?.state;
	}

	/**
	 * Internal method to subscribe to render_template
	 */
	private async _subscribeRenderTemplate(
		template: string,
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
