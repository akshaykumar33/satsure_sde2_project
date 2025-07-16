FROM node:20

# Install DuckDB CLI (optional for manual SQL debug)
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://github.com/duckdb/duckdb/releases/download/v0.10.2/duckdb_cli-linux-amd64.zip && \
    unzip duckdb_cli-linux-amd64.zip && \
    mv duckdb /usr/local/bin/duckdb && \
    chmod +x /usr/local/bin/duckdb && \
    rm duckdb_cli-linux-amd64.zip

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]