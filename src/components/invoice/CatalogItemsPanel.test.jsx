import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogItemsPanel from './CatalogItemsPanel';

const savedItems = [
  { id: 'cake', businessId: 'biz-1', type: 'product', name: 'Chocolate Cake', details: 'Serves twelve', price: 45 },
  { id: 'music', businessId: 'biz-1', type: 'service', name: 'Guitar Performance', details: 'One hour', price: 80 },
  { id: 'other', businessId: 'biz-2', type: 'product', name: 'Hidden Brownies', details: '', price: 20 },
];

function Harness({ initialItems = [], businessId = 'biz-1', currency = 'GBP', onCurrencyChange = () => {} }) {
  const [items, setItems] = useState(initialItems);

  return (
    <>
      <CatalogItemsPanel
        items={items}
        businessId={businessId}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
        onSaveItems={setItems}
        onAddToInvoice={() => {}}
        onOpenBusinesses={() => {}}
      />
      <output data-testid="stored-items">{JSON.stringify(items)}</output>
    </>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CatalogItemsPanel', () => {
  it('creates a trimmed item with details and a numeric price', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.type(screen.getByLabelText('Name *'), '  Vanilla Cake  ');
    await user.type(screen.getByLabelText('Price *'), '25.50');
    await user.type(screen.getByLabelText('Details'), 'Serves eight');
    await user.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByText('Vanilla Cake')).toBeInTheDocument();
    expect(screen.getByText('£25.50')).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('stored-items').textContent)).toEqual([
      expect.objectContaining({
        businessId: 'biz-1',
        name: 'Vanilla Cake',
        details: 'Serves eight',
        price: 25.5,
      }),
    ]);
  });

  it('blocks case-insensitive duplicate names', async () => {
    const user = userEvent.setup();
    render(<Harness initialItems={savedItems} />);

    await user.click(screen.getByRole('button', { name: 'Add Item' }));
    await user.type(screen.getByLabelText('Name *'), ' chocolate cake ');
    await user.type(screen.getByLabelText('Price *'), '50');

    expect(screen.getByRole('alert')).toHaveTextContent('An item with this name already exists.');
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeDisabled();
  });

  it('searches details and hides other businesses', async () => {
    const user = userEvent.setup();
    render(<Harness initialItems={savedItems} />);

    expect(screen.queryByText('Hidden Brownies')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Search saved items'), 'twelve');
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.queryByText('Guitar Performance')).not.toBeInTheDocument();
  });

  it('edits and confirm-deletes entries', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Harness initialItems={[savedItems[0]]} />);

    await user.click(screen.getByRole('button', { name: 'Edit Chocolate Cake' }));
    const form = screen.getByText('Edit Item').parentElement;
    const price = within(form).getByLabelText('Price *');
    await user.clear(price);
    await user.type(price, '55');
    await user.click(within(form).getByRole('button', { name: 'Save' }));
    expect(screen.getByText('£55.00')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Chocolate Cake' }));
    expect(window.confirm).toHaveBeenCalledWith('Delete "Chocolate Cake"?');
    expect(screen.queryByText('Chocolate Cake')).not.toBeInTheDocument();
  });

  it('shows business setup and uses the selected invoice currency', () => {
    const onOpenBusinesses = vi.fn();
    const { rerender } = render(
      <CatalogItemsPanel
        items={[]}
        businessId={null}
        currency="USD"
        onCurrencyChange={() => {}}
        onSaveItems={() => {}}
        onAddToInvoice={() => {}}
        onOpenBusinesses={onOpenBusinesses}
      />
    );

    expect(screen.getByText('Add or select a business before saving items.')).toBeInTheDocument();

    rerender(
      <CatalogItemsPanel
        items={[savedItems[0]]}
        businessId="biz-1"
        currency="USD"
        onCurrencyChange={() => {}}
        onSaveItems={() => {}}
        onAddToInvoice={() => {}}
        onOpenBusinesses={onOpenBusinesses}
      />
    );
    expect(screen.getByText(/^(?:US)?\$45\.00$/)).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });

  it('reports currency changes from the Items tab', async () => {
    const user = userEvent.setup();
    const onCurrencyChange = vi.fn();
    render(<Harness initialItems={[savedItems[0]]} onCurrencyChange={onCurrencyChange} />);

    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR');

    expect(onCurrencyChange).toHaveBeenCalledWith('EUR');
  });
});
