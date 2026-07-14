import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceApp from './InvoiceApp';

const business = {
  id: 'biz-1',
  businessName: 'Cake Studio',
  businessAddress: '',
  bankDetails: '',
  email: '',
  phone: '',
  logo: null,
};

const catalogItem = {
  id: 'cake',
  businessId: 'biz-1',
  type: 'product',
  name: 'Chocolate Cake',
  details: 'Serves twelve',
  price: 45,
};

const blankDraft = {
  number: 'CLIENT-20260713-001',
  date: '2026-07-13',
  dueDate: '',
  currency: 'GBP',
  clientName: '',
  clientAddress: '',
  clientEmail: '',
  taxRate: '',
  items: [{ description: '', quantity: '', rate: '', total: 0 }],
};

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem('invoice-businesses', JSON.stringify([business]));
  window.localStorage.setItem('invoice-active-business', JSON.stringify(business.id));
  window.localStorage.setItem('invoice-clients', JSON.stringify([]));
  window.localStorage.setItem('invoice-active-client', JSON.stringify(null));
  window.localStorage.setItem('invoice-catalog-items', JSON.stringify([catalogItem]));
  window.localStorage.setItem('invoice-counter', JSON.stringify(1));
  window.localStorage.setItem('invoice-draft', JSON.stringify(blankDraft));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('InvoiceApp catalogue integration', () => {
  it('opens Items at the top of the page from the empty mobile picker', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    window.localStorage.setItem('invoice-catalog-items', JSON.stringify([]));
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    vi.stubGlobal('scrollTo', scrollTo);

    render(<InvoiceApp />);
    await user.click(screen.getByRole('button', { name: 'Create one' }));

    expect(screen.getByRole('tab', { name: 'Items' })).toHaveAttribute('data-state', 'active');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('saves and updates invoice lines without treating quantity as a catalogue change', async () => {
    const user = userEvent.setup();
    render(<InvoiceApp />);

    const saveButton = screen.getByRole('button', { name: 'Save item' });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByLabelText('Item name'), '  Logo Design  ');
    await user.type(screen.getByLabelText('Details'), 'Brand package');
    await user.type(screen.getByLabelText('Rate'), '25');
    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    let storedItems = JSON.parse(window.localStorage.getItem('invoice-catalog-items'));
    const savedItem = storedItems.find(item => item.name === 'Logo Design');
    expect(savedItem).toMatchObject({
      businessId: 'biz-1',
      details: 'Brand package',
      price: 25,
    });
    expect(savedItem).not.toHaveProperty('type');

    await user.type(screen.getByLabelText('Qty'), '2');
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();

    await user.clear(screen.getByLabelText('Rate'));
    await user.type(screen.getByLabelText('Rate'), '30');
    expect(screen.getByRole('button', { name: 'Update item' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Update item' }));

    storedItems = JSON.parse(window.localStorage.getItem('invoice-catalog-items'));
    expect(storedItems).toHaveLength(2);
    expect(storedItems.find(item => item.id === savedItem.id).price).toBe(30);
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();

    await user.clear(screen.getByLabelText('Item name'));
    await user.type(screen.getByLabelText('Item name'), 'chocolate cake');
    expect(screen.getByRole('alert')).toHaveTextContent('An item with this name is already saved.');
    expect(screen.getByRole('button', { name: 'Update item' })).toBeDisabled();
  });

  it('returns a linked invoice line to Save item when its catalogue item is deleted', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<InvoiceApp />);

    await user.click(screen.getByRole('button', { name: /Add saved item/ }));
    await user.click(screen.getByRole('option', { name: /Chocolate Cake/ }));
    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();

    await user.click(screen.getByRole('tab', { name: 'Items' }));
    await user.click(screen.getByRole('button', { name: 'Delete Chocolate Cake' }));
    await user.click(screen.getByRole('tab', { name: 'Invoice' }));

    expect(screen.getByRole('button', { name: 'Save item' })).toBeEnabled();
    expect(screen.getByLabelText('Item name')).toHaveValue('Chocolate Cake');
  });

  it('links the Items and Invoice currency controls and persists the business default', async () => {
    const user = userEvent.setup();
    render(<InvoiceApp />);

    await user.click(screen.getByRole('tab', { name: 'Items' }));
    await user.selectOptions(screen.getByLabelText('Currency'), 'USD');

    expect(JSON.parse(window.localStorage.getItem('invoice-businesses'))[0].currency).toBe('USD');
    expect(JSON.parse(window.localStorage.getItem('invoice-draft')).currency).toBe('USD');
    expect(screen.getByText(/^(?:US)?\$45\.00$/)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Invoice' }));
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');

    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR');
    await user.click(screen.getByRole('tab', { name: 'Items' }));
    expect(screen.getByLabelText('Currency')).toHaveValue('EUR');
    expect(JSON.parse(window.localStorage.getItem('invoice-catalog-items'))[0].price).toBe(45);
  });

  it('persists copied lines, keeps them independent, and cascades business catalogue deletion', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<InvoiceApp />);

    await user.click(screen.getByRole('button', { name: /Add saved item/ }));
    await user.click(screen.getByRole('option', { name: /Chocolate Cake/ }));

    expect(screen.getByLabelText('Item name')).toHaveValue('Chocolate Cake');
    expect(screen.getByLabelText('Details')).toHaveValue('Serves twelve');
    expect(screen.getByLabelText('Qty')).toHaveValue(1);
    expect(screen.getByLabelText('Rate')).toHaveValue(45);

    const storedDraft = JSON.parse(window.localStorage.getItem('invoice-draft'));
    expect(storedDraft.items[0]).toMatchObject({
      description: 'Chocolate Cake',
      details: 'Serves twelve',
      quantity: '1',
      rate: '45',
      total: 45,
    });

    await user.click(screen.getByRole('tab', { name: 'Items' }));
    await user.click(screen.getByRole('button', { name: 'Edit Chocolate Cake' }));
    const editForm = screen.getByText('Edit Item').parentElement;
    const name = within(editForm).getByLabelText('Name *');
    await user.clear(name);
    await user.type(name, 'Updated Cake');
    await user.click(within(editForm).getByRole('button', { name: 'Save' }));

    expect(JSON.parse(window.localStorage.getItem('invoice-catalog-items'))[0].name).toBe('Updated Cake');

    await user.click(screen.getByRole('tab', { name: 'Invoice' }));
    expect(screen.getByLabelText('Item name')).toHaveValue('Chocolate Cake');

    await user.click(screen.getByRole('tab', { name: 'Businesses' }));
    await user.click(screen.getByRole('button', { name: 'Delete Cake Studio' }));

    expect(window.confirm).toHaveBeenCalledWith('Delete Cake Studio? This will also delete 1 saved item.');
    expect(JSON.parse(window.localStorage.getItem('invoice-businesses'))).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem('invoice-catalog-items'))).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem('invoice-draft')).items[0].description).toBe('Chocolate Cake');
  });

  it('restores catalogue entries from browser storage', async () => {
    const user = userEvent.setup();
    render(<InvoiceApp />);

    await user.click(screen.getByRole('tab', { name: 'Items' }));
    expect(screen.getByText('Chocolate Cake')).toBeInTheDocument();
    expect(screen.getByText('Serves twelve')).toBeInTheDocument();
  });
});
