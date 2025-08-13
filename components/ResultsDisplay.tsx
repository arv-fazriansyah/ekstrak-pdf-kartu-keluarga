import React, { useState } from 'react';
import type { ExtractedFile, ChildData } from '../types';
import { CHILD_DATA_COLUMNS } from '../types';

interface ResultsTableProps {
  data: ChildData[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-text-secondary text-center py-8">Tidak ada data anak yang ditemukan di file ini.</p>;
  }

  const columns = CHILD_DATA_COLUMNS;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface/50">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-zinc-700/30">
          <tr>
            {columns.map(col => (
              <th key={col} scope="col" className="px-2 py-2 text-center text-[10px] font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap sm:px-4 sm:py-3 sm:text-xs">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-zinc-700/50 transition-colors duration-200">
              {columns.map(col => (
                <td key={col} className="px-2 py-2 text-xs text-text-primary whitespace-nowrap sm:px-4 sm:py-3 sm:text-sm">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


interface ResultsDisplayProps {
  data: ExtractedFile[];
}

export default function ResultsDisplay({ data }: ResultsDisplayProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">Tidak ada hasil untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1">
        <nav className="flex space-x-2 overflow-x-auto p-2 -mx-2" aria-label="Tabs">
          {data.map((file, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap py-2 px-4 rounded-full font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary
                ${activeTab === index 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'text-text-primary border border-zinc-600 hover:bg-zinc-700'
                }`}
            >
              {file.fileName} 
              <span className={`text-xs rounded-full px-2 py-0.5 ml-2 ${activeTab === index ? 'bg-white/20 text-white' : 'bg-zinc-600/80 text-zinc-300'}`}>
                {file.data.length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-1">
        {data.map((file, index) => (
          <div key={index} className={activeTab === index ? 'block fade-in' : 'hidden'}>
            <ResultsTable data={file.data} />
          </div>
        ))}
      </div>
    </div>
  );
}