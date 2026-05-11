import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Send, Printer, AlertCircle, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { getInvoiceTotals } from '@/lib/invoiceTotals';

const getPdfFileName = (invoiceNumber) => {
  const safeNumber = String(invoiceNumber || 'invoice')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-');

  return `${safeNumber || 'invoice'}.pdf`;
};

export default function InvoiceActions({ invoice, settings }) {
  const [showActions, setShowActions] = useState(false);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleSavePdf = async () => {
    const err = validate();
    if (err) {
      setError(err);
      setTimeout(() => setError(''), 3000);
      return;
    }

    const invoicePreview = document.getElementById('invoice-preview-print');
    if (!invoicePreview) {
      setError('Invoice preview is not available.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setError('');
    setIsGeneratingPdf(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(invoicePreview, {
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const imageWidth = availableWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const imageData = canvas.toDataURL('image/png');

      if (imageHeight <= availableHeight) {
        pdf.addImage(imageData, 'PNG', margin, margin, imageWidth, imageHeight);
      } else {
        let remainingHeight = imageHeight;
        let yOffset = margin;

        while (remainingHeight > 0) {
          pdf.addImage(imageData, 'PNG', margin, yOffset, imageWidth, imageHeight);
          remainingHeight -= availableHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
            yOffset -= availableHeight;
          }
        }
      }

      pdf.save(getPdfFileName(invoice.number));
    } catch {
      setError('Could not generate the PDF. Please try printing instead.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
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
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full gap-2 h-10" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" className="w-full gap-2 h-10" onClick={handleSavePdf} disabled={isGeneratingPdf}>
                <FileDown className="w-4 h-4" />
                {isGeneratingPdf ? 'Saving...' : 'Save as PDF'}
              </Button>
            </div>
            <Button variant="outline" className="w-full gap-2 h-10" onClick={handleEmail}>
              <Mail className="w-4 h-4" />
              Email to Client
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
        Use "Save as PDF" to download the invoice directly, or print a paper copy.
      </p>
    </div>
  );
}
