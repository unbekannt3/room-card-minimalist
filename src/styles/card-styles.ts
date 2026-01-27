/**
 * Card Styles
 * CSS styles for the main room card component
 */

import { css } from 'lit';

export const cardStyles = css`
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
	:host(:has(.clickable)):hover {
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

	ha-card.clickable:hover {
		cursor: pointer;
	}

	ha-card.non-clickable {
		cursor: default;
	}

	.container {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		padding: 16px 8px 16px 16px;
		height: 204px;
		position: relative;
		z-index: 2;
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
		overflow: visible;
	}

	.icon-background {
		position: absolute;
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

	.secondary.clickable {
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.secondary.clickable:hover {
		opacity: 0.8;
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

	.state-item.clickable {
		cursor: pointer;
	}

	.state-item.non-clickable {
		cursor: default;
	}

	.state-item.clickable:hover {
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
			height: 176px;
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
