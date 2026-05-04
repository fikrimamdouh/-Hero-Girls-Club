import { useRef, useState, useCallback, useEffect } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  size?: number;
  disabled?: boolean;
};

export default function PatternLock({ value, onChange, size = 240, disabled }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<number[]>([]);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (value === '') setPoints([]);
  }, [value]);

  const dotPos = (i: number) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const step = size / 3;
    return { x: step * col + step / 2, y: step * row + step / 2 };
  };

  const hitTest = (x: number, y: number) => {
    for (let i = 0; i < 9; i++) {
      const p = dotPos(i);
      const dx = x - p.x;
      const dy = y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < size / 8) return i;
    }
    return -1;
  };

  const localPos = (clientX: number, clientY: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const start = (clientX: number, clientY: number) => {
    if (disabled) return;
    const { x, y } = localPos(clientX, clientY);
    const idx = hitTest(x, y);
    setDrawing(true);
    if (idx >= 0) {
      setPoints([idx]);
      onChange(String(idx + 1));
    } else {
      setPoints([]);
      onChange('');
    }
    setCursor({ x, y });
  };

  const move = useCallback((clientX: number, clientY: number) => {
    if (!drawing) return;
    const { x, y } = localPos(clientX, clientY);
    setCursor({ x, y });
    const idx = hitTest(x, y);
    if (idx < 0) return;
    if (points.includes(idx) || points.length >= 4) return;
    const next = [...points, idx];
    setPoints(next);
    onChange(next.map((p) => p + 1).join(''));
  }, [drawing, points, onChange]);

  const end = () => {
    setDrawing(false);
    setCursor(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={containerRef}
        className="relative touch-none select-none"
        style={{ width: size, height: size }}
        onMouseDown={(e) => start(e.clientX, e.clientY)}
        onMouseMove={(e) => move(e.clientX, e.clientY)}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => { const t = e.touches[0]; start(t.clientX, t.clientY); }}
        onTouchMove={(e) => { const t = e.touches[0]; move(t.clientX, t.clientY); }}
        onTouchEnd={end}
      >
        <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
          {points.map((p, i) => {
            if (i === 0) return null;
            const a = dotPos(points[i - 1]);
            const b = dotPos(p);
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#f43f5e"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}
          {drawing && cursor && points.length > 0 && (
            <line
              x1={dotPos(points[points.length - 1]).x}
              y1={dotPos(points[points.length - 1]).y}
              x2={cursor.x}
              y2={cursor.y}
              stroke="#fb7185"
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.5}
              strokeDasharray="6 6"
            />
          )}
        </svg>
        {[...Array(9)].map((_, i) => {
          const p = dotPos(i);
          const active = points.includes(i);
          return (
            <div
              key={i}
              className="absolute pointer-events-none transition-all duration-150"
              style={{
                left: p.x - (active ? 18 : 12),
                top: p.y - (active ? 18 : 12),
                width: active ? 36 : 24,
                height: active ? 36 : 24,
              }}
            >
              <div
                className={`h-full w-full rounded-full transition-all ${
                  active
                    ? 'bg-gradient-to-br from-rose-400 to-pink-600 shadow-[0_0_18px_rgba(244,63,94,0.6)] ring-4 ring-rose-200/40'
                    : 'bg-white ring-2 ring-rose-200'
                }`}
              />
            </div>
          );
        })}
      </div>
      <p className="font-arabic text-[11px] text-white/60">ارسمي نقشكِ بربط 4 نقاط</p>
    </div>
  );
}
