export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    searches: number;
    reports: number;
    alerts: number;
    apiCalls: number;
  };
  popular?: boolean;
  current?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  downloadUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export const mockPlans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'month',
    features: [
      '10 recherches par jour',
      '1 rapport par mois',
      '5 alertes actives',
      'Support par email',
    ],
    limits: {
      searches: 300,
      reports: 1,
      alerts: 5,
      apiCalls: 1000,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      'Recherches illimitées',
      '10 rapports par mois',
      '20 alertes actives',
      'Export PDF',
      'Support prioritaire',
    ],
    limits: {
      searches: -1,
      reports: 10,
      alerts: 20,
      apiCalls: 10000,
    },
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: [
      'Tout de Starter',
      'Rapports illimités',
      '100 alertes actives',
      'API access',
      'Analyses IA avancées',
      'Support 24/7',
    ],
    limits: {
      searches: -1,
      reports: -1,
      alerts: 100,
      apiCalls: 100000,
    },
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Tout de Pro',
      'Alertes illimitées',
      'White label',
      'Intégration personnalisée',
      'Account manager dédié',
    ],
    limits: {
      searches: -1,
      reports: -1,
      alerts: -1,
      apiCalls: -1,
    },
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'INV-2025-001',
    date: '2025-11-01',
    amount: 99,
    status: 'paid',
    plan: 'Pro',
  },
  {
    id: 'INV-2025-002',
    date: '2025-10-01',
    amount: 99,
    status: 'paid',
    plan: 'Pro',
  },
  {
    id: 'INV-2025-003',
    date: '2025-09-01',
    amount: 29,
    status: 'paid',
    plan: 'Starter',
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
  },
];

export const mockUsage = {
  searches: {
    used: 8450,
    limit: -1,
    percentage: 0,
  },
  reports: {
    used: 23,
    limit: -1,
    percentage: 0,
  },
  alerts: {
    used: 45,
    limit: 100,
    percentage: 45,
  },
  apiCalls: {
    used: 34820,
    limit: 100000,
    percentage: 34.82,
  },
};

