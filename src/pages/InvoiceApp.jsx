import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsContent } from "@/components/ui/tabs";
import { Building2, Users, FileText, Eye, ChevronDown, PackageOpen } from "lucide-react";
import useLocalStorage from '@/lib/useLocalStorage';
import BusinessManager from '@/components/invoice/BusinessManager';
import ClientsPanel from '@/components/invoice/ClientsPanel';
import CatalogItemsPanel from '@/components/invoice/CatalogItemsPanel';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import MobileIconTab from '@/components/invoice/MobileIconTab';
import {
  addCatalogItemToInvoice,
  createBlankInvoiceItem,
  createCatalogItemId,
  isDuplicateCatalogItem,
} from '@/lib/catalogItems';

const today = () => format(new Date(), 'yyyy-MM-dd');

const sanitizeInvoiceName = (name) => {
  const normalizedName = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedName || 'CLIENT';
};

const formatInvoiceDate = (date) => {
  const dateToFormat = date || today();

  return format(new Date(`${dateToFormat}T00:00:00`), 'yyyyMMdd');
};

const createInvoiceNumber = ({ clientName = '', date = '', counter }) => {
  const namePart = sanitizeInvoiceName(clientName);
  const datePart = formatInvoiceDate(date);
  const sequencePart = String(counter).padStart(3, '0');

  return `${namePart}-${datePart}-${sequencePart}`;
};

const createEmptyInvoice = (number) => ({
  number,
  date: today(),
  dueDate: '',
  currency: 'GBP',
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  taxRate: '',
  items: [createBlankInvoiceItem()],
});

export default function InvoiceApp() {
  const [businesses, setBusinesses] = useLocalStorage('invoice-businesses', []);
  const [activeBusinessId, setActiveBusinessId] = useLocalStorage('invoice-active-business', null);
  const [clients, setClients] = useLocalStorage('invoice-clients', []);
  const [activeClientId, setActiveClientId] = useLocalStorage('invoice-active-client', null);
  const [catalogItems, setCatalogItems] = useLocalStorage('invoice-catalog-items', []);
  const [invoiceCounter, setInvoiceCounter] = useLocalStorage('invoice-counter', 1);
  const [activeTab, setActiveTab] = useState('invoice');

  const initialInvoiceNumber = createInvoiceNumber({ counter: invoiceCounter });
  const [invoice, setInvoice] = useLocalStorage('invoice-draft', createEmptyInvoice(initialInvoiceNumber));
  const invoiceNumber = useMemo(
    () => createInvoiceNumber({
      clientName: invoice.clientName,
      date: invoice.date,
      counter: invoiceCounter,
    }),
    [invoice.clientName, invoice.date, invoiceCounter]
  );

  // Keep invoice number in sync with client, date, and counter.
  useEffect(() => {
    setInvoice(prev => ({ ...prev, number: invoiceNumber }));
  }, [invoiceNumber]);

  useEffect(() => {
    if (!invoice.currency) {
      setInvoice(prev => ({ ...prev, currency: 'GBP' }));
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
  const activeCatalogItems = useMemo(
    () => catalogItems.filter(item => item.businessId === activeBusinessId),
    [catalogItems, activeBusinessId]
  );

  // Give existing businesses a persisted default while preserving their other data.
  useEffect(() => {
    setBusinesses(current => {
      if (current.every(business => business.currency)) return current;

      return current.map(business => ({
        ...business,
        currency: business.currency || 'GBP',
      }));
    });
  }, [setBusinesses]);

  // Product/service categories are no longer part of saved items.
  useEffect(() => {
    setCatalogItems(current => {
      if (current.every(item => !Object.hasOwn(item, 'type'))) return current;

      return current.map(({ type: _type, ...item }) => item);
    });
  }, [setCatalogItems]);

  // The active business owns the currency used throughout the Items and Invoice tabs.
  useEffect(() => {
    if (!activeBusiness) return;

    const businessCurrency = activeBusiness.currency || 'GBP';
    setInvoice(prev => (
      prev.currency === businessCurrency
        ? prev
        : { ...prev, currency: businessCurrency }
    ));
  }, [activeBusiness, setInvoice]);

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

  const handleAddCatalogItem = (catalogItem) => {
    setInvoice(prev => ({
      ...prev,
      items: addCatalogItemToInvoice(prev.items, catalogItem),
    }));
  };

  const handleOpenItems = () => {
    setActiveTab('items');

    if (window.matchMedia?.('(max-width: 1023px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCurrencyChange = (currency) => {
    setInvoice(prev => (
      prev.currency === currency ? prev : { ...prev, currency }
    ));

    if (!activeBusinessId) return;

    setBusinesses(current => current.map(business => (
      business.id === activeBusinessId
        ? { ...business, currency }
        : business
    )));
  };

  const handleSaveInvoiceItem = (index, line) => {
    if (!activeBusinessId || !(line.description || '').trim()) return;

    const linkedItem = catalogItems.find(item => (
      item.id === line.catalogItemId && item.businessId === activeBusinessId
    ));

    if (isDuplicateCatalogItem(
      catalogItems,
      { businessId: activeBusinessId, name: line.description },
      linkedItem?.id
    )) return;

    const catalogItemId = linkedItem?.id || createCatalogItemId();
    const name = line.description.trim();
    const details = (line.details || '').trim();
    const price = Number(line.rate || 0);
    const savedItem = {
      id: catalogItemId,
      businessId: activeBusinessId,
      name,
      details,
      price,
    };

    setCatalogItems(current => (
      linkedItem
        ? current.map(item => item.id === catalogItemId ? savedItem : item)
        : [...current, savedItem]
    ));

    setInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const quantity = Number(item.quantity || 0);
        return {
          ...item,
          catalogItemId,
          description: name,
          details,
          rate: String(price),
          total: quantity * price,
        };
      }),
    }));
  };

  const handleDeleteBusiness = (id) => {
    const business = businesses.find(item => item.id === id);
    if (!business) return;

    const savedItemCount = catalogItems.filter(item => item.businessId === id).length;
    const catalogueWarning = savedItemCount > 0
      ? ` This will also delete ${savedItemCount} saved ${savedItemCount === 1 ? 'item' : 'items'}.`
      : '';

    if (!window.confirm(`Delete ${business.businessName}?${catalogueWarning}`)) return;

    const updatedBusinesses = businesses.filter(item => item.id !== id);
    setBusinesses(updatedBusinesses);
    setCatalogItems(current => current.filter(item => item.businessId !== id));

    if (activeBusinessId === id) {
      setActiveBusinessId(updatedBusinesses[0]?.id || null);
    }
  };

  const handleReset = () => {
    const nextCounter = invoiceCounter + 1;
    setInvoiceCounter(nextCounter);
    const nextNumber = createInvoiceNumber({ counter: nextCounter });
    setInvoice({
      ...createEmptyInvoice(nextNumber),
      currency: activeBusiness?.currency || invoice.currency || 'GBP',
    });
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_minmax(0,1fr)] print:block">
          {/* Left panel */}
          <div className="min-w-0 print:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6 overflow-visible pb-1 sm:overflow-x-auto">
                <TabsList className="h-11 w-full justify-start sm:w-max sm:min-w-full">
                  <MobileIconTab value="businesses" label="Businesses" icon={Building2} onShortPress={setActiveTab} />
                  <MobileIconTab value="items" label="Items" icon={PackageOpen} onShortPress={setActiveTab} />
                  <MobileIconTab value="clients" label="Clients" icon={Users} onShortPress={setActiveTab} />
                  <MobileIconTab value="invoice" label="Invoice" icon={FileText} onShortPress={setActiveTab} />
                </TabsList>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <TabsContent value="businesses" className="mt-0">
                  <BusinessManager
                    businesses={businesses}
                    activeBusiness={activeBusinessId}
                    onSaveBusinesses={setBusinesses}
                    onSetActive={setActiveBusinessId}
                    onDeleteBusiness={handleDeleteBusiness}
                  />
                </TabsContent>
                <TabsContent value="items" className="mt-0">
                  <CatalogItemsPanel
                    items={catalogItems}
                    businessId={activeBusinessId}
                    currency={invoice.currency}
                    onCurrencyChange={handleCurrencyChange}
                    onSaveItems={setCatalogItems}
                    onAddToInvoice={handleAddCatalogItem}
                    onOpenBusinesses={() => setActiveTab('businesses')}
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
                    onCurrencyChange={handleCurrencyChange}
                    activeClientId={activeClientId}
                    onSetActiveClient={setActiveClientId}
                    catalogItems={activeCatalogItems}
                    onAddCatalogItem={handleAddCatalogItem}
                    onOpenItems={handleOpenItems}
                    businessId={activeBusinessId}
                    onSaveCatalogItem={handleSaveInvoiceItem}
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
          <div className="min-w-0">
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
