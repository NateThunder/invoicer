import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Send, Printer, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { getInvoiceTotals } from '@/lib/invoiceTotals';

export default function InvoiceActions({ invoice, settings }) {
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState('');

  const { total } = getInvoiceTotals(invoice);

  const validate = () => {
    if (!invoice.clientName.trim()) return 'Please enter a client name.';
    if (!invoice.date) return 'Please select an invoice date.';
    if (invoice.items.every(item => !item.description && item.total === 0)) return 'Please add at least one line item.';
    return '';
  };

  const handleDownloadAndSend = () => {
    const err = validate();
    if (err) {
      setError(err);
      setTimeout(() => setError(''), 3000);
      setShowActions(false);
      return;
    }
    setError('');
    setShowActions(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const businessName = settings.businessName || 'Our Company';
    const invoiceDate = invoice.date ? format(new Date(invoice.date + 'T00:00:00'), 'MMM d, yyyy') : 'N/A';
    const subject = encodeURIComponent(`Invoice ${invoice.number} from ${businessName}`);
    const body = encodeURIComponent(
      `Dear ${invoice.clientName},\n\n` +
      `Please find attached Invoice ${invoice.number} dated ${invoiceDate}.\n\n` +
      `Amount Due: ${formatCurrency(total, invoice.currency)}\n\n` +
      `Thank you for your business.\n\n` +
      `Best regards,\n${businessName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 h-11 text-sm font-semibold shadow-sm"
        onClick={handleDownloadAndSend}
      >
        <Send className="w-4 h-4" />
        Download & Send
      </Button>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <Button variant="outline" className="w-full gap-2 h-10" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </Button>
            <Button variant="outline" className="w-full gap-2 h-10" onClick={handleEmail}>
              <Mail className="w-4 h-4" />
              Email to Client
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Use "Print / Save as PDF" to save a clean PDF. Use your browser's "Save as PDF" option in the print dialog.
      </p>
    </div>
  );
}
