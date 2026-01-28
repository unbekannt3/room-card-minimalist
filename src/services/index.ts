/**
 * Services Index
 * Barrel export for all services
 */

export { TemplateService, createTemplateService } from './template-service';

export {
	getDefaultAction,
	isClickable,
	isEntityItemClickable,
	handleAction,
} from './action-service';

export {
	needsMigration,
	migrateConfig,
	applyDefaults,
	processConfig,
	cleanConfig,
} from './config-migration';
