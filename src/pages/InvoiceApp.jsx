import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Users, FileText, Eye, ChevronDown } from "lucide-react";
import useLocalStorage from '@/lib/useLocalStorage';
import BusinessManager from '@/components/invoice/BusinessManager';
import ClientsPanel from '@/components/invoice/ClientsPanel';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import { currencyOptions } from '@/lib/currency';

const createEmptyInvoice = (number) => ({
  number,
  date: format(new Date(), 'yyyy-MM-dd'),
  dueDate: '',
  currency: 'USD',
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  taxRate: '',
  items: [{ description: '', quantity: 1, rate: 0, total: 0 }],
});

export default function InvoiceApp() {
  const [businesses, setBusinesses] = useLocalStorage('invoice-businesses', []);
  const [activeBusinessId, setActiveBusinessId] = useLocalStorage('invoice-active-business', null);
  const [clients, setClients] = useLocalStorage('invoice-clients', []);
  const [activeClientId, setActiveClientId] = useLocalStorage('invoice-active-client', null);
  const [invoiceCounter, setInvoiceCounter] = useLocalStorage('invoice-counter', 1);
  const [activeTab, setActiveTab] = useState('invoice');

  const invoiceNumber = useMemo(() => `INV-${String(invoiceCounter).padStart(4, '0')}`, [invoiceCounter]);
  const [invoice, setInvoice] = useLocalStorage('invoice-draft', createEmptyInvoice(invoiceNumber));

  // Keep invoice number in sync with counter
  useEffect(() => {
    setInvoice(prev => ({ ...prev, number: invoiceNumber }));
  }, [invoiceNumber]);

  useEffect(() => {
    if (!invoice.currency) {
      setInvoice(prev => ({ ...prev, currency: 'USD' }));
    }
  }, [invoice.currency]);

  const activeBusiness = useMemo(
    () => businesses.find(b => b.id === activeBusinessId) || null,
    [businesses, activeBusinessId]
  );
  const activeClient = useMemo(
    () => clients.find(c => c.id === activeClientId) || null,
    [clients, activeClientId]
  );

  useEffect(() => {
    setInvoice(prev => {
      const nextClientName = activeClient?.name || '';
      const nextClientAddress = activeClient?.address || '';
      const nextClientEmail = activeClient?.email || '';

      if (
        prev.clientName === nextClientName &&
        prev.clientAddress === nextClientAddress &&
        prev.clientEmail === nextClientEmail
      ) {
        return prev;
      }

      return {
        ...prev,
        clientName: nextClientName,
        clientAddress: nextClientAddress,
        clientEmail: nextClientEmail,
      };
    });
  }, [activeClient, invoice.clientName, invoice.clientAddress, invoice.clientEmail]);

  // Build settings shape from active business for InvoicePreview compatibility
  const settings = useMemo(() => ({
    businessName: activeBusiness?.businessName || '',
    businessAddress: activeBusiness?.businessAddress || '',
    bankDetails: activeBusiness?.bankDetails || '',
    email: activeBusiness?.email || '',
    phone: activeBusiness?.phone || '',
    logo: activeBusiness?.logo || null,
  }), [activeBusiness]);

  const handleSelectClient = (client) => {
    setActiveClientId(client.id);
    setActiveTab('invoice');
  };

  const handleReset = () => {
    const nextCounter = invoiceCounter + 1;
    setInvoiceCounter(nextCounter);
    const nextNumber = `INV-${String(nextCounter).padStart(4, '0')}`;
    setInvoice(createEmptyInvoice(nextNumber));
  };

  return (
    <div className="min-h-screen bg-background print:bg-white print:p-0">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-foreground" />
            </div>
            <h1 className="text-xl font-heading font-bold text-foreground tracking-tight">Invoicer</h1>
          </div>

          {/* Active business selector */}
          <div className="flex items-center gap-2 min-w-0">
            {businesses.length === 0 ? (
              <button
                className="flex items-center gap-2 text-sm text-muted-foreground border border-dashed border-border px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setActiveTab('businesses')}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Add a business to get started</span>
                <span className="sm:hidden">Add business</span>
              </button>
            ) : (
              <div className="relative group">
                <select
                  value={activeBusinessId || ''}
                  onChange={(e) => setActiveBusinessId(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring max-w-[200px] truncate"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.businessName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:block">{invoiceNumber}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        <div className="grid lg:grid-cols-[420px_1fr] gap-8 print:block">
          {/* Left panel */}
          <div className="print:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6 h-11">
                <TabsTrigger value="businesses" className="gap-1.5 text-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  Businesses
                </TabsTrigger>
                <TabsTrigger value="clients" className="gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="invoice" className="gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </TabsTrigger>
              </TabsList>

              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <TabsContent value="businesses" className="mt-0">
                  <BusinessManager
                    businesses={businesses}
                    activeBusiness={activeBusinessId}
                    onSaveBusinesses={setBusinesses}
                    onSetActive={setActiveBusinessId}
                  />
                </TabsContent>
                <TabsContent value="clients" className="mt-0">
                  <ClientsPanel
                    clients={clients}
                    activeClient={activeClientId}
                    onSaveClients={setClients}
                    onSelectClient={handleSelectClient}
                    onSetActive={setActiveClientId}
                  />
                </TabsContent>
                <TabsContent value="invoice" className="mt-0">
                  <InvoiceForm
                    invoice={invoice}
                    onChange={setInvoice}
                    onReset={handleReset}
                    clients={clients}
                    currencyOptions={currencyOptions}
                    activeClientId={activeClientId}
                    onSetActiveClient={setActiveClientId}
                  />
                </TabsContent>
              </div>

              <div className="mt-6 bg-card rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Actions</span>
                </div>
                <InvoiceActions invoice={invoice} settings={settings} />
              </div>
            </Tabs>
          </div>

          {/* Right panel - live preview */}
          <div>
            <div className="print:hidden mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Live Preview</h2>
              {activeBusiness && (
                <span className="text-xs text-muted-foreground ml-1">- {activeBusiness.businessName}</span>
              )}
              {activeClient && (
                <span className="text-xs text-muted-foreground">for {activeClient.name}</span>
              )}
            </div>
            <InvoicePreview invoice={invoice} settings={settings} />
          </div>
        </div>
      </main>
    </div>
  );
}
