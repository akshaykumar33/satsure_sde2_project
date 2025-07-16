import parquet from 'parquetjs-lite';
import fs from 'fs';
import path from 'path';

export async function saveTransformedData(data, baseDir) {
  if (!data.length) return console.log('⚠️ No data to save.');

  const schema = new parquet.ParquetSchema({
    sensor_id: { type: 'UTF8' },
    reading_type: { type: 'UTF8' },
    timestamp: { type: 'UTF8' },
    battery_level: { type: 'DOUBLE' },
    value: { type: 'DOUBLE' },
    calibrated_value: { type: 'DOUBLE' },
    z_score: { type: 'DOUBLE' },
    anomalous_reading: { type: 'BOOLEAN' }
  });

  for (const row of data) {
    const date = row.timestamp.slice(0, 10);
    // const dir = path.join('data', 'processed', date, `sensor_id=${row.sensor_id}`);
    const dir = path.join(baseDir, date, `sensor_id=${row.sensor_id}`);

    fs.mkdirSync(dir, { recursive: true });

    const file = path.join(dir, `data.parquet`);
    const writer = await parquet.ParquetWriter.openFile(schema, file, { useCompression: true });
    await writer.appendRow(row);
    await writer.close();
  }

  console.log(`✅ Saved ${data.length} records to: data/processed/`);
}
