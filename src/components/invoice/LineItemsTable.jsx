import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Plus, Save, Trash2 } from "lucide-react";
import { formatCurrency } from '@/lib/currency';
import {
  catalogItemMatchesInvoiceLine,
  createBlankInvoiceItem,
  isDuplicateCatalogItem,
} from '@/lib/catalogItems';

export default function LineItemsTable({
  items,
  currency,
  businessId,
  catalogItems,
  onChange,
  onSaveItem,
}) {
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
    onChange([...items, createBlankInvoiceItem()]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const descriptionId = `line-item-${i}-description`;
        const detailsId = `line-item-${i}-details`;
        const quantityId = `line-item-${i}-quantity`;
        const rateId = `line-item-${i}-rate`;
        const linkedCatalogItem = catalogItems.find(candidate => (
          candidate.id === item.catalogItemId && candidate.businessId === businessId
        ));
        const isSaved = catalogItemMatchesInvoiceLine(linkedCatalogItem, item);
        const isDuplicate = !isSaved && isDuplicateCatalogItem(
          catalogItems,
          { businessId, name: item.description },
          linkedCatalogItem?.id
        );
        const hasName = Boolean((item.description || '').trim());
        const actionLabel = linkedCatalogItem ? 'Update item' : 'Save item';

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
                  Item name
                </label>
                <Input
                  id={descriptionId}
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  className="h-10 border-input bg-card text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={detailsId} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Details
                </label>
                <Textarea
                  id={detailsId}
                  placeholder="Optional details"
                  value={item.details ?? ''}
                  onChange={(e) => updateItem(i, 'details', e.target.value)}
                  rows={2}
                  className="min-h-16 border-input bg-card text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70"
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

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1" aria-live="polite">
                  {isDuplicate && (
                    <p className="text-xs text-destructive" role="alert">
                      An item with this name is already saved.
                    </p>
                  )}
                  {!businessId && (
                    <p className="text-xs text-muted-foreground">Select a business to save this item.</p>
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className={isSaved
                    ? 'shrink-0 bg-green-600 text-white hover:bg-green-600 disabled:opacity-100'
                    : 'shrink-0 bg-accent text-accent-foreground hover:bg-accent/90'
                  }
                  onClick={() => onSaveItem(i, item)}
                  disabled={isSaved || !businessId || !hasName || isDuplicate}
                >
                  {isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  {isSaved ? 'Saved' : actionLabel}
                </Button>
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
