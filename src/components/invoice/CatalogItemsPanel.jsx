import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2,
  Check,
  FilePlus2,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import CurrencySelect from './CurrencySelect';
import {
  CATALOG_ITEM_TYPES,
  getVisibleCatalogItems,
  isDuplicateCatalogItem,
} from '@/lib/catalogItems';

const emptyItem = {
  type: 'product',
  name: '',
  details: '',
  price: '',
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

function CatalogItemForm({ initial, businessId, items, onSave, onCancel, isNew }) {
  const [form, setForm] = useState({
    ...initial,
    price: initial.price === '' ? '' : String(initial.price),
  });

  const update = (field, value) => setForm(current => ({ ...current, [field]: value }));
  const numericPrice = Number(form.price);
  const hasValidPrice = form.price !== '' && Number.isFinite(numericPrice) && numericPrice >= 0;
  const duplicate = isDuplicateCatalogItem(
    items,
    { ...form, businessId },
    isNew ? null : form.id
  );
  const canSave = form.name.trim() && hasValidPrice && !duplicate;
  const fieldId = isNew ? 'new-catalog-item' : `catalog-item-${form.id}`;

  const handleSave = () => {
    if (!canSave) return;

    onSave({
      ...form,
      businessId,
      name: form.name.trim(),
      details: form.details.trim(),
      price: numericPrice,
    });
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-sm font-semibold">{isNew ? 'Add Item' : 'Edit Item'}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-type`} className="text-xs font-medium">Type *</Label>
          <select
            id={`${fieldId}-type`}
            value={form.type}
            onChange={(event) => update('type', event.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${fieldId}-price`} className="text-xs font-medium">Price *</Label>
          <Input
            id={`${fieldId}-price`}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.price}
            onChange={(event) => update('price', event.target.value)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${fieldId}-name`} className="text-xs font-medium">Name *</Label>
          <Input
            id={`${fieldId}-name`}
            placeholder="Chocolate cake or guitar performance"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            aria-invalid={duplicate}
          />
          {duplicate && (
            <p className="text-xs text-destructive" role="alert">
              A {form.type} with this name already exists.
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${fieldId}-details`} className="text-xs font-medium">Details</Label>
          <Textarea
            id={`${fieldId}-details`}
            placeholder="Optional details shown beneath the item name on invoices"
            value={form.details}
            onChange={(event) => update('details', event.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={!canSave}>
          <Check className="h-3.5 w-3.5" />
          {isNew ? 'Add Item' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function TypeFilters({ value, onChange }) {
  return (
    <div className="flex rounded-md border border-border bg-muted/40 p-1" aria-label="Filter items by type">
      {[
        ['all', 'All'],
        ['product', 'Products'],
        ['service', 'Services'],
      ].map(([filterValue, label]) => (
        <button
          key={filterValue}
          type="button"
          aria-pressed={value === filterValue}
          className={`flex-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
            value === filterValue
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onChange(filterValue)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function CatalogItemsPanel({
  items,
  businessId,
  currency,
  onCurrencyChange,
  onSaveItems,
  onAddToInvoice,
  onOpenBusinesses,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [flash, setFlash] = useState('');

  useEffect(() => {
    setShowForm(false);
    setEditingId(null);
    setSearch('');
    setTypeFilter('all');
    setFlash('');
  }, [businessId]);

  useEffect(() => {
    if (!flash) return undefined;

    const timeout = window.setTimeout(() => setFlash(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [flash]);

  const businessItems = useMemo(
    () => items.filter(item => item.businessId === businessId),
    [items, businessId]
  );
  const visibleItems = useMemo(
    () => getVisibleCatalogItems(items, { businessId, search, type: typeFilter }),
    [items, businessId, search, typeFilter]
  );

  const handleAdd = (form) => {
    onSaveItems([...items, { ...form, id: createId() }]);
    setShowForm(false);
    setFlash('Item saved');
  };

  const handleEdit = (form) => {
    onSaveItems(items.map(item => item.id === form.id ? form : item));
    setEditingId(null);
    setFlash('Item updated');
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    onSaveItems(items.filter(candidate => candidate.id !== item.id));
    setFlash('Item deleted');
  };

  const handleUse = (item) => {
    onAddToInvoice(item);
    setFlash(`${item.name} added to invoice`);
  };

  const startAdding = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const startEditing = (id) => {
    setShowForm(false);
    setEditingId(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
          <PackageOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Items</h2>
          <p className="text-sm text-muted-foreground">Manage reusable products and services</p>
        </div>
      </div>

      {!businessId ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
          <Building2 className="mx-auto mb-2 h-10 w-10 opacity-30" />
          <p className="mb-3 text-sm">Add or select a business before saving items.</p>
          <Button size="sm" variant="outline" onClick={onOpenBusinesses}>Open Businesses</Button>
        </div>
      ) : (
        <>
          <CurrencySelect
            id="items-currency"
            value={currency}
            onChange={onCurrencyChange}
          />

          {flash && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600" role="status">
              <Check className="h-4 w-4" />
              {flash}
            </div>
          )}

          {businessItems.length > 0 && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search saved items..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-9 pl-8 text-sm"
                  aria-label="Search saved items"
                />
              </div>
              <TypeFilters value={typeFilter} onChange={setTypeFilter} />
            </div>
          )}

          {businessItems.length === 0 && !showForm && (
            <div className="py-6 text-center text-muted-foreground">
              <PackageOpen className="mx-auto mb-2 h-10 w-10 opacity-30" />
              <p className="text-sm">No saved products or services yet.</p>
            </div>
          )}

          {businessItems.length > 0 && visibleItems.length === 0 && (
            <div className="py-5 text-center text-sm text-muted-foreground">No items match your search.</div>
          )}

          <div className="space-y-2">
            {visibleItems.map(item => (
              <div key={item.id}>
                {editingId === item.id ? (
                  <CatalogItemForm
                    initial={item}
                    businessId={businessId}
                    items={items}
                    onSave={handleEdit}
                    onCancel={() => setEditingId(null)}
                    isNew={false}
                  />
                ) : (
                  <div className="rounded-lg border border-border bg-card p-3 transition-shadow hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {CATALOG_ITEM_TYPES[item.type]}
                          </span>
                        </div>
                        {item.details && (
                          <p className="line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{item.details}</p>
                        )}
                        <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">
                          {formatCurrency(item.price, currency)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-accent hover:text-accent"
                          onClick={() => handleUse(item)}
                          aria-label={`Add ${item.name} to invoice`}
                          title="Add to invoice"
                        >
                          <FilePlus2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => startEditing(item.id)}
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showForm ? (
            <CatalogItemForm
              initial={{ ...emptyItem }}
              businessId={businessId}
              items={items}
              onSave={handleAdd}
              onCancel={() => setShowForm(false)}
              isNew={true}
            />
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={startAdding}>
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </>
      )}
    </div>
  );
}
