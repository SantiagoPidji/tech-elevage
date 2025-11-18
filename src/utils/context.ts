import { createContext } from 'react';
import type { CowData, THIReading, ReproductionEvent, FilterOptions } from '../types';

interface DataContextType {
  cows: CowData[];
  thiReadings: THIReading[];
  reproductionEvents: ReproductionEvent[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  filteredReadings: THIReading[];
  filteredCows: CowData[];
}

export const DataContext = createContext<DataContextType | undefined>(undefined);
