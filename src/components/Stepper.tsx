import { useId } from 'react';

type Props = {
  label: string;
  /** Undefined when nothing has been recorded yet: shows "—" and the first + gives 1. */
  value: number | undefined;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  /** "large": label above big buttons, for the main counter of a card. */
  size?: 'normal' | 'large';
};

/** Large one-thumb +/− counter that never goes below zero. */
export function Stepper({ label, value, onChange, decreaseLabel, increaseLabel, size = 'normal' }: Props) {
  const id = useId();
  const current = value ?? 0;
  return (
    <div className={size === 'large' ? 'stepper stepper-large' : 'stepper'}>
      <span className="stepper-label" id={id}>
        {label}
      </span>
      <div className="stepper-controls">
        <button
          type="button"
          className="stepper-button"
          aria-label={decreaseLabel}
          disabled={current <= 0}
          onClick={() => onChange(Math.max(0, current - 1))}
        >
          −
        </button>
        <output className="stepper-value" aria-labelledby={id} aria-live="polite">
          {value ?? '—'}
        </output>
        <button
          type="button"
          className="stepper-button"
          aria-label={increaseLabel}
          onClick={() => onChange(current + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
