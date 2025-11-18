import React from 'react';
import { useData } from '../utils/useData';
import { format, subDays } from 'date-fns';

export const Filters: React.FC = () => {
  const { filters, setFilters, cows } = useData();

  const handleDateRangeChange = (range: '7' | '30' | '90' | 'all') => {
    const end = format(new Date(), 'yyyy-MM-dd');
    let start: string;

    switch (range) {
      case '7':
        start = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        break;
      case '30':
        start = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        break;
      case '90':
        start = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        break;
      default:
        start = format(subDays(new Date(), 365), 'yyyy-MM-dd');
    }

    setFilters({
      ...filters,
      dateRange: { start, end },
    });
  };

  const handleTHIRangeChange = (min: number, max: number) => {
    setFilters({
      ...filters,
      thiRange: { min, max },
    });
  };



  const handleStressLevelChange = (level: typeof filters.stressLevel) => {
    setFilters({
      ...filters,
      stressLevel: level === filters.stressLevel ? undefined : level,
    });
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd'),
      },
      thiRange: { min: 0, max: 100 },
      cowIds: [],
      stressLevel: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <div className="flex flex-wrap gap-2">
            {(['7', '30', '90', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-3 py-1 text-sm rounded-md ${
                  (range === '30' && 
                    filters.dateRange.start === format(subDays(new Date(), 30), 'yyyy-MM-dd'))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'Tout' : `${range}j`}
              </button>
            ))}
          </div>
        </div>

        {/* THI Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plage THI
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTHIRangeChange(0, 100)}
              className={`px-3 py-1 text-sm rounded-md ${
                filters.thiRange.min === 0 && filters.thiRange.max === 100
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleTHIRangeChange(68, 100)}
              className={`px-3 py-1 text-sm rounded-md ${
                filters.thiRange.min === 68
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              THI &gt; 68
            </button>
            <button
              onClick={() => handleTHIRangeChange(72, 100)}
              className={`px-3 py-1 text-sm rounded-md ${
                filters.thiRange.min === 72
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              THI &gt; 72
            </button>
          </div>
        </div>

        {/* Stress Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau de stress
          </label>
          <select
            value={filters.stressLevel || ''}
            onChange={(e) => {
              const value = e.target.value as 'none' | 'mild' | 'moderate' | 'severe' | '';
              handleStressLevelChange(value || undefined);
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les niveaux</option>
            <option value="none">Aucun</option>
            <option value="mild">Léger</option>
            <option value="moderate">Modéré</option>
            <option value="severe">Sévère</option>
          </select>
        </div>

        {/* Cow Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vaches sélectionnées
          </label>
          <div className="text-sm text-gray-600">
            {filters.cowIds.length === 0 ? (
              <span>Toutes les vaches ({cows.length})</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {filters.cowIds.slice(0, 3).map((id) => (
                  <span
                    key={id}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                  >
                    {id}
                  </span>
                ))}
                {filters.cowIds.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    +{filters.cowIds.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
