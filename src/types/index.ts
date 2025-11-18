export interface CowData {
  id: string;
  name: string;
  breed: string;
  age: number;
  lastCalvingDate: string;
  reproductionStatus: 'pregnant' | 'open' | 'inseminated' | 'dry';
}

export interface THIReading {
  id: string;
  cowId: string;
  timestamp: string;
  thi: number;
  temperature: number;
  humidity: number;
  stressLevel: 'none' | 'mild' | 'moderate' | 'severe';
  reproductiveImpact: boolean;
}

export interface ReproductionEvent {
  id: string;
  cowId: string;
  date: string;
  eventType: 'insemination' | 'pregnancy_check' | 'calving' | 'heat_detection';
  success: boolean;
  notes: string;
}

export interface DashboardKPIs {
  totalCows: number;
  averageTHI: number;
  cowsInStress: number;
  reproductionImpactRate: number;
  pregnancyRate: number;
  averageStressDays: number;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  thiRange: {
    min: number;
    max: number;
  };
  cowIds: string[];
  stressLevel?: 'none' | 'mild' | 'moderate' | 'severe';
}
