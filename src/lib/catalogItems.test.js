import { describe, expect, it } from 'vitest';
import {
  addCatalogItemToInvoice,
  catalogItemMatchesInvoiceLine,
  createBlankInvoiceItem,
  getVisibleCatalogItems,
  isDuplicateCatalogItem,
} from './catalogItems';

const catalogItems = [
  { id: '1', businessId: 'biz-1', type: 'service', name: 'Guitar performance', details: 'One hour', price: 80 },
  { id: '2', businessId: 'biz-1', type: 'product', name: 'Chocolate cake', details: 'Serves twelve', price: 45 },
  { id: '3', businessId: 'biz-2', type: 'product', name: 'Brownie box', details: 'Six brownies', price: 20 },
];

describe('catalog item helpers', () => {
  it('detects duplicate names within a business regardless of legacy type data', () => {
    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-1',
      type: 'product',
      name: '  CHOCOLATE CAKE ',
    })).toBe(true);

    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-1',
      type: 'service',
      name: 'Chocolate cake',
    })).toBe(true);

    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-2',
      type: 'product',
      name: 'Chocolate cake',
    })).toBe(false);
  });

  it('isolates by business, searches details, and sorts names', () => {
    const all = getVisibleCatalogItems(catalogItems, {
      businessId: 'biz-1',
      search: '',
    });
    expect(all.map(item => item.name)).toEqual(['Chocolate cake', 'Guitar performance']);

    const detailMatch = getVisibleCatalogItems(catalogItems, {
      businessId: 'biz-1',
      search: 'twelve',
    });
    expect(detailMatch.map(item => item.id)).toEqual(['2']);
  });

  it('replaces the untouched initial line with an independent snapshot', () => {
    const source = catalogItems[1];
    const result = addCatalogItemToInvoice([createBlankInvoiceItem()], source);

    expect(result).toEqual([{
      catalogItemId: '2',
      description: 'Chocolate cake',
      details: 'Serves twelve',
      quantity: '1',
      rate: '45',
      total: 45,
    }]);

    source.name = 'Changed later';
    source.price = 60;
    expect(result[0].description).toBe('Chocolate cake');
    expect(result[0].rate).toBe('45');
    expect(catalogItemMatchesInvoiceLine(source, result[0])).toBe(false);
  });

  it('matches catalogue fields while ignoring invoice quantity', () => {
    const line = {
      catalogItemId: '1',
      description: ' Guitar performance ',
      details: 'One hour',
      quantity: '12',
      rate: '80.00',
      total: 960,
    };

    expect(catalogItemMatchesInvoiceLine(catalogItems[0], line)).toBe(true);
    expect(catalogItemMatchesInvoiceLine(catalogItems[0], { ...line, rate: '81' })).toBe(false);
    expect(catalogItemMatchesInvoiceLine({ ...catalogItems[0], price: 0 }, { ...line, rate: '' })).toBe(false);
  });

  it('appends to a non-empty invoice instead of replacing it', () => {
    const existing = {
      description: 'Existing line',
      details: '',
      quantity: '2',
      rate: '10',
      total: 20,
    };

    const result = addCatalogItemToInvoice([existing], catalogItems[0]);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(existing);
    expect(result[1]).toMatchObject({ description: 'Guitar performance', quantity: '1', total: 80 });
  });
});
