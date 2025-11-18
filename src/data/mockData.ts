import type { CowData, THIReading, ReproductionEvent } from '../types';
import { subDays, subMonths, format } from 'date-fns';

// Generate mock cow data
export const generateCows = (count: number = 50): CowData[] => {
  const breeds = ['Holstein', 'Jersey', 'Montbéliarde', 'Normande', 'Simmental'];
  const statuses: CowData['reproductionStatus'][] = ['pregnant', 'open', 'inseminated', 'dry'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `COW-${String(i + 1).padStart(3, '0')}`,
    name: `Vache ${i + 1}`,
    breed: breeds[Math.floor(Math.random() * breeds.length)],
    age: Math.floor(Math.random() * 8) + 2,
    lastCalvingDate: format(subMonths(new Date(), Math.floor(Math.random() * 12) + 1), 'yyyy-MM-dd'),
    reproductionStatus: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

// Calculate THI from temperature and humidity
const calculateTHI = (temp: number, humidity: number): number => {
  return temp - (0.55 - 0.0055 * humidity) * (temp - 58);
};

// Determine stress level based on THI
const getStressLevel = (thi: number): 'none' | 'mild' | 'moderate' | 'severe' => {
  if (thi < 68) return 'none';
  if (thi < 72) return 'mild';
  if (thi < 80) return 'moderate';
  return 'severe';
};

// Generate THI readings for cows
export const generateTHIReadings = (cows: CowData[], days: number = 90): THIReading[] => {
  const readings: THIReading[] = [];
  const now = new Date();
  
  cows.forEach((cow) => {
    for (let i = 0; i < days; i++) {
      const date = subDays(now, i);
      // Simulate daily variation with seasonal trends
      const seasonalTemp = 75 + Math.sin((i / 365) * 2 * Math.PI) * 15;
      const dailyVariation = Math.random() * 20 - 10;
      const temperature = Math.max(60, Math.min(100, seasonalTemp + dailyVariation));
      const humidity = Math.max(30, Math.min(95, 60 + Math.random() * 30));
      
      const thi = calculateTHI(temperature, humidity);
      const stressLevel = getStressLevel(thi);
      
      readings.push({
        id: `THI-${cow.id}-${i}`,
        cowId: cow.id,
        timestamp: date.toISOString(),
        thi: Math.round(thi * 10) / 10,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        stressLevel,
        reproductiveImpact: thi > 68 && Math.random() > 0.3,
      });
    }
  });
  
  return readings;
};

// Generate reproduction events
export const generateReproductionEvents = (cows: CowData[]): ReproductionEvent[] => {
  const events: ReproductionEvent[] = [];
  const eventTypes: ReproductionEvent['eventType'][] = [
    'insemination',
    'pregnancy_check',
    'calving',
    'heat_detection',
  ];
  
  cows.forEach((cow) => {
    const eventCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < eventCount; i++) {
      const daysAgo = Math.floor(Math.random() * 180);
      events.push({
        id: `EVENT-${cow.id}-${i}`,
        cowId: cow.id,
        date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd'),
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        success: Math.random() > 0.3,
        notes: `Événement ${i + 1} pour ${cow.name}`,
      });
    }
  });
  
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Initialize all mock data
export const initializeMockData = () => {
  const cows = generateCows(50);
  const thiReadings = generateTHIReadings(cows, 90);
  const reproductionEvents = generateReproductionEvents(cows);
  
  return {
    cows,
    thiReadings,
    reproductionEvents,
  };
};
