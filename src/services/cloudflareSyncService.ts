/**
 * Cloudflare D1 & Edge Synchronization Service
 * 
 * Provides resilient, non-blocking background synchronization between
 * client-side LocalStorage and Cloudflare Edge D1 database.
 * 
 * Invariant: Local-First. Operations always succeed instantly locally,
 * and sync opportunistically in the background without user disruption.
 */

import { Item, Claim, ActivitySubmission } from '@/types';
import { logger } from '@/lib/logging/logger';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: string | null;
  provider: string;
  itemCount: number;
  errorMessage?: string;
}

class CloudflareSyncService {
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private currentStatus: SyncState = 'idle';
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.updateState('idle');
        this.triggerDebouncedSync();
      });
      window.addEventListener('offline', () => {
        this.updateState('offline');
      });
    }
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getStatus(): SyncStatus {
    return {
      state: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : this.currentStatus,
      lastSyncedAt: this.lastSyncedAt,
      provider: 'Cloudflare D1 Edge',
      itemCount: 0,
    };
  }

  private updateState(state: SyncState, errorMessage?: string) {
    this.currentStatus = state;
    const status: SyncStatus = {
      state,
      lastSyncedAt: this.lastSyncedAt,
      provider: 'Cloudflare D1 Edge',
      itemCount: 0,
      errorMessage,
    };
    this.listeners.forEach((l) => l(status));
  }

  /**
   * Push local items, claims, and activities to Cloudflare D1
   */
  public async syncToCloudflare(data: {
    items: Item[];
    claims: Claim[];
    activitySubmissions?: ActivitySubmission[];
  }): Promise<{ success: boolean; syncedAt?: string }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.updateState('offline');
      return { success: false };
    }

    if (this.isSyncing) {
      return { success: true };
    }

    this.isSyncing = true;
    this.updateState('syncing');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: data.items,
          claims: data.claims,
          activitySubmissions: data.activitySubmissions,
          timestamp: new Date().toISOString(),
          sourceClientId: typeof window !== 'undefined' ? window.navigator.userAgent : 'node',
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed with HTTP ${response.status}`);
      }

      const result = await response.json();
      this.lastSyncedAt = result.syncedAt || new Date().toISOString();
      this.updateState('synced');
      logger.info('Cloudflare D1 sync completed', { count: data.items.length, syncedAt: this.lastSyncedAt });
      return { success: true, syncedAt: this.lastSyncedAt || undefined };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync network error';
      logger.warn('Cloudflare D1 background sync failed (offline-first fallback active)', { error: message });
      this.updateState('idle', message);
      return { success: false };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Schedule a debounced sync to prevent flooding during rapid edits
   */
  public scheduleSync(dataGetter: () => {
    items: Item[];
    claims: Claim[];
    activitySubmissions?: ActivitySubmission[];
  }, delayMs = 1500) {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      const data = dataGetter();
      this.syncToCloudflare(data);
    }, delayMs);
  }

  /**
   * Pull items, claims, and activities from Cloudflare D1 / Edge API
   */
  public async pullFromCloudflare(): Promise<{
    items?: Item[];
    claims?: Claim[];
    activitySubmissions?: ActivitySubmission[];
    syncedAt?: string;
  } | null> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return null;
    }

    try {
      const response = await fetch('/api/sync?entity=all', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.status === 'ok') {
        this.lastSyncedAt = data.syncedAt;
        return {
          items: data.items,
          claims: data.claims,
          activitySubmissions: data.activities,
          syncedAt: data.syncedAt,
        };
      }
      return null;
    } catch (err) {
      logger.warn('Failed to pull from Cloudflare D1', { error: String(err) });
      return null;
    }
  }

  private triggerDebouncedSync() {
    // Triggers when back online
  }
}

export const cloudflareSyncService = new CloudflareSyncService();
