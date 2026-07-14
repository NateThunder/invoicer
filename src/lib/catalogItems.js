export const createBlankInvoiceItem = () => ({
  description: '',
  details: '',
  quantity: '',
  rate: '',
  total: 0,
});

const normalizeName = (name = '') => name.trim().toLocaleLowerCase();

export function isDuplicateCatalogItem(items, candidate, excludedId = null) {
  const normalizedCandidateName = normalizeName(candidate.name);

  if (!normalizedCandidateName) return false;

  return items.some((item) => (
    item.id !== excludedId &&
    item.businessId === candidate.businessId &&
    normalizeName(item.name) === normalizedCandidateName
  ));
}

export function getVisibleCatalogItems(items, { businessId, search = '' }) {
  const normalizedSearch = search.trim().toLocaleLowerCase();

  return items
    .filter((item) => item.businessId === businessId)
    .filter((item) => (
      !normalizedSearch ||
      item.name.toLocaleLowerCase().includes(normalizedSearch) ||
      (item.details || '').toLocaleLowerCase().includes(normalizedSearch)
    ))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function createCatalogItemId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function catalogItemMatchesInvoiceLine(catalogItem, invoiceLine) {
  if (!catalogItem || !invoiceLine) return false;

  return (
    normalizeName(catalogItem.name) === normalizeName(invoiceLine.description) &&
    (catalogItem.details || '').trim() === (invoiceLine.details || '').trim() &&
    invoiceLine.rate !== '' &&
    invoiceLine.rate != null &&
    Number(catalogItem.price || 0) === Number(invoiceLine.rate || 0)
  );
}

export function catalogItemToInvoiceLine(item) {
  const price = Number(item.price) || 0;

  return {
    catalogItemId: item.id,
    description: item.name,
    details: item.details || '',
    quantity: '1',
    rate: String(price),
    total: price,
  };
}

export function isUntouchedInvoiceItem(item) {
  return (
    !(item.description || '').trim() &&
    !(item.details || '').trim() &&
    (item.quantity === '' || item.quantity == null) &&
    (item.rate === '' || item.rate == null) &&
    Number(item.total || 0) === 0
  );
}

export function addCatalogItemToInvoice(items, catalogItem) {
  const currentItems = Array.isArray(items) ? items : [];
  const nextItem = catalogItemToInvoiceLine(catalogItem);

  if (currentItems.length === 1 && isUntouchedInvoiceItem(currentItems[0])) {
    return [nextItem];
  }

  return [...currentItems, nextItem];
}
