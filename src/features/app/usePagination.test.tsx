import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePagination } from '@/features/app/shared';

function makeItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: index + 1 }));
}

describe('usePagination', () => {
  it('slices items into pages and reports the total', () => {
    const items = makeItems(25);
    const { result } = renderHook(() => usePagination(items, 10));

    expect(result.current.page).toBe(1);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.total).toBe(25);
    expect(result.current.pageItems).toHaveLength(10);
    expect(result.current.pageItems[0].id).toBe(1);

    act(() => result.current.setPage(3));
    expect(result.current.pageItems).toHaveLength(5);
    expect(result.current.pageItems[0].id).toBe(21);
  });

  it('keeps at least one page when there are no items', () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.pageCount).toBe(1);
    expect(result.current.pageItems).toEqual([]);
  });
});
