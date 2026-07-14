import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogItemPicker from './CatalogItemPicker';

const items = [
  { id: 'cake', businessId: 'biz-1', type: 'product', name: 'Chocolate Cake', details: 'Serves twelve', price: 45 },
  { id: 'music', businessId: 'biz-1', type: 'service', name: 'Guitar Performance', details: 'One hour', price: 80 },
];

describe('CatalogItemPicker', () => {
  it('links to the Items tab when the catalogue is empty', async () => {
    const user = userEvent.setup();
    const onOpenItems = vi.fn();
    render(<CatalogItemPicker items={[]} currency="GBP" onSelect={() => {}} onOpenItems={onOpenItems} />);

    await user.click(screen.getByRole('button', { name: 'Create one' }));
    expect(onOpenItems).toHaveBeenCalledOnce();
  });

  it('searches, formats, and selects a saved item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CatalogItemPicker items={items} currency="GBP" onSelect={onSelect} onOpenItems={() => {}} />);

    await user.click(screen.getByRole('button', { name: /Add saved item/ }));
    expect(screen.getByText('£45.00')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Search saved items'), 'guitar');
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Guitar Performance/ }));

    expect(onSelect).toHaveBeenCalledWith(items[1]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
