import { offlineStorage, SyncQueueItem } from './offlineDb';

const API_BASE = 'http://localhost:3000/api/v1';
const MAX_RETRIES = 3;

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncManager {
  private isSyncing = false;
  private syncInterval: number | null = null;

  // Start automatic sync when online
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;

    // Sync immediately when coming online
    window.addEventListener('online', () => {
      console.log('📶 Back online - starting sync...');
      this.syncAll();
    });

    // Periodic sync
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);

    // Initial sync if online
    if (navigator.onLine) {
      this.syncAll();
    }
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress or offline'] };
    }

    this.isSyncing = true;
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      const pendingItems = await offlineStorage.getPendingSyncItems();
      
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await offlineStorage.removeSyncItem(item.id!);
          result.synced++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to sync ${item.entityType} ${item.entityId}: ${error}`);
          
          if (item.retries < MAX_RETRIES) {
            await offlineStorage.incrementRetry(item.id!);
          } else {
            // Remove after max retries
            await offlineStorage.removeSyncItem(item.id!);
            console.error(`Max retries reached for ${item.entityType} ${item.entityId}`);
          }
        }
      }

      if (result.failed > 0) {
        result.success = false;
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync error: ${error}`);
    } finally {
      this.isSyncing = false;
    }

    if (result.synced > 0) {
      console.log(`✅ Synced ${result.synced} items`);
    }
    if (result.failed > 0) {
      console.warn(`⚠️ Failed to sync ${result.failed} items`);
    }

    return result;
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const endpoint = this.getEndpoint(item.entityType);
    
    switch (item.action) {
      case 'create':
        await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
        
      case 'update':
        await fetch(`${API_BASE}/${endpoint}/${item.entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
        
      case 'delete':
        await fetch(`${API_BASE}/${endpoint}/${item.entityId}`, {
          method: 'DELETE'
        });
        break;
    }
  }

  private getEndpoint(entityType: string): string {
    const endpoints: Record<string, string> = {
      task: 'tasks',
      meeting: 'meetings',
      commitment: 'commitments',
      request: 'requests'
    };
    return endpoints[entityType] || entityType;
  }

  // Fetch and cache data for offline use
  async cacheDataForOffline(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Cache tasks
      const tasksRes = await fetch(`${API_BASE}/tasks?org_id=org-001`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        await offlineStorage.saveTasks(tasksData.data || []);
      }

      // Cache meetings
      const meetingsRes = await fetch(`${API_BASE}/meetings?org_id=org-001`);
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        await offlineStorage.saveMeetings(meetingsData.data || []);
      }

      // Cache commitments
      const commitmentsRes = await fetch(`${API_BASE}/commitments?org_id=org-001`);
      if (commitmentsRes.ok) {
        const commitmentsData = await commitmentsRes.json();
        await offlineStorage.saveCommitments(commitmentsData.data || []);
      }

      // Cache requests
      const requestsRes = await fetch(`${API_BASE}/requests?org_id=org-001`);
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        await offlineStorage.saveRequests(requestsData.data || []);
      }

      console.log('📦 Data cached for offline use');
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Get pending sync count
  async getPendingCount(): Promise<number> {
    const items = await offlineStorage.getPendingSyncItems();
    return items.length;
  }
}

export const syncManager = new SyncManager();
export default syncManager;
