/**
 * Action Handler Utilities
 * Provides reusable tap/hold event handling for LitElement components
 */

import { LitElement } from 'lit';
import type { ActionsConfig } from '../types';
import { HOLD_TIMEOUT_MS } from '../constants';
import { handleAction } from '../services';

/**
 * Event handlers object returned by createActionHandlers
 */
export interface ActionHandlers {
	onClick: (e: Event) => void;
	onMouseDown: (e: MouseEvent) => void;
	onMouseUp: () => void;
	onMouseLeave: () => void;
	onTouchStart: (e: TouchEvent) => void;
	onTouchEnd: () => void;
	onContextMenu: (e: Event) => void;
}

/**
 * Options for action handler creation
 */
export interface ActionHandlerOptions {
	/** Stop propagation on mousedown/touchstart */
	stopPropagation?: boolean;
	/** Selector to ignore (e.g., '.state-item' to prevent card handlers on items) */
	ignoreSelector?: string;
}

/**
 * ActionController manages hold timer state and provides event handlers
 * for tap and hold actions on elements.
 *
 * Usage:
 * ```ts
 * class MyElement extends LitElement {
 *   private _actionController = new ActionController(this);
 *
 *   render() {
 *     const handlers = this._actionController.createHandlers(this._config);
 *     return html`
 *       <div
 *         @click=${handlers.onClick}
 *         @mousedown=${handlers.onMouseDown}
 *         ...
 *       >
 *     `;
 *   }
 * }
 * ```
 */
export class ActionController {
	private _element: LitElement;
	private _holdTimeout: ReturnType<typeof setTimeout> | null = null;
	private _holdFired = false;

	constructor(element: LitElement) {
		this._element = element;
	}

	/**
	 * Check if the hold action was fired (prevents tap after hold)
	 */
	get holdFired(): boolean {
		return this._holdFired;
	}

	/**
	 * Reset the hold fired flag
	 */
	resetHoldFired(): void {
		this._holdFired = false;
	}

	/**
	 * Start the hold timer
	 */
	startHoldTimer(callback: () => void): void {
		this.clearHoldTimer();
		this._holdFired = false;
		this._holdTimeout = setTimeout(() => {
			this._holdFired = true;
			callback();
		}, HOLD_TIMEOUT_MS);
	}

	/**
	 * Clear the hold timer
	 */
	clearHoldTimer(): void {
		if (this._holdTimeout) {
			clearTimeout(this._holdTimeout);
			this._holdTimeout = null;
		}
	}

	/**
	 * Create event handlers for an actionable element
	 */
	createHandlers(config: ActionsConfig, options: ActionHandlerOptions = {}): ActionHandlers {
		const { stopPropagation = false, ignoreSelector } = options;

		return {
			onClick: (e: Event) => {
				if (this._holdFired) {
					this._holdFired = false;
					return;
				}
				e.stopPropagation();
				handleAction(this._element, config, 'tap');
			},

			onMouseDown: (e: MouseEvent) => {
				if (e.button !== 0) return; // Only left mouse button
				if (ignoreSelector) {
					const target = e.target as HTMLElement;
					if (target.closest(ignoreSelector)) return;
				}
				if (stopPropagation) e.stopPropagation();
				this.startHoldTimer(() => handleAction(this._element, config, 'hold'));
			},

			onMouseUp: () => {
				this.clearHoldTimer();
			},

			onMouseLeave: () => {
				this.clearHoldTimer();
			},

			onTouchStart: (e: TouchEvent) => {
				if (ignoreSelector) {
					const target = e.target as HTMLElement;
					if (target.closest(ignoreSelector)) return;
				}
				if (stopPropagation) e.stopPropagation();
				this.startHoldTimer(() => handleAction(this._element, config, 'hold'));
			},

			onTouchEnd: () => {
				this.clearHoldTimer();
			},

			onContextMenu: (e: Event) => {
				e.preventDefault();
				e.stopPropagation();
				handleAction(this._element, config, 'hold');
			},
		};
	}
}

/**
 * Create an ActionController instance for a LitElement
 */
export function createActionController(element: LitElement): ActionController {
	return new ActionController(element);
}

/**
 * Apply action handlers to an element's event bindings in a template
 * Returns an object suitable for spreading into lit-html template bindings
 */
export function bindActionHandlers(
	handlers: ActionHandlers,
	isClickable: boolean
): Record<string, unknown> {
	if (!isClickable) {
		return {
			tabindex: '-1',
		};
	}

	return {
		'@click': handlers.onClick,
		'@mousedown': handlers.onMouseDown,
		'@mouseup': handlers.onMouseUp,
		'@mouseleave': handlers.onMouseLeave,
		'@touchstart': handlers.onTouchStart,
		'@touchend': handlers.onTouchEnd,
		'@contextmenu': handlers.onContextMenu,
		tabindex: '0',
	};
}
