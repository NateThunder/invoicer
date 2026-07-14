import { describe, expect, it } from 'vitest';
import {
  addCatalogItemToInvoice,
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
  it('detects duplicate names only within the same business and type', () => {
    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-1',
      type: 'product',
      name: '  CHOCOLATE CAKE ',
    })).toBe(true);

    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-1',
      type: 'service',
      name: 'Chocolate cake',
    })).toBe(false);

    expect(isDuplicateCatalogItem(catalogItems, {
      businessId: 'biz-2',
      type: 'product',
      name: 'Chocolate cake',
    })).toBe(false);
  });

  it('isolates by business, searches details, filters types, and sorts names', () => {
    const all = getVisibleCatalogItems(catalogItems, {
      businessId: 'biz-1',
      search: '',
      type: 'all',
    });
    expect(all.map(item => item.name)).toEqual(['Chocolate cake', 'Guitar performance']);

    const detailMatch = getVisibleCatalogItems(catalogItems, {
      businessId: 'biz-1',
      search: 'twelve',
      type: 'product',
    });
    expect(detailMatch.map(item => item.id)).toEqual(['2']);

    expect(getVisibleCatalogItems(catalogItems, {
      businessId: 'biz-1',
      search: '',
      type: 'service',
    }).map(item => item.id)).toEqual(['1']);
  });

  it('replaces the untouched initial line with an independent snapshot', () => {
    const source = catalogItems[1];
    const result = addCatalogItemToInvoice([createBlankInvoiceItem()], source);

    expect(result).toEqual([{
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
