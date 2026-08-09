import { create } from 'zustand';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface SyncDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      body: any;
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SyncDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<SyncDB>('lifelink-offline-db', 1, {
    upgrade(db) {
      db.createObjectStore('syncQueue', { keyPath: 'id' });
    },
  });
}

interface OfflineSyncState {
  isOffline: boolean;
  queueSize: number;
  setOfflineStatus: (status: boolean) => void;
  enqueueRequest: (url: string, method: string, body: any) => Promise<void>;
  processQueue: () => Promise<void>;
}

export const useOfflineSyncStore = create<OfflineSyncState>((set, get) => ({
  isOffline: !navigator.onLine,
  queueSize: 0,
  
  setOfflineStatus: (status) => {
    set({ isOffline: status });
    if (!status) {
      // Transitioned back online, process the queue
      get().processQueue();
    }
  },

  enqueueRequest: async (url, method, body) => {
    if (!dbPromise) return;
    const db = await dbPromise;
    const request = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      url,
      method,
      body,
      timestamp: Date.now(),
    };
    await db.put('syncQueue', request);
    
    // Update size
    const count = await db.count('syncQueue');
    set({ queueSize: count });
    
    console.log(`[Offline Sync] Request queued for ${url}`);
  },

  processQueue: async () => {
    if (!dbPromise) return;
    const db = await dbPromise;
    const allRequests = await db.getAll('syncQueue');
    
    if (allRequests.length === 0) return;
    
    console.log(`[Offline Sync] Processing ${allRequests.length} queued requests...`);
    
    for (const req of allRequests) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        });
        
        if (response.ok) {
          await db.delete('syncQueue', req.id);
        } else {
          console.error(`[Offline Sync] Request failed with status ${response.status}`);
        }
      } catch (err) {
        console.error(`[Offline Sync] Network error while syncing:`, err);
        // Stop processing if we hit a network error (likely went offline again)
        break;
      }
    }
    
    // Update size
    const count = await db.count('syncQueue');
    set({ queueSize: count });
  }
}));

// Setup event listeners for online/offline
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineSyncStore.getState().setOfflineStatus(false);
  });
  window.addEventListener('offline', () => {
    useOfflineSyncStore.getState().setOfflineStatus(true);
  });
  
  // Init queue size
  dbPromise?.then(async (db) => {
    const count = await db.count('syncQueue');
    useOfflineSyncStore.setState({ queueSize: count });
  });
}
