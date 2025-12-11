import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

export class DuckDBManager {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;

  async initialize(): Promise<void> {
    const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
      mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
      },
      eh: {
        mainModule: duckdb_wasm_eh,
        mainWorker: eh_worker,
      },
    };

    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule);
    this.conn = await this.db.connect();
  }

  async loadCSV(file: File): Promise<void> {
    if (!this.db || !this.conn) {
      throw new Error('DuckDB not initialized');
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    await this.db.registerFileBuffer(file.name, uint8Array);

    await this.conn.query(`DROP TABLE IF EXISTS data`);
    await this.conn.query(`CREATE TABLE data AS SELECT * FROM read_csv_auto('${file.name}')`);
  }

  async executeQuery(query: string): Promise<any[]> {
    if (!this.conn) {
      throw new Error('DuckDB not initialized');
    }

    const result = await this.conn.query(query);
    return result.toArray().map(row => row.toJSON());
  }

  async close(): Promise<void> {
    if (this.conn) {
      await this.conn.close();
    }
    if (this.db) {
      await this.db.terminate();
    }
  }
}
