import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface SplitterProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

export default function Splitter({ direction, onResize }: SplitterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const lastPosition = useRef<number | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastPosition.current === null) {
        lastPosition.current = direction === 'vertical' ? e.clientX : e.clientY;
        return;
      }

      const current = direction === 'vertical' ? e.clientX : e.clientY;
      const delta = current - lastPosition.current;
      onResize(delta);
      lastPosition.current = current;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      lastPosition.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection during drag
    const preventSelection = (e: Event) => e.preventDefault();
    document.addEventListener('selectstart', preventSelection);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectstart', preventSelection);
    };
  }, [isDragging, direction, onResize]);

  if (Platform.OS !== 'web') {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastPosition.current = direction === 'vertical' ? e.clientX : e.clientY;
  };

  const isVertical = direction === 'vertical';

  return (
    <View
      style={[
        isVertical ? styles.verticalContainer : styles.horizontalContainer,
      ]}
      {...({
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        onMouseDown: handleMouseDown,
      } as any)}
    >
      <View
        style={[
          isVertical ? styles.verticalLine : styles.horizontalLine,
          (isHovered || isDragging) && styles.activeLine,
          (isHovered || isDragging) && (isVertical ? { width: 2 } : { height: 2 }),
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  verticalContainer: {
    width: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      web: {
        cursor: 'col-resize',
        userSelect: 'none',
      } as any,
    }),
  },
  horizontalContainer: {
    height: 8,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      web: {
        cursor: 'row-resize',
        userSelect: 'none',
      } as any,
    }),
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#313244',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
    backgroundColor: '#1e293b',
  },
  activeLine: {
    backgroundColor: '#3b82f6',
  },
});
