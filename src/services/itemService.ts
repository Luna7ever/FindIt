import { Item, UserProfile } from '@/types';
import { ItemCreateSchema, ItemCreateInput, ItemQueryInput } from '@/lib/validation/schemas';
import { canEditItem, canDeleteItem, sanitizeItemForViewer } from '@/lib/auth/permissions';
import { validateItemTransition } from '@/lib/state/machine';
import { ValidationError, AuthorizationError, NotFoundError } from '@/lib/errors/AppError';
import { logger } from '@/lib/logging/logger';

export class ItemService {
  /**
   * Validates and creates a new item with ownership metadata
   */
  static createItem(input: unknown, user: UserProfile): Item {
    const parseResult = ItemCreateSchema.safeParse(input);
    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const err of parseResult.error.issues) {
        const path = err.path.join('.') || 'general';
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(err.message);
      }
      logger.warn('Item creation failed validation', { errors: fieldErrors });
      throw new ValidationError('بيانات الغرض غير مكتملة أو غير صالحة', fieldErrors);
    }

    const data: ItemCreateInput = parseResult.data;
    const now = new Date().toISOString();

    const newItem: Item = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      type: data.type,
      category: data.category,
      locationId: data.locationId,
      locationDetails: data.locationDetails,
      date: data.date,
      color: data.color,
      brand: data.brand,
      description: data.description,
      imageUrl: data.imageUrl,
      secretQuestion: data.type === 'found' ? data.secretQuestion : undefined,
      secretAnswer: data.type === 'found' ? data.secretAnswer : undefined,
      custody: data.type === 'found' ? data.custody || 'with_finder' : undefined,
      status: 'open',
      reportedBy: user,
      createdAt: now,
    };

    logger.info('Item created successfully', { itemId: newItem.id, type: newItem.type, category: newItem.category });
    return newItem;
  }

  /**
   * Bounded query and filtering for discovery feed
   */
  static filterAndPaginateItems(
    items: Item[],
    query: ItemQueryInput,
    viewer?: UserProfile
  ): { items: Item[]; total: number; page: number; totalPages: number } {
    const { page = 1, limit = 20, type, category, locationId, status, q } = query;

    let filtered = items;

    if (type) {
      filtered = filtered.filter((i) => i.type === type);
    }

    if (category) {
      filtered = filtered.filter((i) => i.category === category);
    }

    if (locationId) {
      filtered = filtered.filter((i) => i.locationId === locationId);
    }

    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (q && q.trim()) {
      const searchTerms = q.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter((i) => {
        const titleMatch = searchTerms.some((t) => i.title.toLowerCase().includes(t));
        const descMatch = searchTerms.some((t) => i.description.toLowerCase().includes(t));
        const colorMatch = i.color ? searchTerms.some((t) => i.color.toLowerCase().includes(t)) : false;
        const brandMatch = i.brand ? searchTerms.some((t) => i.brand?.toLowerCase().includes(t)) : false;
        return titleMatch || descMatch || colorMatch || brandMatch;
      });
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered
      .slice(startIndex, startIndex + limit)
      .map((item) => sanitizeItemForViewer(item, viewer));

    return {
      items: paginatedItems,
      total,
      page,
      totalPages,
    };
  }
}
