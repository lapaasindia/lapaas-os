import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, OfflineTask, OfflineMeeting, OfflineCommitment, OfflineRequest } from '../services/offlineDb';
import { syncManager } from '../services/syncManager';

const API_BASE = 'http://localhost:3000/api/v1';

interface UseOfflineDataOptions {
  orgId?: string;
  userId?: string;
  autoSync?: boolean;
}

// Hook for tasks with offline support
export function useOfflineTasks(options: UseOfflineDataOptions = {}) {
  const { orgId = 'org-001', userId = '', autoSync = true } = options;
  const [tasks, setTasks] = useState<OfflineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        // Fetch from API and cache
        const userParam = userId ? `&user_id=${userId}` : '';
        const res = await fetch(`${API_BASE}/tasks?org_id=${orgId}${userParam}`);
        if (res.ok) {
          const data = await res.json();
          const tasksData = (data.data || []).map((t: OfflineTask) => ({
            ...t,
            org_id: orgId,
            synced: true
          }));
          await offlineStorage.saveTasks(tasksData);
          setTasks(tasksData);
        }
      } else {
        // Load from offline storage
        const offlineTasks = await offlineStorage.getAllTasks(orgId);
        setTasks(offlineTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Fallback to offline data
      const offlineTasks = await offlineStorage.getAllTasks(orgId);
      setTasks(offlineTasks);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  const createTask = useCallback(async (task: Omit<OfflineTask, 'id' | 'created_at' | 'updated_at' | 'synced'>) => {
    const newTask: OfflineTask = {
      ...task,
      id: `task-${Date.now()}`,
      org_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      synced: navigator.onLine
    };

    if (navigator.onLine) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const data = await res.json();
          newTask.id = data.data?.id || newTask.id;
        }
      } catch (error) {
        console.error('Failed to create task online:', error);
        await offlineStorage.saveTaskOffline(newTask, 'create');
      }
    } else {
      await offlineStorage.saveTaskOffline(newTask, 'create');
    }

    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [orgId]);

  const updateTask = useCallback(async (id: string, updates: Partial<OfflineTask>) => {
    const existingTask = tasks.find(t => t.id === id);
    if (!existingTask) return;

    const updatedTask: OfflineTask = {
      ...existingTask,
      ...updates,
      updated_at: new Date().toISOString(),
      synced: navigator.onLine
    };

    if (navigator.onLine) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        });
      } catch (error) {
        console.error('Failed to update task online:', error);
        await offlineStorage.saveTaskOffline(updatedTask, 'update');
      }
    } else {
      await offlineStorage.saveTaskOffline(updatedTask, 'update');
    }

    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    if (navigator.onLine) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete task online:', error);
        await offlineStorage.deleteTaskOffline(id);
      }
    } else {
      await offlineStorage.deleteTaskOffline(id);
    }

    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    fetchTasks();

    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync) {
        syncManager.syncAll().then(() => fetchTasks());
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchTasks, autoSync]);

  return {
    tasks,
    loading,
    isOnline,
    createTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks
  };
}

// Hook for meetings with offline support
export function useOfflineMeetings(options: UseOfflineDataOptions = {}) {
  const { orgId = 'org-001', userId = '' } = options;
  const [meetings, setMeetings] = useState<OfflineMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const userParam = userId ? `&user_id=${userId}` : '';
        const res = await fetch(`${API_BASE}/meetings?org_id=${orgId}${userParam}`);
        if (res.ok) {
          const data = await res.json();
          const meetingsData = (data.data || []).map((m: OfflineMeeting) => ({
            ...m,
            org_id: orgId,
            synced: true
          }));
          await offlineStorage.saveMeetings(meetingsData);
          setMeetings(meetingsData);
        }
      } else {
        const offlineMeetings = await offlineStorage.getAllMeetings(orgId);
        setMeetings(offlineMeetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      const offlineMeetings = await offlineStorage.getAllMeetings(orgId);
      setMeetings(offlineMeetings);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, refresh: fetchMeetings };
}

// Hook for commitments with offline support
export function useOfflineCommitments(options: UseOfflineDataOptions = {}) {
  const { orgId = 'org-001', userId = '' } = options;
  const [commitments, setCommitments] = useState<OfflineCommitment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommitments = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const userParam = userId ? `&user_id=${userId}` : '';
        const res = await fetch(`${API_BASE}/commitments?org_id=${orgId}${userParam}`);
        if (res.ok) {
          const data = await res.json();
          const commitmentsData = (data.data || []).map((c: OfflineCommitment) => ({
            ...c,
            org_id: orgId,
            synced: true
          }));
          await offlineStorage.saveCommitments(commitmentsData);
          setCommitments(commitmentsData);
        }
      } else {
        const offlineCommitments = await offlineStorage.getAllCommitments(orgId);
        setCommitments(offlineCommitments);
      }
    } catch (error) {
      console.error('Error fetching commitments:', error);
      const offlineCommitments = await offlineStorage.getAllCommitments(orgId);
      setCommitments(offlineCommitments);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchCommitments();
  }, [fetchCommitments]);

  return { commitments, loading, refresh: fetchCommitments };
}

// Hook for requests with offline support
export function useOfflineRequests(options: UseOfflineDataOptions = {}) {
  const { orgId = 'org-001', userId = '' } = options;
  const [requests, setRequests] = useState<OfflineRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.onLine) {
        const userParam = userId ? `&user_id=${userId}` : '';
        const res = await fetch(`${API_BASE}/requests?org_id=${orgId}${userParam}`);
        if (res.ok) {
          const data = await res.json();
          const requestsData = (data.data || []).map((r: OfflineRequest) => ({
            ...r,
            org_id: orgId,
            synced: true
          }));
          await offlineStorage.saveRequests(requestsData);
          setRequests(requestsData);
        }
      } else {
        const offlineRequests = await offlineStorage.getAllRequests(orgId);
        setRequests(offlineRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      const offlineRequests = await offlineStorage.getAllRequests(orgId);
      setRequests(offlineRequests);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, refresh: fetchRequests };
}
