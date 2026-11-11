import { useId } from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
};

/** Large one-thumb +/− counter that never goes below zero. */
export function Stepper({ label, value, onChange, decreaseLabel, increaseLabel }: Props) {
  const id = useId();
  return (
    <div className="stepper">
      <span className="stepper-label" id={id}>
        {label}
      </span>
      <div className="stepper-controls">
        <button
          type="button"
          className="stepper-button"
          aria-label={decreaseLabel}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <output className="stepper-value" aria-labelledby={id} aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="stepper-button"
          aria-label={increaseLabel}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
