import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, Search, X } from "lucide-react";

export default function ClientSelector({ clients, onSelect, selectedName, activeClientId }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (client) => {
    onSelect(client);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
  };

  if (clients.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 h-9 rounded-md border border-border bg-background text-sm hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selectedName ? "text-foreground font-medium" : "text-muted-foreground"}>
          {selectedName || "Use a saved client..."}
        </span>
        <div className="flex items-center gap-1">
          {selectedName && (
            <span onClick={handleClear} className="p-0.5 hover:text-destructive rounded">
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No clients found</div>
            ) : (
              filtered.map(client => (
                <button
                  key={client.id}
                  type="button"
                  className={`w-full text-left px-3 py-2.5 transition-colors border-b border-border/50 last:border-0 ${activeClientId === client.id ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-muted'}`}
                  onClick={() => handleSelect(client)}
                >
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-foreground">{client.name}</p>
                    {activeClientId === client.id && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                        <Check className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  {client.address && <p className="text-xs text-muted-foreground truncate mt-0.5">{client.address}</p>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
