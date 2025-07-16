// Calibration constants (can be adjusted)
export const calibrationMap = {
  temperature: { multiplier: 1.02, offset: 0.3 },
  humidity: { multiplier: 0.98, offset: 0.2 },
  moisture: { multiplier: 1.1, offset: -0.1 },
  light: { multiplier: 0.95, offset: 0 }
};

// Expected value ranges
export const expectedRanges = {
  temperature: [0, 60],
  humidity: [0, 100],
  moisture: [0, 100],
  light: [0, 1000]
};

export function calibrate(reading_type, value) {
  const { multiplier, offset } = calibrationMap[reading_type] || { multiplier: 1, offset: 0 };
  return value * multiplier + offset;
}

export function computeZScore(value, mean, stdDev) {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function toISTISOString(utc) {
  const date = new Date(utc);
  date.setHours(date.getHours() + 5, date.getMinutes() + 30);
  return date.toISOString();
}
