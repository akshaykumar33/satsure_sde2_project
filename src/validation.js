import pkg from 'duckdb';
const duckdb = pkg;
import fs from 'fs';
import path from 'path';

let db, con;

export async function validateAndReport(data) {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ No data provided to validation step. Skipping.');
    return;
  }

  if (!db) {
    db = new duckdb.Database(':memory:');
    con = db.connect();
  }

  try {
    await new Promise((resolve, reject) => {
      con.run("DROP TABLE IF EXISTS readings;", err => (err ? reject(err) : resolve()));
    });

    const columns = Object.keys(data[0]);
    const createStmt = `CREATE TABLE readings (${columns.map(c => `${c} TEXT`).join(',')});`;

    await new Promise((resolve, reject) =>
      con.run(createStmt, err => (err ? reject(err) : resolve()))
    );

    for (const row of data) {
      const values = columns.map(col => `'${String(row[col] ?? '')}'`).join(',');
      const insert = `INSERT INTO readings VALUES (${values});`;
      await new Promise((resolve, reject) => con.run(insert, err => (err ? reject(err) : resolve())));
    }

    const queries = {
      stats: `
        SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN anomalous_reading = 'true' THEN 1 ELSE 0 END) AS anomalies,
          COUNT(DISTINCT sensor_id) AS sensors
        FROM readings;`,

      missing: `
        SELECT reading_type,
               COUNT(*) AS total,
               SUM(CASE WHEN value IS NULL OR value = '' THEN 1 ELSE 0 END) AS missing,
               ROUND(100.0 * SUM(CASE WHEN value IS NULL OR value = '' THEN 1 ELSE 0 END)/COUNT(*), 2) AS percent_missing
        FROM readings
        GROUP BY reading_type;`,

      anomaliesByType: `
        SELECT reading_type, COUNT(*) AS total,
               SUM(CASE WHEN anomalous_reading = 'true' THEN 1 ELSE 0 END) AS anomalies,
               ROUND(100.0 * SUM(CASE WHEN anomalous_reading = 'true' THEN 1 ELSE 0 END)/COUNT(*), 2) AS percent_anomalies
        FROM readings
        GROUP BY reading_type;`,

      coverageGaps: `
        SELECT sensor_id, COUNT(*) AS recorded_hours
        FROM (
          SELECT sensor_id, date_trunc('hour', TRY_CAST(timestamp AS TIMESTAMP)) AS hour_bucket
          FROM readings
        )
        GROUP BY sensor_id;`
    };

    const [stats, missing, anomalies, gaps] = await Promise.all(
      Object.values(queries).map(q =>
        new Promise((resolve, reject) =>
          con.all(q, (err, rows) => (err ? reject(err) : resolve(rows)))
        )
      )
    );

    let report = 'Section,Metric,Value\n';
    report += `Summary,Total Records,${stats[0]?.total}\n`;
    report += `Summary,Anomalies,${stats[0]?.anomalies}\n`;
    report += `Summary,Distinct Sensors,${stats[0]?.sensors}\n`;

    for (const row of missing) {
      report += `Missing,${row.reading_type},${row.percent_missing}%\n`;
    }

    for (const row of anomalies) {
      report += `Anomalies,${row.reading_type},${row.percent_anomalies}%\n`;
    }

    for (const row of gaps) {
      report += `Coverage,${row.sensor_id},${row.recorded_hours} hours\n`;
    }

    // fs.writeFileSync('data_quality_report.csv', report);
    fs.writeFileSync(path.join('report', 'data_quality_report.csv'), report);

    console.log(`📊 Enhanced data quality report saved to data_quality_report.csv`);
  } catch (err) {
    console.error('❌ Validation failed:', err.message);
  }
}
