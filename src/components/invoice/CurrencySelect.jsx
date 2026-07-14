import React from 'react';
import { Label } from '@/components/ui/label';
import { currencyOptions } from '@/lib/currency';

export default function CurrencySelect({ value, onChange, id }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">Currency</Label>
      <select
        id={id}
        value={value || 'GBP'}
        onChange={(event) => onChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {currencyOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value} - {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
