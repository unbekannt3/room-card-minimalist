/**
 * Editor Styles
 * CSS styles for the card editor component
 */

import { css } from 'lit';

export const editorStyles = css`
	:host {
		display: block;
		box-sizing: border-box;
		width: 100%;
		overflow-x: hidden;
	}

	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	.box {
		border: 1px solid var(--divider-color);
		border-radius: 8px;
		margin: 6px 0;
		padding: 12px;
		transition: all 0.2s ease;
		background: var(--card-background-color, white);
		box-sizing: border-box;
		width: 100%;
		max-width: 100%;
	}

	.box:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.box.dragging {
		border-color: var(--primary-color);
		opacity: 0.7;
		transform: scale(0.98);
	}

	.box.drag-over {
		border-color: var(--primary-color);
		background-color: var(--primary-color-fade, rgba(var(--rgb-primary-color), 0.1));
		transform: scale(1.02);
	}

	.entity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--divider-color);
	}

	.entity-info {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.entity-icon {
		color: var(--primary-color);
		--mdc-icon-size: 20px;
		flex-shrink: 0;
	}

	.entity-title {
		font-weight: 500;
		color: var(--primary-text-color);
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.entity-controls {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.drag-handle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--secondary-text-color);
		cursor: grab;
		padding: 8px;
		border-radius: 4px;
		transition: all 0.2s ease;
		--mdc-icon-size: 20px;
		margin: -4px;
		flex-shrink: 0;
		user-select: none;
		-webkit-user-drag: element;
	}

	.drag-handle:hover {
		color: var(--primary-color);
		background-color: var(--divider-color);
		cursor: grab;
	}

	.drag-handle:active {
		cursor: grabbing !important;
		color: var(--primary-color);
	}

	.drag-handle[draggable='true']:active {
		cursor: grabbing !important;
	}

	.box.dragging .drag-handle,
	.drag-handle.dragging {
		cursor: grabbing !important;
	}

	:host(.dragging) * {
		cursor: grabbing !important;
	}

	/* Disable pointer events on children during drag to allow drop events */
	:host(.dragging) .box > *:not(.entity-header) {
		pointer-events: none;
	}

	:host(.dragging) ha-form {
		pointer-events: none !important;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	ha-form {
		pointer-events: auto;
		width: 100%;
	}

	ha-form .grid,
	ha-form [data-type='grid'],
	ha-form .form-group.grid {
		display: grid !important;
		grid-template-columns: 1fr 1fr !important;
		gap: 12px !important;
		width: 100% !important;
	}

	ha-form .form-group.grid > * {
		min-width: 0 !important;
		width: 100% !important;
	}
`;
