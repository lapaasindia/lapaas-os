// Time Blocking Service

import { TimeBlock, WeeklyTimeBlocks, BlockType } from '../types/timeBlocking';

const API_BASE = 'http://localhost:3000/api/v1';

export const timeBlockingService = {
  // Get all time blocks for a week
  async getWeeklyBlocks(userId: string, orgId: string, startDate: string): Promise<WeeklyTimeBlocks> {
    try {
      const response = await fetch(
        `${API_BASE}/time-blocks/weekly?user_id=${userId}&org_id=${orgId}&start_date=${startDate}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || {};
      }
      return {};
    } catch (error) {
      console.error('Error fetching weekly blocks:', error);
      return {};
    }
  },

  // Get time blocks for a specific date
  async getBlocksByDate(userId: string, orgId: string, date: string): Promise<TimeBlock[]> {
    try {
      const response = await fetch(
        `${API_BASE}/time-blocks?user_id=${userId}&org_id=${orgId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching blocks by date:', error);
      return [];
    }
  },

  // Create time block
  async createBlock(
    userId: string,
    orgId: string,
    block: Omit<TimeBlock, 'id' | 'userId' | 'orgId' | 'createdAt' | 'updatedAt'>
  ): Promise<TimeBlock | null> {
    try {
      const response = await fetch(`${API_BASE}/time-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...block, userId, orgId })
      });
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating block:', error);
      return null;
    }
  },

  // Update time block
  async updateBlock(blockId: string, updates: Partial<TimeBlock>): Promise<TimeBlock | null> {
    try {
      const response = await fetch(`${API_BASE}/time-blocks/${blockId}`, {
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
      console.error('Error updating block:', error);
      return null;
    }
  },

  // Delete time block
  async deleteBlock(blockId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/time-blocks/${blockId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting block:', error);
      return false;
    }
  },

  // Bulk update blocks (for drag-drop)
  async bulkUpdateBlocks(blocks: TimeBlock[]): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/time-blocks/bulk-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks })
      });
      return response.ok;
    } catch (error) {
      console.error('Error bulk updating blocks:', error);
      return false;
    }
  },

  // Get blocks by type
  async getBlocksByType(
    userId: string,
    orgId: string,
    blockType: BlockType,
    startDate: string,
    endDate: string
  ): Promise<TimeBlock[]> {
    try {
      const response = await fetch(
        `${API_BASE}/time-blocks?user_id=${userId}&org_id=${orgId}&type=${blockType}&start_date=${startDate}&end_date=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching blocks by type:', error);
      return [];
    }
  },

  // Get time block statistics
  async getBlockStatistics(userId: string, orgId: string, startDate: string, endDate: string) {
    try {
      const response = await fetch(
        `${API_BASE}/time-blocks/statistics?user_id=${userId}&org_id=${orgId}&start_date=${startDate}&end_date=${endDate}`
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

  // Check for collisions
  async checkCollisions(
    userId: string,
    orgId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBlockId?: string
  ): Promise<{ hasCollision: boolean; collidingBlocks?: TimeBlock[] }> {
    try {
      const response = await fetch(
        `${API_BASE}/time-blocks/check-collision?user_id=${userId}&org_id=${orgId}&date=${date}&start_time=${startTime}&end_time=${endTime}${excludeBlockId ? `&exclude_id=${excludeBlockId}` : ''}`,
        { method: 'GET' }
      );
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return { hasCollision: false };
    } catch (error) {
      console.error('Error checking collisions:', error);
      return { hasCollision: false };
    }
  }
};
