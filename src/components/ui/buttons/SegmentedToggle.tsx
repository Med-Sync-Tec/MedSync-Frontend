import React, { useRef, useState, useLayoutEffect } from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

type SegmentedToggleProps<T extends string = string> = Readonly<{
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}>;

/**
 * Animated segmented control (pill toggle).
 * A sliding background tracks the active option with a smooth spring-like transition.
 */
export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
}: SegmentedToggleProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<T, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = itemRefs.current.get(value);
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-0.5 p-1 rounded-xl bg-surface-subtle border border-border-subtle"
      role="radiogroup"
    >
      {/* Sliding pill indicator */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-lg bg-primary shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ left: indicator.left, width: indicator.width }}
      />

      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              if (el) itemRefs.current.set(opt.value, el);
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold tracking-tight transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
              isActive
                ? 'text-white'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
