import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCancellationSeconds, getOrderStatusIndex } from './order';

afterEach(() => vi.useRealTimers());

describe('order timing', () => {
  it('advances tracking every 20 seconds and closes cancellation after 60 seconds', () => {
    vi.useFakeTimers();
    const placedAt = '2026-09-27T10:00:00.000Z';
    vi.setSystemTime(new Date('2026-09-27T10:00:41.000Z'));

    expect(getOrderStatusIndex(placedAt)).toBe(2);
    expect(getCancellationSeconds(placedAt)).toBe(19);

    vi.setSystemTime(new Date('2026-09-27T10:01:01.000Z'));
    expect(getOrderStatusIndex(placedAt)).toBe(3);
    expect(getCancellationSeconds(placedAt)).toBe(0);
  });
});
