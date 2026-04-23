import { offlineStorage } from './offlineDb';

const API_BASE = 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  fromCache?: boolean;
  error?: string;
}

/**
 * Offline-first API service
 * - When online: Fetches from API and caches to IndexedDB
 * - When offline: Returns data from IndexedDB cache
 */
export const apiService = {
  // Generic fetch with offline fallback
  async fetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`;
    
    if (navigator.onLine) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          const data = await response.json();
          return { success: true, data: data.data || data, fromCache: false };
        }
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        console.warn(`API fetch failed, trying cache: ${error}`);
        // Fall through to cache
      }
    }
    
    // Try to get from cache
    const cachedData = await this.getFromCache<T>(endpoint);
    if (cachedData) {
      return { success: true, data: cachedData, fromCache: true };
    }
    
    return { success: false, data: [] as unknown as T, error: 'No data available offline' };
  },

  // Get data from IndexedDB cache based on endpoint
  async getFromCache<T>(endpoint: string): Promise<T | null> {
    try {
      if (endpoint.includes('/tasks')) {
        const tasks = await offlineStorage.getAllTasks();
        return tasks as unknown as T;
      }
      if (endpoint.includes('/meetings')) {
        const meetings = await offlineStorage.getAllMeetings();
        return meetings as unknown as T;
      }
      if (endpoint.includes('/commitments')) {
        const commitments = await offlineStorage.getAllCommitments();
        return commitments as unknown as T;
      }
      if (endpoint.includes('/requests')) {
        const requests = await offlineStorage.getAllRequests();
        return requests as unknown as T;
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  },

  // Tasks
  async getTasks(orgId: string = 'org-001') {
    const result = await this.fetch(`/tasks?org_id=${orgId}`);
    if (result.success && !result.fromCache && result.data) {
      // Cache the fresh data
      const tasks = (Array.isArray(result.data) ? result.data : []).map((t: Record<string, unknown>) => ({
        ...t,
        org_id: orgId,
        synced: true
      }));
      await offlineStorage.saveTasks(tasks as never[]);
    }
    return result;
  },

  // Meetings
  async getMeetings(orgId: string = 'org-001') {
    const result = await this.fetch(`/meetings?org_id=${orgId}`);
    if (result.success && !result.fromCache && result.data) {
      const meetings = (Array.isArray(result.data) ? result.data : []).map((m: Record<string, unknown>) => ({
        ...m,
        org_id: orgId,
        synced: true
      }));
      await offlineStorage.saveMeetings(meetings as never[]);
    }
    return result;
  },

  // Commitments
  async getCommitments(orgId: string = 'org-001') {
    const result = await this.fetch(`/commitments?org_id=${orgId}`);
    if (result.success && !result.fromCache && result.data) {
      const commitments = (Array.isArray(result.data) ? result.data : []).map((c: Record<string, unknown>) => ({
        ...c,
        org_id: orgId,
        synced: true
      }));
      await offlineStorage.saveCommitments(commitments as never[]);
    }
    return result;
  },

  // Requests
  async getRequests(orgId: string = 'org-001') {
    const result = await this.fetch(`/requests?org_id=${orgId}`);
    if (result.success && !result.fromCache && result.data) {
      const requests = (Array.isArray(result.data) ? result.data : []).map((r: Record<string, unknown>) => ({
        ...r,
        org_id: orgId,
        synced: true
      }));
      await offlineStorage.saveRequests(requests as never[]);
    }
    return result;
  },

  // Create with offline support
  async createTask(task: Record<string, unknown>) {
    if (navigator.onLine) {
      try {
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        if (response.ok) {
          const data = await response.json();
          return { success: true, data: data.data || data };
        }
      } catch (error) {
        console.warn('Create task failed, queuing for sync:', error);
      }
    }
    
    // Queue for offline sync
    const offlineTask = {
      ...task,
      id: task.id || `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced: false
    };
    await offlineStorage.saveTaskOffline(offlineTask as never, 'create');
    return { success: true, data: offlineTask, queued: true };
  },

  // Update with offline support
  async updateTask(id: string, updates: Record<string, unknown>) {
    if (navigator.onLine) {
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (response.ok) {
          const data = await response.json();
          return { success: true, data: data.data || data };
        }
      } catch (error) {
        console.warn('Update task failed, queuing for sync:', error);
      }
    }
    
    // Queue for offline sync
    const existingTask = await offlineStorage.getTask(id);
    if (existingTask) {
      const updatedTask = { ...existingTask, ...updates, updated_at: new Date().toISOString(), synced: false };
      await offlineStorage.saveTaskOffline(updatedTask as never, 'update');
      return { success: true, data: updatedTask, queued: true };
    }
    return { success: false, error: 'Task not found in cache' };
  },

  // Delete with offline support
  async deleteTask(id: string) {
    if (navigator.onLine) {
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
        if (response.ok) {
          return { success: true };
        }
      } catch (error) {
        console.warn('Delete task failed, queuing for sync:', error);
      }
    }
    
    // Queue for offline sync
    await offlineStorage.deleteTaskOffline(id);
    return { success: true, queued: true };
  }
};

export default apiService;
