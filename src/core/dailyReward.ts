import { tryStorage } from './storage';

export const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const MIN_DAILY_COINS = 50;
export const MAX_DAILY_COINS = 200;

export const DAILY_REWARD_LAST_CLAIM_KEY = 'tsepang_daily_reward_last_claim';
export const DAILY_REWARD_PENDING_KEY = 'tsepang_daily_reward_pending';

export interface DailyRewardStorage {
  getItem(key: string): string | null;
  setItem(key: string, val: string): void;
}

export interface PendingDailyRewardState {
  available: boolean;
  amount: number | null;
  remainingMs: number;
}

export interface ClaimDailyRewardResult {
  claimed: boolean;
  amount: number;
  claimedAt: number | null;
}

export function rollDailyRewardAmount(rng: () => number = Math.random): number {
  const raw = rng();
  const safeRng = Number.isFinite(raw) ? Math.max(0, Math.min(0.9999999, raw)) : 0;
  const span = MAX_DAILY_COINS - MIN_DAILY_COINS + 1;
  return Math.min(MAX_DAILY_COINS, Math.max(MIN_DAILY_COINS, MIN_DAILY_COINS + Math.floor(safeRng * span)));
}

export function readLastClaimAt(storage: DailyRewardStorage = tryStorage): number | null {
  const raw = storage.getItem(DAILY_REWARD_LAST_CLAIM_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function isDailyRewardAvailable(lastClaimAt: number | null, nowMs: number = Date.now()): boolean {
  if (lastClaimAt === null) return true;
  if (!Number.isFinite(nowMs) || nowMs < lastClaimAt) return false;
  return nowMs - lastClaimAt >= DAILY_COOLDOWN_MS;
}

export function getRemainingCooldownMs(lastClaimAt: number | null, nowMs: number = Date.now()): number {
  if (lastClaimAt === null) return 0;
  if (!Number.isFinite(nowMs) || nowMs < lastClaimAt) return DAILY_COOLDOWN_MS;
  return Math.max(0, DAILY_COOLDOWN_MS - (nowMs - lastClaimAt));
}

export function getOrCreatePendingDailyReward(
  nowMs: number = Date.now(),
  storage: DailyRewardStorage = tryStorage,
  rng: () => number = Math.random
): PendingDailyRewardState {
  const lastClaimAt = readLastClaimAt(storage);
  if (!isDailyRewardAvailable(lastClaimAt, nowMs)) {
    return {
      available: false,
      amount: null,
      remainingMs: getRemainingCooldownMs(lastClaimAt, nowMs)
    };
  }

  const savedPendingRaw = storage.getItem(DAILY_REWARD_PENDING_KEY);
  if (savedPendingRaw) {
    const savedAmount = parseInt(savedPendingRaw, 10);
    if (Number.isInteger(savedAmount) && savedAmount >= MIN_DAILY_COINS && savedAmount <= MAX_DAILY_COINS) {
      return { available: true, amount: savedAmount, remainingMs: 0 };
    }
  }

  const amount = rollDailyRewardAmount(rng);
  storage.setItem(DAILY_REWARD_PENDING_KEY, String(amount));
  return { available: true, amount, remainingMs: 0 };
}

export function claimDailyReward(
  nowMs: number = Date.now(),
  storage: DailyRewardStorage = tryStorage,
  rng: () => number = Math.random
): ClaimDailyRewardResult {
  const pending = getOrCreatePendingDailyReward(nowMs, storage, rng);
  if (!pending.available || pending.amount === null) {
    return {
      claimed: false,
      amount: 0,
      claimedAt: readLastClaimAt(storage)
    };
  }

  storage.setItem(DAILY_REWARD_LAST_CLAIM_KEY, String(nowMs));
  storage.setItem(DAILY_REWARD_PENDING_KEY, '');

  return {
    claimed: true,
    amount: pending.amount,
    claimedAt: nowMs
  };
}
