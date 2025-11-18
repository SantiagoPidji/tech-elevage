import React, { useState, useMemo } from 'react';
import type { CowData, THIReading, ReproductionEvent, FilterOptions } from '../types';
import { initializeMockData } from '../data/mockData';
import { subDays, format, isWithinInterval, parseISO } from 'date-fns';
import { DataContext } from './context';

// Initialize data once
const initialData = initializeMockData();

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cows] = useState<CowData[]>(initialData.cows);
  const [thiReadings] = useState<THIReading[]>(initialData.thiReadings);
  const [reproductionEvents] = useState<ReproductionEvent[]>(initialData.reproductionEvents);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
    thiRange: {
      min: 0,
      max: 100,
    },
    cowIds: [],
  });

  // Filter readings based on current filters
  const filteredReadings = useMemo(() => {
    return thiReadings.filter((reading) => {
      const readingDate = parseISO(reading.timestamp);
      const startDate = parseISO(filters.dateRange.start);
      const endDate = parseISO(filters.dateRange.end);

      const dateInRange = isWithinInterval(readingDate, { start: startDate, end: endDate });
      const thiInRange = reading.thi >= filters.thiRange.min && reading.thi <= filters.thiRange.max;
      const cowMatch = filters.cowIds.length === 0 || filters.cowIds.includes(reading.cowId);
      const stressMatch = !filters.stressLevel || reading.stressLevel === filters.stressLevel;

      return dateInRange && thiInRange && cowMatch && stressMatch;
    });
  }, [thiReadings, filters]);

  // Get unique cow IDs from filtered readings
  const filteredCows = useMemo(() => {
    const filteredCowIds = new Set(filteredReadings.map((r) => r.cowId));
    return cows.filter((cow) => 
      filters.cowIds.length === 0 ? filteredCowIds.has(cow.id) : filters.cowIds.includes(cow.id)
    );
  }, [cows, filteredReadings, filters.cowIds]);

  return (
    <DataContext.Provider
      value={{
        cows,
        thiReadings,
        reproductionEvents,
        filters,
        setFilters,
        filteredReadings,
        filteredCows,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};


