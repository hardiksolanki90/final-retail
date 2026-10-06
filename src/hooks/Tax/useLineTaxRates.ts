import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { resolveTaxRates, type ItemTaxRates } from '../../api/TaxResolveApi';
import { useAuth } from '../../context/AuthContext';
import { computeLine, lineTaxes, type LineInput, type LineRates } from '../../utils/documentMath';
import { roundMoney } from '../../utils/money';

/**
 * Tax rates for the items on a document form: the country's tax engine (India
 * CGST/SGST/IGST and Canada GST/HST/PST by the customer's state/province), else
 * the organisation's tax-table rate, else the item's own rate (resolved
 * server-side). Amounts are computed locally with utils/documentMath; the
 * server recomputes on save.
 */
export function useLineTaxRates(itemIds: ReadonlyArray<string | undefined | null>, customerId?: string | null) {
    const configTax = useAuth().tax;
    const key = Array.from(new Set(itemIds.filter((id): id is string => Boolean(id))))
        .sort()
        .join(',');
    const ids = useMemo(() => (key ? key.split(',') : []), [key]);

    const { data } = useQuery({
        queryKey: ['tax-resolve', key, customerId ?? ''],
        queryFn: () => resolveTaxRates(ids, customerId),
        enabled: ids.length > 0,
        staleTime: 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const items = data?.items;
    const tax = data?.tax ?? configTax;

    return useMemo(() => {
        const byItem = (itemId: string | undefined | null): ItemTaxRates | undefined => (itemId ? items?.[itemId] : undefined);
        const forItem = (itemId: string | undefined | null): LineRates | undefined => {
            const r = byItem(itemId);
            return r ? { rate: r.rate, components: r.components, exciseRate: r.exciseRate } : undefined;
        };
        const selected = ids.map((id) => items?.[id]).filter((r): r is ItemTaxRates => Boolean(r));

        const rated = selected.filter((r) => !r.exempt && r.rate !== null).map((r) => r.rate as number);

        /**
         * One row per part of the main tax (CGST, SGST… with its rate when every line shares it) —
         * only when the tax has several parts, else [] and the single main-tax row is shown.
         */
        const taxRows = (lines: ReadonlyArray<(LineInput & { itemId?: string | null }) | undefined>, digits: number) => {
            const totals = new Map<string, { amount: number; rates: Set<number> }>();
            lines.forEach((line) => {
                const rates = forItem(line?.itemId);
                if (!rates?.components || rates.components.length < 2) return;
                const { net, excise } = computeLine(line, digits, rates);
                lineTaxes(roundMoney(net + excise, digits), rates, digits).forEach((t, i) => {
                    const entry = totals.get(t.code) ?? { amount: 0, rates: new Set<number>() };
                    entry.amount = roundMoney(entry.amount + t.amount, digits);
                    entry.rates.add(rates.components![i].rate);
                    totals.set(t.code, entry);
                });
            });
            return Array.from(totals, ([code, { amount, rates }]) => ({ label: rates.size === 1 ? `${code} ${[...rates][0]}%` : code, value: amount }));
        };

        return {
            /** Rates for one item (for computeLine), undefined until resolved. */
            forItem,
            byItem,
            taxRows,
            taxCode: tax?.code ?? 'Tax',
            taxName: tax?.name ?? 'Tax',
            supported: tax?.supported ?? true,
            country: tax?.country ?? null,
            /** The customer's state/province isn't set or recognised — tax assumes the organisation's own. */
            regionAssumed: Boolean(customerId) && Boolean(data?.tax.regionAssumed),
            /** Any chosen item carries excise — the Excise column/row is shown only then. */
            hasExcise: selected.some((r) => r.exciseRate > 0),
            /** The main tax rate when every taxed line shares one (for the receipt label), else null. */
            uniformRate: rated.length > 0 && rated.every((r) => r === rated[0]) ? rated[0] : null,
            /** Taxable items with no rate from the tax table or the item. */
            missingRate: selected.some((r) => !r.exempt && r.rate === null),
        };
    }, [items, ids, tax, data, customerId]);
}
