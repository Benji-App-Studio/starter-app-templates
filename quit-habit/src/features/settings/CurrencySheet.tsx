import { currencies, formatMoney, profile, useProfile, type Currency } from '@/features/quit/profile';

import { PickerSheet } from './PickerSheet';

function isCurrency(value: string): value is Currency {
  return (currencies as readonly string[]).includes(value);
}

export function CurrencySheet() {
  const current = useProfile();

  return (
    <PickerSheet
      title="Currency"
      options={currencies.map((currency) => ({ id: currency, label: currency, hint: formatMoney(1234.5, currency) }))}
      selectedId={current?.currency ?? 'USD'}
      onSelect={(id) => {
        if (isCurrency(id)) {
          profile.set({ currency: id });
        }
      }}
    />
  );
}
