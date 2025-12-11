import { useState, ChangeEvent } from 'react';
import { useDuckDB } from './hooks/useDuckDB';

interface QueryResult {
  [key: string]: any;
}

type StatusType = 'info' | 'success' | 'error' | 'warning';

function App() {
  const { isInitialized, error: initError, loadCSV, executeQuery } = useDuckDB();
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM data LIMIT 10');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<StatusType>('info');
  const [showStatus, setShowStatus] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const showStatusMessage = (message: string, type: StatusType) => {
    setStatusMessage(message);
    setStatusType(type);
    setShowStatus(true);
  };

  const hideStatus = () => {
    setShowStatus(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isInitialized) {
      showStatusMessage('DuckDB を初期化中', 'warning');
      return;
    }

    try {
      showStatusMessage(`${file.name} を読み込み中`, 'info');
      await loadCSV(file);
      showStatusMessage(`${file.name} の読み込みが完了しました`, 'success');
      setIsFileLoaded(true);
      setShowResults(false);
      setTimeout(hideStatus, 2000);
    } catch (error) {
      showStatusMessage(`CSV の読み込みエラー: ${error}`, 'error');
      console.error('CSV load error:', error);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      showStatusMessage('SQL クエリを入力してください', 'warning');
      return;
    }

    try {
      showStatusMessage('クエリを実行中', 'info');
      setIsExecuting(true);

      const queryResults = await executeQuery(sqlQuery);

      if (queryResults.length === 0) {
        showStatusMessage('結果が見つかりませんでした', 'info');
        setShowResults(false);
        return;
      }

      setResults(queryResults);
      setShowResults(true);
      showStatusMessage('クエリが正常に実行されました', 'success');
      setTimeout(hideStatus, 2000);
    } catch (error) {
      showStatusMessage(`クエリエラー: ${error}`, 'error');
      console.error('Query execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusClass = () => {
    return `alert alert-${statusType}`;
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>{initError}</span>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-info max-w-md">
          <span>DuckDB を初期化中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-4">🦆 Ahiru</h1>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">CSV</span>
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered file-input-primary w-full"
              />
            </div>

            {showStatus && (
              <div className={`${getStatusClass()} mb-4`}>
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">SQL</span>
              </label>
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="textarea textarea-bordered h-24 font-mono"
                placeholder="SELECT * FROM data LIMIT 10"
              />
            </div>

            <div className="card-actions justify-end mb-4">
              <button
                onClick={handleExecuteQuery}
                disabled={!isFileLoaded || isExecuting}
                className="btn btn-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                実行
              </button>
            </div>

            {showResults && results.length > 0 && (
              <div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        {Object.keys(results[0]).map((col) => (
                          <th key={col} className="font-bold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(results[0]).map((col) => (
                            <td key={col}>{String(row[col] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-sm text-base-content/70">
                  <span>{results.length} 行</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
