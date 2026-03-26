import { Chatwoot, configService } from '@config/env.config';
import { Logger } from '@config/logger.config';
import postgresql from 'pg';

const { Pool } = postgresql;

class Postgres {
  private logger = new Logger('Postgres');
  private pools = new Map<string, any>();

  getConnection(connectionString: string) {
    if (!connectionString || connectionString === 'postgres://user:password@hostname:port/dbname') {
      return null;
    }

    if (this.pools.has(connectionString)) {
      return this.pools.get(connectionString);
    } else {
      const pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      pool.on('error', (err) => {
        this.logger.error('postgres pool error: ' + err);
        this.pools.delete(connectionString);
      });

      this.pools.set(connectionString, pool);
      return pool;
    }
  }

  getChatwootConnection(uri?: string) {
    const finalUri = uri || configService.get<Chatwoot>('CHATWOOT').IMPORT.DATABASE.CONNECTION.URI;
    return this.getConnection(finalUri);
  }
}

export const postgresClient = new Postgres();
