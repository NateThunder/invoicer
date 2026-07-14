import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, PackageOpen, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getVisibleCatalogItems } from '@/lib/catalogItems';

export default function CatalogItemPicker({ items, currency, onSelect, onOpenItems }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const visibleItems = useMemo(
    () => getVisibleCatalogItems(items, {
      businessId: items[0]?.businessId,
      search,
    }),
    [items, search]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closePicker = () => {
    setOpen(false);
    setSearch('');
  };

  const handleSelect = (item) => {
    onSelect(item);
    closePicker();
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <PackageOpen className="h-3.5 w-3.5 shrink-0" />
          <span>No saved items yet</span>
        </div>
        <Button type="button" size="sm" variant="ghost" className="h-7 shrink-0 text-xs" onClick={onOpenItems}>
          Create one
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted/50"
        onClick={() => setOpen(current => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <PackageOpen className="h-3.5 w-3.5" />
          Add saved item...
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="space-y-2 border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                type="search"
                placeholder="Search saved items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closePicker();
                }}
                className="h-8 pl-8 text-sm"
                aria-label="Search saved items"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto" role="listbox" aria-label="Saved items">
            {visibleItems.length === 0 ? (
              <div className="py-5 text-center text-sm text-muted-foreground">No items found</div>
            ) : (
              visibleItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  className="w-full border-b border-border/50 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-muted"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      {item.details && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.details}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
