import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from '@/lib/currency';

export default function LineItemsTable({ items, currency, onChange }) {
  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        newItem.total = (parseFloat(newItem.quantity) || 0) * (parseFloat(newItem.rate) || 0);
      }
      return newItem;
    });
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, rate: 0, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/60">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2.5 w-[45%]">Description</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2.5 w-[15%]">Qty</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2.5 w-[18%]">Rate</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2.5 w-[18%]">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-2 py-1.5">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    className="h-9 border-0 shadow-none focus-visible:ring-1 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    className="h-9 border-0 shadow-none focus-visible:ring-1 text-sm text-right"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => updateItem(i, 'rate', e.target.value)}
                    className="h-9 border-0 shadow-none focus-visible:ring-1 text-sm text-right"
                  />
                </td>
                <td className="px-3 py-1.5 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(item.total, currency)}
                </td>
                <td className="px-1 py-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addItem}>
        <Plus className="w-3.5 h-3.5" />
        Add Line Item
      </Button>
    </div>
  );
}
