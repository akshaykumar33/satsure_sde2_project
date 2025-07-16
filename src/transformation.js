import { calibrate, computeZScore, expectedRanges, toISTISOString } from './utils.js';

export function transformData(data) {
  const cleaned = data
    .filter(d => d.sensor_id && d.reading_type && d.value !== null && !isNaN(d.value))
    .map(row => ({
      ...row,
      value: parseFloat(row.value),
      battery_level: parseFloat(row.battery_level || 0),
      timestamp: toISTISOString(row.timestamp),
      calibrated_value: calibrate(row.reading_type, row.value)
    }));

  // Group by reading_type + sensor_id for z-score and rolling logic
  const grouped = {};
  for (const row of cleaned) {
    const key = `${row.sensor_id}-${row.reading_type}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  }

  const final = [];

  for (const key in grouped) {
    const group = grouped[key];
    const values = group.map(r => r.calibrated_value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);

    group.forEach((row, index) => {
      const z = computeZScore(row.calibrated_value, mean, stdDev);
      const [min, max] = expectedRanges[row.reading_type] || [0, 9999];

      const dailyGroup = group.filter(r => r.timestamp.slice(0, 10) === row.timestamp.slice(0, 10));
      const dailyAvg = dailyGroup.reduce((sum, r) => sum + r.calibrated_value, 0) / dailyGroup.length;

      const sevenDays = group.slice(Math.max(0, index - 6), index + 1);
      const rollingAvg = sevenDays.reduce((sum, r) => sum + r.calibrated_value, 0) / sevenDays.length;

      final.push({
        ...row,
        z_score: +z.toFixed(2),
        daily_avg_value: +dailyAvg.toFixed(2),
        rolling_7d_avg_value: +rollingAvg.toFixed(2),
        anomalous_reading: z > 3 || z < -3 || row.calibrated_value < min || row.calibrated_value > max
      });
    });
  }

  return final;
}
