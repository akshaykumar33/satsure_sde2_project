import { ingestData } from './src/ingestion.js';
import { transformData } from './src/transformation.js';
import { validateAndReport } from './src/validation.js';
import { saveTransformedData } from './src/loader.js';

async function runPipeline() {
  const rawData = await ingestData('./data/raw/');
  const transformed = transformData(rawData);
  await validateAndReport(transformed);
  await saveTransformedData(transformed, './data/processed/');
}

runPipeline().catch(console.error);
