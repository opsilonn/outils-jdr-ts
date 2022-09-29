import { Pool } from "pg";

class PostgresStore {
  /** @type { import('pg').Pool } */
  pool: any;
  /** @type { import('pg').PoolClient } */
  client: any;
  /** @type { import('pg').ClientConfig } */
  config: any;

  /**
   * @param { import('pg').ClientConfig } config
   */
  async init(config: any) {
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
