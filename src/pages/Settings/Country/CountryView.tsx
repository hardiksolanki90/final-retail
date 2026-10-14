import { Globe, SquarePen } from 'lucide-react';
import { RecordViewDrawer } from '../../shared/RecordView/RecordViewDrawer';
import { InfoSection } from '../../shared/RecordView/InfoSection';
import { CountryMasterLabel } from '../../../components/shared/CountryMasterSelect';
import { getCountryList } from '../../../api/CountryApi';

const fetchCountries = async (page: number, search: string) => {
  const res = await getCountryList(page, 20, search || undefined);
  return { items: res.data, hasMore: res.meta.has_more_pages };
};

export function CountryView({ isOpen, onClose, data, onSelect, onEdit }: any) {
  return (
    <RecordViewDrawer
      isOpen={isOpen && Boolean(data)}
      onClose={onClose}
      title={data?.name || 'Country Details'}
      rail={{
        queryKey: 'country-settings',
        placeholder: 'Search countries',
        fetchPage: fetchCountries,
        toCard: (c: any) => ({
          key: c.uuid ?? String(c.id),
          title: c.name,
          subtitle: c.countryCode,
          amount: null,
        }),
        selectedKey: data?.uuid ?? String(data?.id),
        onSelect: (c: any) => onSelect(c),
      }}
      menu={onEdit ? [{ label: 'Edit', icon: SquarePen, onClick: onEdit }] : []}
      tabs={[
        {
          key: 'details',
          label: 'Country Details',
          icon: Globe,
          content: (
            <div className="mt-4 space-y-4">
              <InfoSection 
                title="General Information" 
                rows={[
                  { label: 'Name', value: data ? <CountryMasterLabel value={data.countryMasterId} name={data.name} /> : '—' },
                  { label: 'Code', value: data?.countryCode || '—' },
                  { label: 'Currency', value: data?.currencyCode || data?.currency || '—' },
                  { label: 'Phone Code', value: data?.dialCode || '—' },
                ]} 
              />
            </div>
          )
        }
      ]}
    />
  );
}
