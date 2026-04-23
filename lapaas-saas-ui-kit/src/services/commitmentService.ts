// Daily Top-3 Commitments Service

import { Commitment, DailyTop3, CommitmentStats, RescheduleQueue } from '../types/commitments';

const API_BASE = 'http://localhost:3000/api/v1';

export const commitmentService = {
  // Get today's top-3 commitments
  async getTodayTop3(userId: string, orgId: string): Promise<DailyTop3 | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE}/commitments/top3?user_id=${userId}&org_id=${orgId}&date=${today}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching today\'s top-3:', error);
      return null;
    }
  },

  // Get top-3 for specific date
  async getTop3ByDate(userId: string, orgId: string, date: string): Promise<DailyTop3 | null> {
    try {
      const response = await fetch(
        `${API_BASE}/commitments/top3?user_id=${userId}&org_id=${orgId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching top-3 for date:', error);
      return null;
    }
  },

  // Create commitment
  async createCommitment(
    userId: string,
    orgId: string,
    commitment: Omit<Commitment, 'id' | 'userId' | 'orgId' | 'createdAt' | 'updatedAt'>
  ): Promise<Commitment | null> {
    try {
      const response = await fetch(`${API_BASE}/commitments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...commitment, userId, orgId })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating commitment:', error);
      return null;
    }
  },

  // Update commitment
  async updateCommitment(commitmentId: string, updates: Partial<Commitment>): Promise<Commitment | null> {
    try {
      const response = await fetch(`${API_BASE}/commitments/${commitmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating commitment:', error);
      return null;
    }
  },

  // Mark commitment as completed
  async completeCommitment(commitmentId: string): Promise<Commitment | null> {
    return this.updateCommitment(commitmentId, { status: 'completed' });
  },

  // Mark commitment as missed
  async missCommitment(commitmentId: string): Promise<Commitment | null> {
    return this.updateCommitment(commitmentId, { status: 'missed' });
  },

  // Delete commitment
  async deleteCommitment(commitmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/commitments/${commitmentId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting commitment:', error);
      return false;
    }
  },

  // Get weekly statistics
  async getWeeklyStats(userId: string, orgId: string, startDate: string): Promise<CommitmentStats | null> {
    try {
      const response = await fetch(
        `${API_BASE}/commitments/statistics?user_id=${userId}&org_id=${orgId}&start_date=${startDate}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  },

  // Get reschedule queue
  async getRescheduleQueue(userId: string, orgId: string): Promise<RescheduleQueue[]> {
    try {
      const response = await fetch(
        `${API_BASE}/commitments/reschedule-queue?user_id=${userId}&org_id=${orgId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching reschedule queue:', error);
      return [];
    }
  },

  // Reschedule commitment
  async rescheduleCommitment(
    commitmentId: string,
    newDate: string,
    reason: 'missed' | 'delegate' | 'reschedule'
  ): Promise<Commitment | null> {
    try {
      const response = await fetch(`${API_BASE}/commitments/${commitmentId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDate, reason })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error rescheduling commitment:', error);
      return null;
    }
  },

  // Delegate commitment
  async delegateCommitment(
    commitmentId: string,
    assignTo: string,
    reason: string
  ): Promise<Commitment | null> {
    try {
      const response = await fetch(`${API_BASE}/commitments/${commitmentId}/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignTo, reason })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error delegating commitment:', error);
      return null;
    }
  },

  // End-of-day check and score
  async endOfDayCheck(userId: string, orgId: string, date: string): Promise<DailyTop3 | null> {
    try {
      const response = await fetch(`${API_BASE}/commitments/end-of-day-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orgId, date })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error performing end-of-day check:', error);
      return null;
    }
  },

  // Get commitment history
  async getHistory(userId: string, orgId: string, days: number = 30): Promise<DailyTop3[]> {
    try {
      const response = await fetch(
        `${API_BASE}/commitments/history?user_id=${userId}&org_id=${orgId}&days=${days}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }
};
