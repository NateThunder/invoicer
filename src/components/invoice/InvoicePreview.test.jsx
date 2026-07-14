import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvoicePreview from './InvoicePreview';

const baseInvoice = {
  number: 'TEST-001',
  date: '2026-07-13',
  dueDate: '',
  currency: 'GBP',
  clientName: 'Example Client',
  clientAddress: '',
  taxRate: '',
  items: [],
};

describe('InvoicePreview item details', () => {
  it('shows optional details beneath an item name and accepts legacy items', () => {
    render(
      <InvoicePreview
        settings={{}}
        invoice={{
          ...baseInvoice,
          items: [
            { description: 'Chocolate Cake', details: 'Serves twelve', quantity: '1', rate: '45', total: 45 },
            { description: 'Legacy item', quantity: '1', rate: '10', total: 10 },
          ],
        }}
      />
    );

    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('Serves twelve')).toBeInTheDocument();
    expect(screen.getByText('Legacy item')).toBeInTheDocument();
  });
});
