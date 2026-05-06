import React from 'react';
import { format } from 'date-fns';
import { ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { getInvoiceTotals } from '@/lib/invoiceTotals';

export default function InvoicePreview({ invoice, settings }) {
  const { subtotal, taxRate, tax, total, hasTax } = getInvoiceTotals(invoice);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy');
  };

  return (
    <div id="invoice-preview-print" className="bg-white text-gray-900 rounded-lg shadow-sm border border-gray-200 p-8 md:p-10 max-w-[800px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex items-start gap-4">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="w-14 h-14 object-contain rounded" />
          ) : (
            <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-300" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {settings.businessName || 'Your Business'}
            </h1>
            {settings.businessAddress && (
              <p className="text-xs text-gray-500 mt-1 whitespace-pre-line leading-relaxed">{settings.businessAddress}</p>
            )}
            {settings.email && (
              <p className="text-xs text-gray-500 mt-0.5">{settings.email}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
            INVOICE
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-mono">{invoice.number}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1.5">Bill To</p>
          <p className="font-semibold text-sm text-gray-900">{invoice.clientName || '-'}</p>
          {invoice.clientAddress && (
            <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed">{invoice.clientAddress}</p>
          )}
        </div>
        <div className="text-right space-y-1.5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Invoice Date</p>
            <p className="text-sm text-gray-700">{formatDate(invoice.date)}</p>
          </div>
          {invoice.dueDate && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Due Date</p>
              <p className="text-sm text-gray-700">{formatDate(invoice.dueDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left text-[10px] uppercase tracking-widest font-semibold text-gray-500 pb-2 w-[50%]">Description</th>
            <th className="text-right text-[10px] uppercase tracking-widest font-semibold text-gray-500 pb-2 w-[15%]">Qty</th>
            <th className="text-right text-[10px] uppercase tracking-widest font-semibold text-gray-500 pb-2 w-[17%]">Rate</th>
            <th className="text-right text-[10px] uppercase tracking-widest font-semibold text-gray-500 pb-2 w-[18%]">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.filter(item => item.description || item.total > 0).map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3 text-sm text-gray-800">{item.description || '-'}</td>
              <td className="py-3 text-sm text-gray-600 text-right tabular-nums">{item.quantity}</td>
              <td className="py-3 text-sm text-gray-600 text-right tabular-nums">{formatCurrency(parseFloat(item.rate || 0), invoice.currency)}</td>
              <td className="py-3 text-sm text-gray-900 font-medium text-right tabular-nums">{formatCurrency(item.total, invoice.currency)}</td>
            </tr>
          ))}
          {invoice.items.filter(item => item.description || item.total > 0).length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-sm text-gray-400">No items added yet</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-64">
          <div className="flex justify-between py-1.5 text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-700 tabular-nums">{formatCurrency(subtotal, invoice.currency)}</span>
          </div>
          {hasTax && (
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500">Tax ({taxRate}%)</span>
              <span className="text-gray-700 tabular-nums">{formatCurrency(tax, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-2.5 border-t-2 border-gray-900 mt-1 text-base">
            <span className="font-bold text-gray-900">Total Due</span>
            <span className="font-bold text-gray-900 tabular-nums">{formatCurrency(total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Bank details */}
      {settings.bankDetails && (
        <div className="border-t border-gray-200 pt-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Payment Details</p>
          <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">{settings.bankDetails}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">Thank you for your business</p>
      </div>
    </div>
  );
}
