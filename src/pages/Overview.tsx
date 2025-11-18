import React, { useMemo } from 'react';
import { useData } from '../utils/useData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Filters } from '../components/Filters';
import type { DashboardKPIs } from '../types';

export const Overview: React.FC = () => {
  const { filteredReadings, filteredCows } = useData();

  // Calculate KPIs
  const kpis: DashboardKPIs = useMemo(() => {
    const totalCows = filteredCows.length;
    const avgTHI = filteredReadings.length > 0
      ? filteredReadings.reduce((sum, r) => sum + r.thi, 0) / filteredReadings.length
      : 0;

    const cowsWithStress = new Set(
      filteredReadings.filter((r) => r.thi > 68).map((r) => r.cowId)
    );

    const readingsWithImpact = filteredReadings.filter((r) => r.reproductiveImpact);
    const reproductionImpactRate = filteredReadings.length > 0
      ? (readingsWithImpact.length / filteredReadings.length) * 100
      : 0;

    const pregnantCows = filteredCows.filter((c) => c.reproductionStatus === 'pregnant').length;
    const pregnancyRate = totalCows > 0 ? (pregnantCows / totalCows) * 100 : 0;

    // Calculate average days in stress per cow
    const stressDaysByCow = new Map<string, number>();
    filteredReadings.forEach((r) => {
      if (r.thi > 68) {
        stressDaysByCow.set(r.cowId, (stressDaysByCow.get(r.cowId) || 0) + 1);
      }
    });
    const avgStressDays = stressDaysByCow.size > 0
      ? Array.from(stressDaysByCow.values()).reduce((sum, days) => sum + days, 0) / stressDaysByCow.size
      : 0;

    return {
      totalCows,
      averageTHI: Math.round(avgTHI * 10) / 10,
      cowsInStress: cowsWithStress.size,
      reproductionImpactRate: Math.round(reproductionImpactRate * 10) / 10,
      pregnancyRate: Math.round(pregnancyRate * 10) / 10,
      averageStressDays: Math.round(avgStressDays * 10) / 10,
    };
  }, [filteredReadings, filteredCows]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    const dataByDate = new Map<string, { date: string; avgTHI: number; count: number }>();

    filteredReadings.forEach((reading) => {
      const date = format(parseISO(reading.timestamp), 'yyyy-MM-dd');
      const existing = dataByDate.get(date) || { date, avgTHI: 0, count: 0 };
      existing.avgTHI += reading.thi;
      existing.count += 1;
      dataByDate.set(date, existing);
    });

    return Array.from(dataByDate.values())
      .map((d) => ({
        date: format(parseISO(d.date), 'dd/MM'),
        avgTHI: Math.round((d.avgTHI / d.count) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 data points
  }, [filteredReadings]);

  // Stress level distribution
  const stressDistribution = useMemo(() => {
    const distribution = { none: 0, mild: 0, moderate: 0, severe: 0 };
    filteredReadings.forEach((r) => {
      distribution[r.stressLevel]++;
    });

    return [
      { name: 'Aucun', value: distribution.none, color: '#10b981' },
      { name: 'Léger', value: distribution.mild, color: '#fbbf24' },
      { name: 'Modéré', value: distribution.moderate, color: '#f97316' },
      { name: 'Sévère', value: distribution.severe, color: '#ef4444' },
    ];
  }, [filteredReadings]);

  // THI range distribution
  const thiRangeData = useMemo(() => {
    const ranges = [
      { name: '<68', min: 0, max: 68, count: 0 },
      { name: '68-72', min: 68, max: 72, count: 0 },
      { name: '72-80', min: 72, max: 80, count: 0 },
      { name: '>80', min: 80, max: 200, count: 0 },
    ];

    filteredReadings.forEach((r) => {
      const range = ranges.find((rng) => r.thi >= rng.min && r.thi < rng.max);
      if (range) range.count++;
    });

    return ranges;
  }, [filteredReadings]);

  return (
    <div>
      <Filters />

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vaches surveillées</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalCows}</p>
            </div>
            <div className="text-4xl">🐄</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">THI moyen</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.averageTHI}</p>
              <p className={`text-sm mt-1 ${kpis.averageTHI > 68 ? 'text-orange-600' : 'text-green-600'}`}>
                {kpis.averageTHI > 68 ? '⚠️ Au-dessus du seuil' : '✓ Sous le seuil'}
              </p>
            </div>
            <div className="text-4xl">🌡️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vaches en stress</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{kpis.cowsInStress}</p>
              <p className="text-sm text-gray-600 mt-1">
                {kpis.totalCows > 0 ? Math.round((kpis.cowsInStress / kpis.totalCows) * 100) : 0}% du troupeau
              </p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impact reproduction</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{kpis.reproductionImpactRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Des mesures affectées</p>
            </div>
            <div className="text-4xl">📉</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de gestation</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{kpis.pregnancyRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Vaches gestantes</p>
            </div>
            <div className="text-4xl">🤰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jours de stress moy.</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.averageStressDays}</p>
              <p className="text-sm text-gray-600 mt-1">Par vache</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Series Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du THI moyen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[50, 90]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTHI"
                stroke="#3b82f6"
                strokeWidth={2}
                name="THI moyen"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey={() => 68}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Seuil de stress (68)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* THI Range Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des plages THI</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={thiRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Nombre de mesures">
                {thiRangeData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#10b981' : index === 1 ? '#fbbf24' : index === 2 ? '#f97316' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stress Level Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des niveaux de stress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stressDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stressDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reproduction Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statuts de reproduction</h3>
          <div className="space-y-4">
            {[
              { status: 'pregnant', label: 'Gestantes', color: 'bg-green-500' },
              { status: 'inseminated', label: 'Inséminées', color: 'bg-blue-500' },
              { status: 'open', label: 'Vides', color: 'bg-yellow-500' },
              { status: 'dry', label: 'Taries', color: 'bg-gray-500' },
            ].map(({ status, label, color }) => {
              const count = filteredCows.filter((c) => c.reproductionStatus === status).length;
              const percentage = kpis.totalCows > 0 ? (count / kpis.totalCows) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
