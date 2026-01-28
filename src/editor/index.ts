/**
 * Editor Module
 * Barrel export for editor-related utilities
 */

// Schema generators
export {
	getEntitySchema,
	getClimateEntitySchema,
	getCustomMultiStateSchema,
	getBackgroundSchema,
	getMainSchema,
} from './schemas';
export type { SchemaContext } from './schemas';
