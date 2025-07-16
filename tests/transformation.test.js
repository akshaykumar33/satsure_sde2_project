import { transformData } from '../src/transformation.js';

test('transforms sensor data with calibrated values', () => {
  const sample = [{
    sensor_id: 'sensor_1',
    reading_type: 'temperature',
    timestamp: '2025-06-05T12:00:00Z',
    value: 30,
    battery_level: 3.7,
  }];

  const transformed = transformData(sample);
  expect(transformed[0]).toHaveProperty('calibrated_value');
  expect(transformed[0]).toHaveProperty('anomalous_reading');
});