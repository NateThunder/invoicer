import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, RotateCcw } from "lucide-react";
import LineItemsTable from './LineItemsTable';
import ClientSelector from './ClientSelector';

export default function InvoiceForm({ invoice, onChange, onReset, clients }) {
  const update = (field, value) => onChange({ ...invoice, [field]: value });

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleClientSelect = (client) => {
    if (!client) {
      // Clear client fields
      onChange({ ...invoice, clientName: '', clientAddress: '', clientEmail: '' });
      return;
    }
    onChange({
      ...invoice,
      clientName: client.name,
      clientAddress: client.address || '',
      clientEmail: client.email || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground">Invoice</h2>
            <p className="text-sm text-muted-foreground">Create and customize your invoice</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5" onClick={onReset}>
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </Button>
      </div>

      {/* Invoice meta */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Invoice #</Label>
          <Input value={invoice.number} readOnly className="bg-muted/50 font-mono text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Invoice Date</Label>
          <Input type="date" value={invoice.date} onChange={(e) => update('date', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Due Date</Label>
          <Input type="date" value={invoice.dueDate} onChange={(e) => update('dueDate', e.target.value)} />
        </div>
      </div>

      {/* Client section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium block">Client</Label>
        <ClientSelector
          clients={clients}
          onSelect={handleClientSelect}
          selectedName={invoice.clientName}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Client Name</Label>
            <Input placeholder="Client name" value={invoice.clientName} onChange={(e) => update('clientName', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Client Address</Label>
            <Textarea placeholder="Client address" value={invoice.clientAddress} onChange={(e) => update('clientAddress', e.target.value)} rows={2} />
          </div>
        </div>
      </div>

      {/* Line items */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Line Items</Label>
        <LineItemsTable items={invoice.items} onChange={(items) => update('items', items)} />
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="font-medium tabular-nums">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-foreground/10 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}