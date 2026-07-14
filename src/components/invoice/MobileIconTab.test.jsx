import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PackageOpen } from 'lucide-react';
import { Tabs, TabsList } from '@/components/ui/tabs';
import MobileIconTab from './MobileIconTab';

describe('MobileIconTab', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const renderTab = (onShortPress) => render(
    <Tabs value="invoice">
      <TabsList>
        <MobileIconTab
          value="items"
          label="Items"
          icon={PackageOpen}
          onShortPress={onShortPress}
        />
      </TabsList>
    </Tabs>,
  );

  it('selects the tab after a short touch', () => {
    const onShortPress = vi.fn();
    renderTab(onShortPress);
    const tab = screen.getByRole('tab', { name: 'Items' });

    fireEvent.pointerDown(tab, { pointerType: 'touch', clientX: 10, clientY: 10 });
    fireEvent.pointerUp(tab, { pointerType: 'touch', clientX: 10, clientY: 10 });

    expect(onShortPress).toHaveBeenCalledWith('items');
  });

  it('shows its label after a hold without selecting the tab', () => {
    const onShortPress = vi.fn();
    renderTab(onShortPress);
    const tab = screen.getByRole('tab', { name: 'Items' });

    fireEvent.pointerDown(tab, { pointerType: 'touch', clientX: 10, clientY: 10 });
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByRole('tooltip')).toHaveTextContent('Items');

    fireEvent.pointerUp(tab, { pointerType: 'touch', clientX: 10, clientY: 10 });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(onShortPress).not.toHaveBeenCalled();
  });
});
