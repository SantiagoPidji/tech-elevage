import React, { useState, useMemo } from 'react';
import { useData } from '../utils/useData';
import { format, parseISO } from 'date-fns';
import { Filters } from '../components/Filters';

type SortField = 'timestamp' | 'cowId' | 'thi' | 'stressLevel';
type SortDirection = 'asc' | 'desc';

const SortIcon: React.FC<{ field: SortField; sortField: SortField; sortDirection: SortDirection }> = ({
  field,
  sortField,
  sortDirection,
}) => {
  if (sortField !== field) {
    return <span className="text-gray-400">↕</span>;
  }
  return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
};

export const DataTable: React.FC = () => {
  const { filteredReadings, cows } = useData();
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Get cow name by ID
  const getCowName = (cowId: string) => {
    const cow = cows.find((c) => c.id === cowId);
    return cow ? cow.name : cowId;
  };

  // Sort data
  const sortedReadings = useMemo(() => {
    return [...filteredReadings].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'timestamp':
          compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'cowId':
          compareValue = a.cowId.localeCompare(b.cowId);
          break;
        case 'thi':
          compareValue = a.thi - b.thi;
          break;
        case 'stressLevel': {
          const stressOrder = { none: 0, mild: 1, moderate: 2, severe: 3 };
          compareValue = stressOrder[a.stressLevel] - stressOrder[b.stressLevel];
          break;
        }
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });
  }, [filteredReadings, sortField, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReadings = sortedReadings.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStressLevelBadge = (level: string) => {
    const styles = {
      none: 'bg-green-100 text-green-800',
      mild: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800',
    };
    const labels = {
      none: 'Aucun',
      mild: 'Léger',
      moderate: 'Modéré',
      severe: 'Sévère',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level as keyof typeof styles]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };



  return (
    <div>
      <Filters />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Données détaillées THI</h2>
              <p className="text-sm text-gray-600 mt-1">
                {sortedReadings.length} mesure{sortedReadings.length !== 1 ? 's' : ''} trouvée{sortedReadings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date & Heure</span>
                    <SortIcon field="timestamp" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('cowId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vache</span>
                    <SortIcon field="cowId" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('thi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>THI</span>
                    <SortIcon field="thi" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Température (°F)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Humidité (%)
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('stressLevel')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Niveau de stress</span>
                    <SortIcon field="stressLevel" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact reproduction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReadings.map((reading) => (
                <tr key={reading.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(reading.timestamp), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getCowName(reading.cowId)}</div>
                    <div className="text-xs text-gray-500">{reading.cowId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        reading.thi > 80
                          ? 'text-red-600'
                          : reading.thi > 72
                          ? 'text-orange-600'
                          : reading.thi > 68
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {reading.thi}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reading.temperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reading.humidity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStressLevelBadge(reading.stressLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {reading.reproductiveImpact ? (
                      <span className="text-red-600 font-medium">⚠️ Oui</span>
                    ) : (
                      <span className="text-green-600">✓ Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
