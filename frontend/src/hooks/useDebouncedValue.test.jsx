import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

afterEach(() => vi.useRealTimers());

describe('useDebouncedValue', () => {
  it('publishes only after typing has paused', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'gui' },
    });

    rerender({ value: 'guitar' });
    expect(result.current).toBe('gui');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('guitar');
  });
});
