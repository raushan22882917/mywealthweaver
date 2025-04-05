// This script runs the TypeScript file to create stock analysis tables in Supabase
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

require('ts-node').register();
require('./src/scripts/create-analysis-tables.ts');
