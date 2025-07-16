import fs from 'fs';
import { validateAndReport } from '../src/validation.js';

const testData = [
  {
    sensor_id: 'sensor_1',
    timestamp: '2025-06-05T12:00:00+05:30',
    reading_type: 'temperature',
    value: 45,
    battery_level: 3.7,
    calibrated_value: 44.5,
    z_score: 0.8,
    anomalous_reading: 'false'
  }
];

test('validateAndReport creates a data quality CSV report', async () => {
  await validateAndReport(testData);
  const exists = fs.existsSync('report/data_quality_report.csv');
  expect(exists).toBe(true);

  const content = fs.readFileSync('report/data_quality_report.csv', 'utf-8');
  expect(content).toMatch(/Total Records/);
});