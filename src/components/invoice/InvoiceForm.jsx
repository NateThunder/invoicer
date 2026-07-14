import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, RotateCcw } from "lucide-react";
import LineItemsTable from './LineItemsTable';
import ClientSelector from './ClientSelector';
import CatalogItemPicker from './CatalogItemPicker';
import CurrencySelect from './CurrencySelect';
import { formatCurrency } from '@/lib/currency';
import { getInvoiceTotals } from '@/lib/invoiceTotals';

export default function InvoiceForm({
  invoice,
  onChange,
  onReset,
  clients,
  onCurrencyChange,
  activeClientId,
  onSetActiveClient,
  catalogItems,
  onAddCatalogItem,
  onOpenItems,
  businessId,
  onSaveCatalogItem,
}) {
  const update = (field, value) => onChange({ ...invoice, [field]: value });

  const { subtotal, taxRate, tax, total, hasTax } = getInvoiceTotals(invoice);

  const handleClientSelect = (client) => {
    if (!client) {
      onSetActiveClient(null);
      // Clear client fields
      onChange({ ...invoice, clientName: '', clientAddress: '', clientEmail: '' });
      return;
    }
    onSetActiveClient(client.id);
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5 min-w-0">
          <Label className="text-sm font-medium">Invoice #</Label>
          <Input value={invoice.number} readOnly className="bg-muted/50 font-mono text-sm" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label className="text-sm font-medium whitespace-nowrap">Invoice Date</Label>
          <Input type="date" value={invoice.date} onChange={(e) => update('date', e.target.value)} className="px-2 text-sm" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <Label className="text-sm font-medium whitespace-nowrap">Due Date</Label>
          <Input type="date" value={invoice.dueDate} onChange={(e) => update('dueDate', e.target.value)} className="px-2 text-sm" />
        </div>
        <div className="sm:col-span-3">
          <CurrencySelect
            id="invoice-currency"
            value={invoice.currency}
            onChange={onCurrencyChange}
          />
        </div>
      </div>

      {/* Client section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium block">Client</Label>
        <ClientSelector
          clients={clients}
          onSelect={handleClientSelect}
          selectedName={invoice.clientName}
          activeClientId={activeClientId}
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
        <div className="mb-3">
          <CatalogItemPicker
            items={catalogItems}
            currency={invoice.currency}
            onSelect={onAddCatalogItem}
            onOpenItems={onOpenItems}
          />
        </div>
        <LineItemsTable
          items={invoice.items}
          currency={invoice.currency}
          businessId={businessId}
          catalogItems={catalogItems}
          onChange={(items) => update('items', items)}
          onSaveItem={onSaveCatalogItem}
        />
      </div>

      {/* Tax */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Tax (%)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Optional"
          value={invoice.taxRate ?? ''}
          onChange={(e) => update('taxRate', e.target.value)}
        />
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {hasTax && (
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Tax ({taxRate}%)</span>
              <span className="font-medium tabular-nums">{formatCurrency(tax, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t-2 border-foreground/10 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
