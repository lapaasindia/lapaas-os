// Structured Request Intake Types

export type RequestCategory = 'bug' | 'feature' | 'support' | 'question' | 'other';
export type RequestUrgency = 'P1' | 'P2' | 'P3' | 'P4';
export type RequestStatus = 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface Request {
  id: string;
  orgId: string;
  requesterId: string;
  category: RequestCategory;
  urgency: RequestUrgency;
  title: string;
  description: string;
  whatTried?: string;
  impact?: string;
  deadline?: string; // YYYY-MM-DD
  attachments?: string[]; // File URLs
  status: RequestStatus;
  assignedTo?: string;
  slaDueAt: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

export interface RequestTicket {
  id: string;
  request: Request;
  slaClock: SLAClock;
  escalationLevel: number;
  notes: string[];
}

export interface SLAClock {
  requestId: string;
  createdAt: string;
  dueAt: string;
  remainingMinutes: number;
  breached: boolean;
  urgency: RequestUrgency;
}

export interface RequestStats {
  totalRequests: number;
  newRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  resolvedRequests: number;
  avgResolutionTime: number; // minutes
  slaBreachers: number;
  slaComplianceRate: number; // percentage
}

export interface EscalationRule {
  urgency: RequestUrgency;
  routeTo: 'founder' | 'manager' | 'office_hours' | 'faq';
  requiresJustification: boolean;
  slaMinutes: number;
}

// SLA Configuration
export const SLA_CONFIG: Record<RequestUrgency, number> = {
  P1: 60, // 1 hour
  P2: 240, // 4 hours
  P3: 1440, // 24 hours
  P4: 2880 // 48 hours
};

// Category Configuration
export const CATEGORY_CONFIG: Record<RequestCategory, { label: string; icon: string; color: string }> = {
  bug: { label: 'Bug', icon: '🐛', color: 'text-red-400' },
  feature: { label: 'Feature', icon: '✨', color: 'text-blue-400' },
  support: { label: 'Support', icon: '🆘', color: 'text-orange-400' },
  question: { label: 'Question', icon: '❓', color: 'text-yellow-400' },
  other: { label: 'Other', icon: '📋', color: 'text-gray-400' }
};

// Urgency Configuration
export const URGENCY_CONFIG: Record<RequestUrgency, { label: string; color: string; bgColor: string }> = {
  P1: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-900' },
  P2: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-900' },
  P3: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-900' },
  P4: { label: 'Low', color: 'text-blue-400', bgColor: 'bg-blue-900' }
};

// Helper Functions
export const calculateSLADue = (urgency: RequestUrgency): Date => {
  const now = new Date();
  const slaMinutes = SLA_CONFIG[urgency];
  return new Date(now.getTime() + slaMinutes * 60000);
};

export const calculateRemainingMinutes = (dueAt: string): number => {
  const due = new Date(dueAt);
  const now = new Date();
  return Math.round((due.getTime() - now.getTime()) / 60000);
};

export const isSLABreached = (dueAt: string): boolean => {
  return calculateRemainingMinutes(dueAt) < 0;
};

export const getUrgencyColor = (urgency: RequestUrgency): string => {
  return URGENCY_CONFIG[urgency].color;
};

export const getUrgencyBgColor = (urgency: RequestUrgency): string => {
  return URGENCY_CONFIG[urgency].bgColor;
};

export const getCategoryIcon = (category: RequestCategory): string => {
  return CATEGORY_CONFIG[category].icon;
};

export const getCategoryLabel = (category: RequestCategory): string => {
  return CATEGORY_CONFIG[category].label;
};

export const getStatusIcon = (status: RequestStatus): string => {
  switch (status) {
    case 'new':
      return '🆕';
    case 'assigned':
      return '👤';
    case 'in_progress':
      return '⏳';
    case 'resolved':
      return '✅';
    case 'closed':
      return '🔒';
    default:
      return '📋';
  }
};

export const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'new':
      return 'New';
    case 'assigned':
      return 'Assigned';
    case 'in_progress':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
};
