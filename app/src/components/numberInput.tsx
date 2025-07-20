import React from "react";

interface CustomNumberInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newValue: number) => void;
}

export function CustomNumberInput({
  value,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
}: CustomNumberInputProps) {
  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = parseInt(val);
    if (!isNaN(num)) {
      if (num <= max && num >= min) {
        onChange(num);
      }
    } else if (val === "") {
      // Allow empty input
      onChange(min);
    }
  };

  return (
    <div className="inline-flex items-center border border-gray-300 dark:border-gray-700 rounded overflow-hidden bg-white dark:bg-gray-800">
      <button
        type="button"
        onClick={decrement}
        className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
        aria-label="Decrement"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        className="w-16 text-center bg-transparent outline-none text-gray-900 dark:text-gray-100 px-2 py-1"
      />
      <button
        type="button"
        onClick={increment}
        className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 select-none"
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}
