// Daily Top-3 Commitments Types

export interface Commitment {
  id: string;
  userId: string;
  orgId: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  effortMinutes: number;
  linkedTasks?: string[]; // Task IDs
  linkedProjects?: string[]; // Project IDs
  status: 'pending' | 'completed' | 'missed' | 'rescheduled';
  priority: 'P1' | 'P2' | 'P3';
  createdAt: string;
  updatedAt: string;
}

export interface DailyTop3 {
  date: string;
  commitments: Commitment[];
  completedCount: number;
  score: number; // 0-100
}

export interface CommitmentStats {
  totalCommitments: number;
  completedThisWeek: number;
  missedThisWeek: number;
  completionRate: number; // percentage
  averageScore: number;
  streakDays: number;
}

export interface RescheduleQueue {
  id: string;
  commitment: Commitment;
  originalDate: string;
  reason: 'missed' | 'delegate' | 'reschedule';
  suggestedDate?: string;
  createdAt: string;
}

export interface CommitmentTemplate {
  id: string;
  name: string;
  description: string;
  effortMinutes: number;
  linkedTasks?: string[];
  linkedProjects?: string[];
}

// Helper functions
export const calculateScore = (completed: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((completed / total) * 100);
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-900';
  if (score >= 60) return 'bg-yellow-900';
  if (score >= 40) return 'bg-orange-900';
  return 'bg-red-900';
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'P1':
      return 'text-red-400';
    case 'P2':
      return 'text-orange-400';
    case 'P3':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
};

export const getPriorityBgColor = (priority: string): string => {
  switch (priority) {
    case 'P1':
      return 'bg-red-900';
    case 'P2':
      return 'bg-orange-900';
    case 'P3':
      return 'bg-yellow-900';
    default:
      return 'bg-gray-900';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'pending':
      return '⏳';
    case 'missed':
      return '❌';
    case 'rescheduled':
      return '🔄';
    default:
      return '📋';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'missed':
      return 'Missed';
    case 'rescheduled':
      return 'Rescheduled';
    default:
      return 'Unknown';
  }
};
