// Escalation Matrix Types

export type EscalationRoute = 'founder' | 'manager' | 'office_hours' | 'faq';
export type RequestUrgency = 'P1' | 'P2' | 'P3' | 'P4';

export interface EscalationRule {
  urgency: RequestUrgency;
  routeTo: EscalationRoute;
  requiresJustification: boolean;
  slaMinutes: number;
  maxRetries: number;
}

export interface EscalationEvent {
  id: string;
  requestId: string;
  fromRoute: EscalationRoute;
  toRoute: EscalationRoute;
  reason: string;
  timestamp: string;
  userId: string;
}

export interface EscalationStats {
  totalEscalations: number;
  p1Escalations: number;
  p2Escalations: number;
  p3Escalations: number;
  p4Escalations: number;
  divertedFromFounder: number;
  divertionRate: number; // percentage
  avgTimeToEscalation: number; // minutes
}

export interface RoutingDecision {
  requestId: string;
  urgency: RequestUrgency;
  recommendedRoute: EscalationRoute;
  requiresJustification: boolean;
  reason: string;
}

// Default Escalation Rules
export const DEFAULT_ESCALATION_RULES: Record<RequestUrgency, EscalationRule> = {
  P1: {
    urgency: 'P1',
    routeTo: 'founder',
    requiresJustification: true,
    slaMinutes: 60,
    maxRetries: 3
  },
  P2: {
    urgency: 'P2',
    routeTo: 'manager',
    requiresJustification: false,
    slaMinutes: 240,
    maxRetries: 2
  },
  P3: {
    urgency: 'P3',
    routeTo: 'office_hours',
    requiresJustification: false,
    slaMinutes: 1440,
    maxRetries: 1
  },
  P4: {
    urgency: 'P4',
    routeTo: 'faq',
    requiresJustification: false,
    slaMinutes: 2880,
    maxRetries: 0
  }
};

// Route Configuration
export const ROUTE_CONFIG: Record<EscalationRoute, { label: string; icon: string; color: string; description: string }> = {
  founder: {
    label: 'Founder/Owner',
    icon: '👑',
    color: 'text-purple-400',
    description: 'Critical issues requiring founder attention'
  },
  manager: {
    label: 'Manager/Lead',
    icon: '📊',
    color: 'text-blue-400',
    description: 'High priority issues for management'
  },
  office_hours: {
    label: 'Office Hours',
    icon: '🕐',
    color: 'text-orange-400',
    description: 'Scheduled office hours slots'
  },
  faq: {
    label: 'FAQ/KB',
    icon: '📚',
    color: 'text-green-400',
    description: 'Self-serve FAQ and knowledge base'
  }
};

// Helper Functions
export const getEscalationRule = (urgency: RequestUrgency): EscalationRule => {
  return DEFAULT_ESCALATION_RULES[urgency];
};

export const getRouteConfig = (route: EscalationRoute) => {
  return ROUTE_CONFIG[route];
};

export const shouldEscalate = (urgency: RequestUrgency, currentRoute: EscalationRoute): boolean => {
  const rule = getEscalationRule(urgency);
  return rule.routeTo !== currentRoute;
};

export const getEscalationPath = (urgency: RequestUrgency): EscalationRoute[] => {
  const paths: Record<RequestUrgency, EscalationRoute[]> = {
    P1: ['faq', 'office_hours', 'manager', 'founder'],
    P2: ['faq', 'office_hours', 'manager'],
    P3: ['faq', 'office_hours'],
    P4: ['faq']
  };
  return paths[urgency];
};

export const calculateDivertionRate = (stats: EscalationStats): number => {
  if (stats.totalEscalations === 0) return 0;
  return Math.round((stats.divertedFromFounder / stats.totalEscalations) * 100);
};
