import { useEffect } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Select, type SelectOption } from '../../../components/ui/Select';
import { getItemOptions } from '../../../api/ItemApi';
import { useInfiniteSelect } from '../../../hooks/useInfiniteSelect';

interface BodyProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: string;
  remember: (options: SelectOption[]) => void;
}

function LineItemSelectBody({ name, value, onChange, onBlur, disabled, error, remember }: BodyProps) {
  const select = useInfiniteSelect({
    enabled: !disabled,
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getItemOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (option: SelectOption) => option,
  });

  useEffect(() => remember(select.options), [select.options, remember]);

  return (
    <Select
      name={name}
      value={value}
      onChange={(e) => onChange(String(e.target.value))}
      onBlur={onBlur}
      options={select.options}
      isLoading={select.isLoading}
      isLoadingMore={select.isLoadingMore}
      hasMore={select.hasMore}
      onLoadMore={select.onLoadMore}
      onSearchChange={select.onSearchChange}
      placeholder="Select Item"
      searchPlaceholder="Search by code or name…"
      disabled={disabled}
      error={error}
    />
  );
}

/** A document line's item dropdown: searches the server and loads more as you scroll. */
export function LineItemSelect<T extends FieldValues>({ control, name, disabled, remember }: { control: Control<T>; name: Path<T>; disabled?: boolean; remember: (options: SelectOption[]) => void }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <LineItemSelectBody
          name={field.name}
          value={String(field.value ?? '')}
          onChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          error={fieldState.error?.message}
          remember={remember}
        />
      )}
    />
  );
}
