export const mockMetrics = {
  newListings: {
    value: 127,
    trend: '+15%',
    trendDirection: 'up' as const,
    subtitle: '7 derniers jours'
  },
  medianPrice: {
    value: '285 000€',
    trend: '-2.5%',
    trendDirection: 'down' as const,
    subtitle: 'Paris'
  },
  opportunities: {
    value: 12,
    badge: 'Nouveau',
    subtitle: 'Prix < -15% marché'
  },
  alerts: {
    value: 5,
    subtitle: "Aujourd'hui"
  }
};

export const mockPriceEvolution = [
  { date: '2024-10-07', price: 280000 },
  { date: '2024-10-14', price: 282000 },
  { date: '2024-10-21', price: 283000 },
  { date: '2024-10-28', price: 281000 },
  { date: '2024-11-04', price: 285000 },
];

export interface Report {
  id: string;
  title: string;
  location: string;
  listingsCount: number;
  medianPrice: number;
  newClients: number;
  marketShare: number;
  createdAt: string;
  status: 'ready' | 'processing' | 'archived';
  badges?: Array<'opportunity' | 'trending' | 'hot'>;
}

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Rapport Quotidien - Paris',
    location: 'Paris',
    listingsCount: 45,
    medianPrice: 520000,
    newClients: 8,
    marketShare: 12.5,
    createdAt: '2025-11-06T21:28:00',
    status: 'ready',
    badges: ['opportunity', 'hot']
  },
  {
    id: '2',
    title: 'Analyse Hebdomadaire - Lyon',
    location: 'Lyon',
    listingsCount: 32,
    medianPrice: 380000,
    newClients: 5,
    marketShare: 8.2,
    createdAt: '2025-11-05T14:15:00',
    status: 'ready',
    badges: ['trending']
  },
  {
    id: '3',
    title: 'Étude de Marché - Marseille',
    location: 'Marseille',
    listingsCount: 28,
    medianPrice: 310000,
    newClients: 3,
    marketShare: 6.8,
    createdAt: '2025-11-04T09:30:00',
    status: 'ready'
  },
];
