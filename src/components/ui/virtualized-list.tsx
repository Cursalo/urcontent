import React, { memo, useMemo, useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * High-performance virtualized list component
 * Only renders visible items for optimal performance with large datasets
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const { visibleStart, visibleEnd, totalHeight } = useMemo(() => {
    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEnd = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    const totalHeight = items.length * itemHeight;

    return { visibleStart, visibleEnd, totalHeight };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleStart, visibleEnd).map((item, index) => ({
      item,
      index: visibleStart + index
    }));
  }, [items, visibleStart, visibleEnd]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList;