/**
 * FindIt / ETHOS - Cloudflare D1 Native Edge Data Service
 * 
 * Replaces Firebase Firestore completely. All student profiles, lost & found items,
 * claims, weekly challenges, and behavioral research responses are stored in and
 * synchronized with Cloudflare D1 SQL Edge Database.
 */

import { UserProfile, Item, Claim, WeeklyChallenge, ActivityBadge } from '@/types';
import { logger } from '@/lib/logging/logger';
import { DEFAULT_WEEKLY_CHALLENGES } from '@/lib/challengesData';
import { ACTIVITY_BADGES } from '@/lib/constants';

export const d1DataService = {
  /**
   * Save or update a student user profile in Cloudflare D1
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      if (!profile || !profile.id) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [profile] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save user profile', { error: String(error) });
      return false;
    }
  },

  /**
   * Fetch all registered users from Cloudflare D1
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/sync?entity=users');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.users) ? data.users : [];
    } catch (error) {
      logger.error('D1: Failed to fetch all users', { error: String(error) });
      return [];
    }
  },

  /**
   * Save a new lost/found item to Cloudflare D1
   */
  async saveItem(item: Item): Promise<boolean> {
    try {
      if (!item || !item.id) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [item] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save item', { error: String(error) });
      return false;
    }
  },

  /**
   * Update existing item fields in Cloudflare D1
   */
  async updateItem(itemId: string, updates: Partial<Item>): Promise<boolean> {
    try {
      if (!itemId) return false;
      // In D1, we send the merged object to /api/sync
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: itemId, ...updates }] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to update item', { error: String(error) });
      return false;
    }
  },

  /**
   * Delete an item from Cloudflare D1
   */
  async deleteItem(itemId: string): Promise<boolean> {
    try {
      if (!itemId) return false;
      const res = await fetch(`/api/sync?entity=item&id=${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to delete item', { error: String(error) });
      return false;
    }
  },

  /**
   * Save a claim to Cloudflare D1
   */
  async saveClaim(claim: Claim): Promise<boolean> {
    try {
      if (!claim || !claim.id) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claims: [claim] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save claim', { error: String(error) });
      return false;
    }
  },

  /**
   * Update claim fields in Cloudflare D1
   */
  async updateClaim(claimId: string, updates: Partial<Claim>): Promise<boolean> {
    try {
      if (!claimId) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claims: [{ id: claimId, ...updates }] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to update claim', { error: String(error) });
      return false;
    }
  },

  /**
   * Server-side atomic PIN Handover verification in Cloudflare D1
   */
  async verifyHandoverPin(claimId: string, pin: string): Promise<{
    success: boolean;
    message: string;
    remainingAttempts?: number;
    exceeded?: boolean;
  }> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinVerification: { claimId, pin },
        }),
      });
      const data = await res.json();
      return data;
    } catch (error) {
      return {
        success: false,
        message: 'فشل الاتصال بقاعدة بيانات Cloudflare D1 للتحقق من الرمز',
      };
    }
  },

  /**
   * Fetch all weekly challenges from Cloudflare D1
   */
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    try {
      const res = await fetch('/api/sync?entity=challenges');
      if (!res.ok) return DEFAULT_WEEKLY_CHALLENGES;
      const data = await res.json();
      return Array.isArray(data.weeklyChallenges) && data.weeklyChallenges.length > 0
        ? data.weeklyChallenges
        : DEFAULT_WEEKLY_CHALLENGES;
    } catch (error) {
      logger.warn('D1: Failed to fetch weekly challenges, using fallback', { error: String(error) });
      return DEFAULT_WEEKLY_CHALLENGES;
    }
  },

  /**
   * Get the active weekly challenge from Cloudflare D1
   */
  async getActiveWeeklyChallenge(): Promise<WeeklyChallenge | null> {
    try {
      const challenges = await this.getWeeklyChallenges();
      if (!challenges || challenges.length === 0) return null;
      return challenges.find((c) => c.is_active) || challenges[0] || null;
    } catch {
      return DEFAULT_WEEKLY_CHALLENGES[0];
    }
  },

  /**
   * Save student's scenario responses and behavioral research data to Cloudflare D1
   */
  async saveIntegrityResearchData(record: {
    studentId: string;
    studentName: string;
    studentGrade?: string;
    weekId: string;
    completedAt: string;
    totalPointsEarned: number;
    accuracyPercentage: number;
    idealAnswersCount: number;
    totalScenarios: number;
    answers: Record<string, { optionId: string; isIdeal: boolean; score: number; answeredAt?: string }>;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrityResponses: [record],
        }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save integrity research data', { error: String(error) });
      return false;
    }
  },

  /**
   * Record challenge completion and update user points in Cloudflare D1
   */
  async recordChallengeCompletion(
    user: UserProfile,
    weekId: string,
    pointsEarned: number
  ): Promise<boolean> {
    try {
      const currentPoints = user.total_points ?? user.goodwillPoints ?? 0;
      const newTotalPoints = currentPoints + pointsEarned;
      const existingChallenges = user.completed_challenges || [];
      const completedChallenges = Array.from(new Set([...existingChallenges, weekId]));

      const updatedUser: UserProfile = {
        ...user,
        goodwillPoints: newTotalPoints,
        total_points: newTotalPoints,
        completed_challenges: completedChallenges,
        isTrusted: true,
      };

      return await this.saveUserProfile(updatedUser);
    } catch (error) {
      logger.error('D1: Failed to record challenge completion', { error: String(error) });
      return false;
    }
  },

  /**
   * Fetch all badges catalog from Cloudflare D1
   */
  async getBadges(): Promise<ActivityBadge[]> {
    try {
      const res = await fetch('/api/sync?entity=badges');
      if (!res.ok) return ACTIVITY_BADGES;
      const data = await res.json();
      return Array.isArray(data.badges) && data.badges.length > 0 ? data.badges : ACTIVITY_BADGES;
    } catch (error) {
      logger.warn('D1: Failed to fetch badges, using fallback', { error: String(error) });
      return ACTIVITY_BADGES;
    }
  },

  /**
   * Save or update badge in Cloudflare D1
   */
  async saveBadge(badge: Partial<ActivityBadge>): Promise<boolean> {
    try {
      if (!badge || !badge.id) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badges: [badge] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save badge', { error: String(error) });
      return false;
    }
  },

  /**
   * Fetch campus time-of-day greetings from Cloudflare D1
   */
  async getCampusGreetings(): Promise<any[]> {
    try {
      const res = await fetch('/api/sync?entity=greetings');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.campusGreetings) ? data.campusGreetings : [];
    } catch (error) {
      logger.warn('D1: Failed to fetch campus greetings', { error: String(error) });
      return [];
    }
  },

  /**
   * Save or update a campus greeting in Cloudflare D1
   */
  async saveCampusGreeting(greeting: any): Promise<boolean> {
    try {
      if (!greeting || !greeting.id) return false;
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campusGreetings: [greeting] }),
      });
      return res.ok;
    } catch (error) {
      logger.error('D1: Failed to save campus greeting', { error: String(error) });
      return false;
    }
  },
};
