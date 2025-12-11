import { useState, useEffect, useCallback } from 'react';
import { DuckDBManager } from '../duckdb';

export function useDuckDB() {
  const [db, setDb] = useState<DuckDBManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let manager: DuckDBManager | null = null;

    const initDB = async () => {
      try {
        manager = new DuckDBManager();
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
      if (manager) {
        manager.close();
      }
    };
  }, []);

  const loadCSV = useCallback(
    async (file: File) => {
      if (!db || !isInitialized) {
        throw new Error('DuckDB not initialized');
      }
      return await db.loadCSV(file);
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
