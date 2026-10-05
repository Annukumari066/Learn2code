import React, { useRef, useState, useEffect } from 'react';

interface SplitterProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

export default function Splitter({ direction, onResize }: SplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = direction === 'horizontal' ? e.clientY : e.clientX;
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? moveEvent.clientY : moveEvent.clientX;
      const delta = currentPos - startPos.current;
      startPos.current = currentPos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <>
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            cursor: direction === 'horizontal' ? 'row-resize' : 'col-resize',
            backgroundColor: 'transparent',
          }}
        />
      )}
      {direction === 'horizontal' ? (
        <div
          onMouseDown={handleMouseDown}
          style={{
            height: '8px',
            backgroundColor: '#11111b',
            cursor: 'row-resize',
            width: '100%',
            margin: '2px 0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ width: '40px', height: '3px', backgroundColor: '#475569', borderRadius: '1.5px' }} />
        </div>
      ) : (
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: '8px',
            backgroundColor: '#11111b',
            cursor: 'col-resize',
            height: '100%',
            margin: '0 2px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ height: '40px', width: '3px', backgroundColor: '#475569', borderRadius: '1.5px' }} />
        </div>
      )}
    </>
  );
}
