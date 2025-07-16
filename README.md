
# 🌾 Agri-Pipeline (ETL for Sensor Data)

A production-grade ETL pipeline using Node.js, DuckDB, and Docker to clean, transform, validate, and export agricultural sensor data.

---

## ⚙️ Run via Docker (Recommended)

### Linux / Mac / Git Bash
```bash
./run.sh
```

### PowerShell (Windows)
```powershell
./run.ps1
```

---

## 🚪 Output
- Cleaned Parquet files: `data/processed/`
- Quality report: `report/data_quality_report.csv`

---

## 🧰 Local Run (Optional)

```bash
npm install
npm start
```

Make sure you have:
- Node.js v20+
- DuckDB installed locally if using extensions outside Docker

---

## 📁 Folder Structure

```
agri-pipeline-node/
├── data/
│   ├── raw/                # Input Parquet files
│   └── processed/          # Cleaned output
├── report/
│   └── data_quality_report.csv
├── src/
├── tests/
├── Dockerfile
├── run.sh / run.ps1
├── package.json
```

---

## ✅ Features
- Modular ETL: ingestion, transformation, validation, loading
- DuckDB for lightweight SQL validation and profiling
- Parquet output with partitioning
- Cross-platform Docker compatibility
- Unit tested
```

---

# satsure_sde2_project
