Write-Output "🧹 Cleaning up cache and folders..."

docker builder prune -f | Out-Null

Remove-Item -Force -Recurse -ErrorAction SilentlyContinue node_modules, .parcel-cache, temp_valid.csv, data_quality_report.csv, report, data\processed

New-Item -ItemType Directory -Force -Path data\raw, data\processed, report

Write-Output "🐳 Building Docker image..."
docker build --no-cache -t agri-pipeline .

Write-Output "🚀 Running pipeline..."
docker run `
  -v "${PWD}/data:/usr/src/app/data" `
  -v "${PWD}/report:/usr/src/app/report" `
  agri-pipeline
