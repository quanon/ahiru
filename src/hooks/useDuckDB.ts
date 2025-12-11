import { useState, useEffect, useCallback } from 'react';
import { DuckDBManager } from '../duckdb';

export function useDuckDB() {
  const [db, setDb] = useState<DuckDBManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const manager = new DuckDBManager();
        await manager.initialize();
        setDb(manager);
        setIsInitialized(true);
      } catch (err) {
        setError(`DuckDB initialization error: ${err}`);
        console.error('DuckDB initialization error:', err);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const loadCSV = useCallback(
    async (file: File) => {
      if (!db || !isInitialized) {
        throw new Error('DuckDB not initialized');
      }
      await db.loadCSV(file);
    },
    [db, isInitialized]
  );

  const executeQuery = useCallback(
    async (query: string) => {
      if (!db || !isInitialized) {
        throw new Error('DuckDB not initialized');
      }
      return await db.executeQuery(query);
    },
    [db, isInitialized]
  );

  return {
    isInitialized,
    error,
    loadCSV,
    executeQuery,
  };
}
