import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SyncPayload {
  items?: any[];
  claims?: any[];
  activitySubmissions?: any[];
  sourceClientId?: string;
  timestamp?: string;
}

// In-memory fallback cache for local dev / non-D1 runtime
let edgeMemoryStore = {
  items: [] as any[],
  claims: [] as any[],
  activitySubmissions: [] as any[],
  lastSyncedAt: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity') || 'all';

    // Access Cloudflare D1 if running in Cloudflare Workers environment
    // @ts-ignore
    const d1 = (globalThis as any).env?.DB || (process.env as any).DB;

    if (d1 && typeof d1.prepare === 'function') {
      try {
        if (entity === 'items' || entity === 'all') {
          const itemsResult = await d1.prepare('SELECT * FROM items ORDER BY updated_at DESC LIMIT 200').all();
          return NextResponse.json({
            status: 'ok',
            provider: 'cloudflare_d1_native',
            connected: true,
            totalItems: itemsResult.results?.length || 0,
            items: itemsResult.results || [],
            syncedAt: new Date().toISOString(),
          });
        }
      } catch (d1Err) {
        console.warn('Cloudflare D1 query error, falling back to edge store:', d1Err);
      }
    }

    return NextResponse.json({
      status: 'ok',
      provider: d1 ? 'cloudflare_d1' : 'cloudflare_edge_hybrid',
      connected: true,
      totalItems: edgeMemoryStore.items.length,
      syncedAt: edgeMemoryStore.lastSyncedAt,
      items: edgeMemoryStore.items,
      claims: edgeMemoryStore.claims,
      activities: edgeMemoryStore.activitySubmissions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown sync error',
        syncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: SyncPayload = await request.json();
    const now = new Date().toISOString();

    // @ts-ignore
    const d1 = (globalThis as any).env?.DB || (process.env as any).DB;

    let d1Executed = false;

    if (d1 && typeof d1.prepare === 'function') {
      try {
        // Upsert items into Cloudflare D1
        if (Array.isArray(payload.items) && payload.items.length > 0) {
          const statements = payload.items.map((item) => {
            return d1.prepare(`
              INSERT INTO items (
                id, title, type, category, location_id, color, brand, description, 
                image_url, visual_features, status, custody, secret_question, 
                secret_answer_hash, reported_by_id, reported_by_name, reported_by_role, 
                created_at, updated_at, version
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                status = excluded.status,
                custody = excluded.custody,
                description = excluded.description,
                updated_at = excluded.updated_at,
                version = version + 1
            `).bind(
              item.id,
              item.title || '',
              item.type || 'lost',
              item.category || 'other',
              item.locationId || 'unknown',
              item.color || null,
              item.brand || null,
              item.description || '',
              item.imageUrl || null,
              item.visualFeatures ? JSON.stringify(item.visualFeatures) : null,
              item.status || 'open',
              item.custody || 'student',
              item.secretQuestion || null,
              item.secretAnswer ? 'HASHED' : null,
              item.reportedBy?.id || 'unknown',
              item.reportedBy?.name || 'Unknown',
              item.reportedBy?.role || 'student',
              item.createdAt || now,
              now,
              1
            );
          });

          await d1.batch(statements);
          d1Executed = true;
        }

        // Upsert claims into Cloudflare D1
        if (Array.isArray(payload.claims) && payload.claims.length > 0) {
          const claimStatements = payload.claims.map((claim) => {
            return d1.prepare(`
              INSERT INTO claims (
                id, item_id, claimer_id, claimer_name, claimer_role, answer_text,
                status, handover_pin, failed_pin_attempts, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                failed_pin_attempts = excluded.failed_pin_attempts,
                updated_at = excluded.updated_at
            `).bind(
              claim.id,
              claim.itemId,
              claim.claimer?.id || 'unknown',
              claim.claimer?.name || 'Unknown',
              claim.claimer?.role || 'student',
              claim.answerText || '',
              claim.status || 'pending',
              claim.handoverPin || null,
              claim.failedPinAttempts || 0,
              claim.createdAt || now,
              now
            );
          });

          await d1.batch(claimStatements);
          d1Executed = true;
        }
      } catch (d1Err) {
        console.warn('Cloudflare D1 batch write error, updating edge store:', d1Err);
      }
    }

    // Smart dictionary merge for edge memory store (multi-device union)
    if (Array.isArray(payload.items)) {
      const existingItemMap = new Map(edgeMemoryStore.items.map((i) => [i.id, i]));
      payload.items.forEach((item) => {
        existingItemMap.set(item.id, { ...existingItemMap.get(item.id), ...item });
      });
      edgeMemoryStore.items = Array.from(existingItemMap.values());
    }
    if (Array.isArray(payload.claims)) {
      const existingClaimMap = new Map(edgeMemoryStore.claims.map((c) => [c.id, c]));
      payload.claims.forEach((claim) => {
        existingClaimMap.set(claim.id, { ...existingClaimMap.get(claim.id), ...claim });
      });
      edgeMemoryStore.claims = Array.from(existingClaimMap.values());
    }
    if (Array.isArray(payload.activitySubmissions)) {
      const existingActMap = new Map(edgeMemoryStore.activitySubmissions.map((a) => [a.id, a]));
      payload.activitySubmissions.forEach((act) => {
        existingActMap.set(act.id, { ...existingActMap.get(act.id), ...act });
      });
      edgeMemoryStore.activitySubmissions = Array.from(existingActMap.values());
    }
    edgeMemoryStore.lastSyncedAt = now;

    return NextResponse.json({
      success: true,
      provider: d1Executed ? 'cloudflare_d1_native' : 'cloudflare_edge_hybrid',
      syncedAt: now,
      itemsCount: payload.items?.length ?? 0,
      claimsCount: payload.claims?.length ?? 0,
      activitiesCount: payload.activitySubmissions?.length ?? 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Sync write failed',
        syncedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
