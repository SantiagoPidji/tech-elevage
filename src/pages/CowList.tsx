import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../utils/useData';
import { Filters } from '../components/Filters';

export const CowList: React.FC = () => {
  const { filteredCows, thiReadings } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter cows by search term
  const displayedCows = useMemo(() => {
    return filteredCows.filter(
      (cow) =>
        cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cow.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredCows, searchTerm]);

  // Calculate stats for each cow
  const cowStats = useMemo(() => {
    const stats = new Map();

    displayedCows.forEach((cow) => {
      const cowReadings = thiReadings.filter((r) => r.cowId === cow.id);
      const avgTHI = cowReadings.length > 0
        ? cowReadings.reduce((sum, r) => sum + r.thi, 0) / cowReadings.length
        : 0;
      const stressReadings = cowReadings.filter((r) => r.thi > 68);
      const impactReadings = cowReadings.filter((r) => r.reproductiveImpact);

      stats.set(cow.id, {
        avgTHI: Math.round(avgTHI * 10) / 10,
        stressCount: stressReadings.length,
        stressPercentage: cowReadings.length > 0
          ? Math.round((stressReadings.length / cowReadings.length) * 100)
          : 0,
        impactPercentage: cowReadings.length > 0
          ? Math.round((impactReadings.length / cowReadings.length) * 100)
          : 0,
      });
    });

    return stats;
  }, [displayedCows, thiReadings]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pregnant: 'bg-green-100 text-green-800',
      inseminated: 'bg-blue-100 text-blue-800',
      open: 'bg-yellow-100 text-yellow-800',
      dry: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pregnant: 'Gestante',
      inseminated: 'Inséminée',
      open: 'Vide',
      dry: 'Tarie',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div>
      <Filters />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profils des vaches</h2>
              <p className="text-sm text-gray-600 mt-1">
                {displayedCows.length} vache{displayedCows.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Rechercher par nom, ID ou race..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {displayedCows.map((cow) => {
            const stats = cowStats.get(cow.id);
            return (
              <div
                key={cow.id}
                onClick={() => navigate(`/cows/${cow.id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🐄</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cow.name}</h3>
                      <p className="text-xs text-gray-500">{cow.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(cow.reproductionStatus)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Race:</span>
                    <span className="font-medium text-gray-900">{cow.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Âge:</span>
                    <span className="font-medium text-gray-900">{cow.age} ans</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">THI moyen:</span>
                    <span
                      className={`font-semibold ${
                        stats.avgTHI > 72
                          ? 'text-red-600'
                          : stats.avgTHI > 68
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {stats.avgTHI}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-center">
                      <p className="text-gray-600">Stress</p>
                      <p className={`font-semibold ${stats.stressPercentage > 50 ? 'text-red-600' : 'text-gray-900'}`}>
                        {stats.stressPercentage}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Impact repro</p>
                      <p className={`font-semibold ${stats.impactPercentage > 30 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {stats.impactPercentage}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Mesures</p>
                      <p className="font-semibold text-gray-900">{stats.stressCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayedCows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune vache ne correspond aux critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
};
