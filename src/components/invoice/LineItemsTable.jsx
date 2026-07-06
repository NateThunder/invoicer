import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from '@/lib/currency';

const createBlankItem = () => ({ description: '', quantity: '', rate: '', total: 0 });

export default function LineItemsTable({ items, currency, onChange }) {
  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        newItem.total = (parseFloat(newItem.quantity || 0) || 0) * (parseFloat(newItem.rate || 0) || 0);
      }
      return newItem;
    });
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, createBlankItem()]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const descriptionId = `line-item-${i}-description`;
        const quantityId = `line-item-${i}-quantity`;
        const rateId = `line-item-${i}-rate`;

        return (
          <div key={i} className="rounded-md border border-border bg-background p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Item {i + 1}</p>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                aria-label={`Remove item ${i + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor={descriptionId} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Description
                </label>
                <Input
                  id={descriptionId}
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  className="h-10 border-input bg-card text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <label htmlFor={quantityId} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Qty
                  </label>
                  <Input
                    id={quantityId}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1"
                    value={item.quantity ?? ''}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    className="h-10 border-input bg-card text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label htmlFor={rateId} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Rate
                  </label>
                  <Input
                    id={rateId}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={item.rate ?? ''}
                    onChange={(e) => updateItem(i, 'rate', e.target.value)}
                    className="h-10 border-input bg-card text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(item.total || 0, currency)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addItem}>
        <Plus className="w-3.5 h-3.5" />
        Add Line Item
      </Button>
    </div>
  );
}
