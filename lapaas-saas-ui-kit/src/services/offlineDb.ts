import Dexie, { Table } from 'dexie';

// Types for offline storage
export interface OfflineTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_at?: string;
  assigned_to?: string;
  blocked?: boolean;
  recurring?: boolean;
  time_tracked?: number;
  org_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface OfflineMeeting {
  id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status: string;
  org_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface OfflineCommitment {
  id: string;
  title: string;
  effort_minutes?: number;
  status: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  org_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface OfflineRequest {
  id: string;
  description: string;
  category?: string;
  urgency: string;
  status: string;
  org_id: string;
  requester_id?: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  pendingAction?: 'create' | 'update' | 'delete';
}

export interface SyncQueueItem {
  id?: number;
  entityType: 'task' | 'meeting' | 'commitment' | 'request';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// Dexie Database Class
class LapaasOfflineDB extends Dexie {
  tasks!: Table<OfflineTask, string>;
  meetings!: Table<OfflineMeeting, string>;
  commitments!: Table<OfflineCommitment, string>;
  requests!: Table<OfflineRequest, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('LapaasOfflineDB');
    
    this.version(1).stores({
      tasks: 'id, org_id, user_id, status, synced, pendingAction',
      meetings: 'id, org_id, status, synced, pendingAction',
      commitments: 'id, org_id, user_id, status, synced, pendingAction',
      requests: 'id, org_id, status, synced, pendingAction',
      syncQueue: '++id, entityType, entityId, timestamp'
    });
  }
}

// Singleton instance
export const offlineDb = new LapaasOfflineDB();

// Helper functions for offline operations
export const offlineStorage = {
  // Tasks
  async saveTasks(tasks: OfflineTask[]): Promise<void> {
    await offlineDb.tasks.bulkPut(tasks.map(t => ({ ...t, synced: true })));
  },

  async getTask(id: string): Promise<OfflineTask | undefined> {
    return offlineDb.tasks.get(id);
  },

  async getAllTasks(orgId?: string): Promise<OfflineTask[]> {
    if (orgId) {
      return offlineDb.tasks.where('org_id').equals(orgId).toArray();
    }
    return offlineDb.tasks.toArray();
  },

  async saveTaskOffline(task: OfflineTask, action: 'create' | 'update'): Promise<void> {
    await offlineDb.tasks.put({ ...task, synced: false, pendingAction: action });
    await offlineDb.syncQueue.add({
      entityType: 'task',
      entityId: task.id,
      action,
      data: task as unknown as Record<string, unknown>,
      timestamp: Date.now(),
      retries: 0
    });
  },

  async deleteTaskOffline(id: string): Promise<void> {
    const task = await offlineDb.tasks.get(id);
    if (task) {
      await offlineDb.tasks.update(id, { synced: false, pendingAction: 'delete' });
      await offlineDb.syncQueue.add({
        entityType: 'task',
        entityId: id,
        action: 'delete',
        data: { id },
        timestamp: Date.now(),
        retries: 0
      });
    }
  },

  // Meetings
  async saveMeetings(meetings: OfflineMeeting[]): Promise<void> {
    await offlineDb.meetings.bulkPut(meetings.map(m => ({ ...m, synced: true })));
  },

  async getMeeting(id: string): Promise<OfflineMeeting | undefined> {
    return offlineDb.meetings.get(id);
  },

  async getAllMeetings(orgId?: string): Promise<OfflineMeeting[]> {
    if (orgId) {
      return offlineDb.meetings.where('org_id').equals(orgId).toArray();
    }
    return offlineDb.meetings.toArray();
  },

  async saveMeetingOffline(meeting: OfflineMeeting, action: 'create' | 'update'): Promise<void> {
    await offlineDb.meetings.put({ ...meeting, synced: false, pendingAction: action });
    await offlineDb.syncQueue.add({
      entityType: 'meeting',
      entityId: meeting.id,
      action,
      data: meeting as unknown as Record<string, unknown>,
      timestamp: Date.now(),
      retries: 0
    });
  },

  // Commitments
  async saveCommitments(commitments: OfflineCommitment[]): Promise<void> {
    await offlineDb.commitments.bulkPut(commitments.map(c => ({ ...c, synced: true })));
  },

  async getAllCommitments(orgId?: string): Promise<OfflineCommitment[]> {
    if (orgId) {
      return offlineDb.commitments.where('org_id').equals(orgId).toArray();
    }
    return offlineDb.commitments.toArray();
  },

  async saveCommitmentOffline(commitment: OfflineCommitment, action: 'create' | 'update'): Promise<void> {
    await offlineDb.commitments.put({ ...commitment, synced: false, pendingAction: action });
    await offlineDb.syncQueue.add({
      entityType: 'commitment',
      entityId: commitment.id,
      action,
      data: commitment as unknown as Record<string, unknown>,
      timestamp: Date.now(),
      retries: 0
    });
  },

  // Requests
  async saveRequests(requests: OfflineRequest[]): Promise<void> {
    await offlineDb.requests.bulkPut(requests.map(r => ({ ...r, synced: true })));
  },

  async getAllRequests(orgId?: string): Promise<OfflineRequest[]> {
    if (orgId) {
      return offlineDb.requests.where('org_id').equals(orgId).toArray();
    }
    return offlineDb.requests.toArray();
  },

  // Sync Queue
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return offlineDb.syncQueue.orderBy('timestamp').toArray();
  },

  async removeSyncItem(id: number): Promise<void> {
    await offlineDb.syncQueue.delete(id);
  },

  async incrementRetry(id: number): Promise<void> {
    await offlineDb.syncQueue.update(id, { retries: (await offlineDb.syncQueue.get(id))?.retries ?? 0 + 1 });
  },

  // Clear all offline data
  async clearAll(): Promise<void> {
    await offlineDb.tasks.clear();
    await offlineDb.meetings.clear();
    await offlineDb.commitments.clear();
    await offlineDb.requests.clear();
    await offlineDb.syncQueue.clear();
  }
};

export default offlineStorage;
