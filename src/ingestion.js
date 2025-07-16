import pkg from "duckdb";
const duckdb = pkg;

const db = new duckdb.Database(":memory:");
const con = db.connect();

export async function ingestData(directory) {
  const fs = await import("fs/promises");
  const path = (await import("path")).default;

  let totalFiles = 0;
  let totalRecords = 0;
  let totalFailedFiles = 0;
  let totalSkippedRows = 0;

  try {
    await new Promise((resolve, reject) =>
      con.run("INSTALL parquet; LOAD parquet;", err => (err ? reject(err) : resolve()))
    );
    console.log("✅ DuckDB parquet extension loaded");
  } catch (err) {
    console.error("❌ Failed to load parquet extension:", err.message);
  }

  const files = await fs.readdir(directory);
  const parquetFiles = files.filter((f) => f.endsWith(".parquet"));

  const allData = [];

  for (const file of parquetFiles) {
    const fullPath = path.resolve(directory, file);
    totalFiles++;
    try {
      const query = `SELECT * FROM read_parquet('${fullPath}')`;
      const result = await new Promise((resolve, reject) =>
        con.all(query, (err, rows) => (err ? reject(err) : resolve(rows)))
      );

      if (!Array.isArray(result) || result.length === 0) {
        console.warn(`⚠️ No records found in ${file}`);
        continue;
      }

      const validRows = result.filter(
        r => r.sensor_id && r.reading_type && r.timestamp && r.value != null
      );
      const skipped = result.length - validRows.length;
      totalSkippedRows += skipped;

      console.log(`📦 ${file}: ${result.length} rows (${skipped} skipped)`);
      totalRecords += validRows.length;
      allData.push(...validRows);
    } catch (err) {
      totalFailedFiles++;
      console.error(`❌ Failed to read ${file}:`, err.message);
    }
  }

  console.log("\n📈 Ingestion Summary:");
  console.log(`Files read: ${totalFiles}`);
  console.log(`Files failed: ${totalFailedFiles}`);
  console.log(`Total records processed: ${totalRecords}`);
  console.log(`Total records skipped: ${totalSkippedRows}`);

  return allData;
}