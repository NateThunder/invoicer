export function getInvoiceTotals(invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxRate = Math.max(0, parseFloat(invoice.taxRate) || 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return {
    subtotal,
    taxRate,
    tax,
    total,
    hasTax: taxRate > 0,
  };
}
