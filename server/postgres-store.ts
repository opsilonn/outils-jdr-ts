import { ClientConfig, Pool, PoolClient } from "pg";

class PostgresStore {
  /** @type { import('pg').Pool } */
  pool: Pool;
  /** @type { import('pg').PoolClient } */
  client: PoolClient;
  /** @type { import('pg').ClientConfig } */
  config: ClientConfig;

  /**
   * @param { import('pg').ClientConfig } config
   */
  async init(config: ClientConfig) {
    this.pool = new Pool(config);
    this.config = Object.assign({}, config);
    this.client = await this.pool.connect();
  }

  close() {
    if (this.client) {
      this.client.release();
    }
    this.client = null;
    if (this.pool) {
      this.pool.end();
    }
    this.pool = null;
  }
}

export default new PostgresStore();
