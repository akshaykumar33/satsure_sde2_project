#!/bin/bash

echo "🧹 Cleaning old Docker cache and output folders..."
docker builder prune -f

rm -rf node_modules .parcel-cache temp_valid.csv data_quality_report.csv data/processed report
mkdir -p data/raw data/processed report

# Fix path issue on Git Bash (convert to Windows-style)
DATA_PATH=$(cd data && pwd -W)
REPORT_PATH=$(cd report && pwd -W)

echo "🐳 Building fresh Docker image..."
docker build --no-cache -t agri-pipeline .

echo "🚀 Running pipeline container..."
docker run \
  -v "${DATA_PATH}:/usr/src/app/data" \
  -v "${REPORT_PATH}:/usr/src/app/report" \
  agri-pipeline
