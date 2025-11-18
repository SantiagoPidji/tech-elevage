import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';

export const CowProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cows, thiReadings, reproductionEvents } = useData();

  const cow = cows.find((c) => c.id === id);
  const cowReadings = thiReadings.filter((r) => r.cowId === id);
  const cowEvents = reproductionEvents.filter((e) => e.cowId === id);

  // Calculate stats
  const stats = useMemo(() => {
    if (cowReadings.length === 0) {
      return {
        avgTHI: 0,
        maxTHI: 0,
        minTHI: 0,
        stressCount: 0,
        stressPercentage: 0,
        impactCount: 0,
        impactPercentage: 0,
        consecutiveStressDays: 0,
      };
    }

    const avgTHI = cowReadings.reduce((sum, r) => sum + r.thi, 0) / cowReadings.length;
    const maxTHI = Math.max(...cowReadings.map((r) => r.thi));
    const minTHI = Math.min(...cowReadings.map((r) => r.thi));
    const stressReadings = cowReadings.filter((r) => r.thi > 68);
    const impactReadings = cowReadings.filter((r) => r.reproductiveImpact);

    // Calculate consecutive stress days
    const sortedReadings = [...cowReadings].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    let consecutiveStressDays = 0;
    for (const reading of sortedReadings) {
      if (reading.thi > 68) {
        consecutiveStressDays++;
      } else {
        break;
      }
    }

    return {
      avgTHI: Math.round(avgTHI * 10) / 10,
      maxTHI: Math.round(maxTHI * 10) / 10,
      minTHI: Math.round(minTHI * 10) / 10,
      stressCount: stressReadings.length,
      stressPercentage: Math.round((stressReadings.length / cowReadings.length) * 100),
      impactCount: impactReadings.length,
      impactPercentage: Math.round((impactReadings.length / cowReadings.length) * 100),
      consecutiveStressDays,
    };
  }, [cowReadings]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    return cowReadings
      .map((reading) => ({
        date: format(parseISO(reading.timestamp), 'dd/MM'),
        thi: reading.thi,
        temp: reading.temperature,
        humidity: reading.humidity,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }, [cowReadings]);

  // Stress level distribution
  const stressDistribution = useMemo(() => {
    const distribution = { none: 0, mild: 0, moderate: 0, severe: 0 };
    cowReadings.forEach((r) => {
      distribution[r.stressLevel]++;
    });

    return [
      { name: 'Aucun', count: distribution.none },
      { name: 'Léger', count: distribution.mild },
      { name: 'Modéré', count: distribution.moderate },
      { name: 'Sévère', count: distribution.severe },
    ];
  }, [cowReadings]);

  // Early return check after all hooks
  if (!cow) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Vache non trouvée</p>
        <button
          onClick={() => navigate('/cows')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const daysSinceCalving = differenceInDays(new Date(), parseISO(cow.lastCalvingDate));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/cows')}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        <span>←</span>
        <span>Retour à la liste</span>
      </button>

      {/* Cow Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">🐄</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{cow.name}</h1>
              <p className="text-gray-600 mt-1">{cow.id} • {cow.breed}</p>
              <div className="flex items-center space-x-3 mt-2">
                {getStatusBadge(cow.reproductionStatus)}
                <span className="text-sm text-gray-600">{cow.age} ans</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Dernier vêlage</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(parseISO(cow.lastCalvingDate), 'dd/MM/yyyy')}
            </p>
            <p className="text-xs text-gray-500 mt-1">Il y a {daysSinceCalving} jours</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">THI moyen</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              stats.avgTHI > 72 ? 'text-red-600' : stats.avgTHI > 68 ? 'text-orange-600' : 'text-green-600'
            }`}
          >
            {stats.avgTHI}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">THI max</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.maxTHI}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Jours de stress</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.stressCount}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.stressPercentage}% du temps</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Impact repro</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.impactPercentage}%</p>
          <p className="text-xs text-gray-500 mt-1">{stats.impactCount} mesures</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du THI (30 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="thi" stroke="#3b82f6" strokeWidth={2} name="THI" />
              <Line
                type="monotone"
                dataKey={() => 68}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Seuil (68)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stress Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des niveaux de stress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stressDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Nombre de mesures" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature and Humidity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Température et Humidité</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temp"
              stroke="#f97316"
              strokeWidth={2}
              name="Température (°F)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Humidité (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reproduction Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Événements de reproduction</h3>
        {cowEvents.length > 0 ? (
          <div className="space-y-3">
            {cowEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {event.eventType === 'insemination' && '🔬 Insémination'}
                    {event.eventType === 'pregnancy_check' && '🤰 Contrôle gestation'}
                    {event.eventType === 'calving' && '🐄 Vêlage'}
                    {event.eventType === 'heat_detection' && '🔥 Détection chaleurs'}
                  </p>
                  <p className="text-sm text-gray-600">{event.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{format(parseISO(event.date), 'dd/MM/yyyy')}</p>
                  <p className={`text-xs ${event.success ? 'text-green-600' : 'text-red-600'}`}>
                    {event.success ? '✓ Succès' : '✗ Échec'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun événement enregistré</p>
        )}
      </div>

      {/* Alert Section */}
      {stats.consecutiveStressDays > 3 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-red-900">Alerte: Stress prolongé</h4>
              <p className="text-sm text-red-700 mt-1">
                Cette vache a connu {stats.consecutiveStressDays} jours consécutifs de stress thermique (THI &gt; 68).
                Un impact sur la reproduction est probable. Veuillez prendre des mesures correctives.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
