import { useState, useRef, useEffect, useMemo } from 'react';
import { PatternFormat } from 'react-number-format';
import { ChevronDown, Search, X } from 'lucide-react';
import { Controller, type RegisterOptions } from 'react-hook-form';
import { useOrganisation } from '../../hooks/Organisation/useOrganisation';
import { useAuth } from '../../context/AuthContext';
import { getStoredOrgCountry } from '../../utils/organisationStorage';

export interface CountryFormatInfo {
  code: string;
  name: string;
  dialCode: string;
  format: string;
  placeholder: string;
  flag: string;
}

export const COUNTRY_PHONE_FORMATS: CountryFormatInfo[] = [
  { code: 'IN', name: 'India', dialCode: '+91', format: '##### #####', placeholder: '98765 43210', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', format: '### ### ####', placeholder: '050 123 4567', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', format: '### ### ####', placeholder: '050 123 4567', flag: '🇸🇦' },
  { code: 'US', name: 'United States', dialCode: '+1', format: '(###) ###-####', placeholder: '(555) 000-0000', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', format: '##### #####', placeholder: '7911 123456', flag: '🇬🇧' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', format: '##### #####', placeholder: '33123 45678', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', dialCode: '+968', format: '##### #####', placeholder: '91234 56789', flag: '🇴🇲' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', format: '##### #####', placeholder: '91234 56789', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', format: '##### #####', placeholder: '31234 56789', flag: '🇧🇭' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', format: '##### #####', placeholder: '81234 56789', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', format: '### ### ####', placeholder: '012 345 6789', flag: '🇲🇾' },
  { code: 'AU', name: 'Australia', dialCode: '+61', format: '#### ### ###', placeholder: '0412 345 678', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', format: '#### ######', placeholder: '0151 123456', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', format: '## ## ## ## ##', placeholder: '06 12 34 56 78', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', dialCode: '+1', format: '(###) ###-####', placeholder: '(555) 000-0000', flag: '🇨🇦' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', format: '### ### ####', placeholder: '912 345 6789', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', format: '### ### ####', placeholder: '081 234 5678', flag: '🇮🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', format: '### #######', placeholder: '300 1234567', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', format: '#### ######', placeholder: '1712 345678', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', format: '### #######', placeholder: '981 2345678', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', format: '### ### ####', placeholder: '071 234 5678', flag: '🇱🇰' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', format: '### ### ####', placeholder: '082 123 4567', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', format: '### ### ####', placeholder: '010 123 4567', flag: '🇪🇬' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', format: '### ### ####', placeholder: '532 123 4567', flag: '🇹🇷' },
];

/**
 * Validates that the phone number contains exactly 10 digits (excluding country dial code).
 */
export function validate10DigitPhone(val?: string, required = false): true | string {
  if (!val || !val.trim()) {
    return required ? 'Phone number is required' : true;
  }
  const dialMatch = val.match(/^\+\d+/);
  let national = val;
  if (dialMatch) {
    national = val.slice(dialMatch[0].length);
  }
  const digits = national.replace(/\D/g, '');
  if (digits.length === 0) {
    return required ? 'Phone number is required' : true;
  }
  if (digits.length !== 10) {
    return 'Phone number must be 10 digits';
  }
  return true;
}

export interface CountryPhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  control?: any;
  rules?: any;
  label?: string;
  required?: boolean;
  colon?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  countryCode?: string; // Optional controlled country code, e.g. "IN" or "AE"
  onCountryChange?: (country: CountryFormatInfo) => void;
}

// Convert 2-letter ISO country code into emoji flag
function getFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function findMatchingCountry(target?: string): CountryFormatInfo | null {
  if (!target) return null;
  const q = target.trim().toLowerCase();
  return (
    COUNTRY_PHONE_FORMATS.find(
      (c) =>
        c.code.toLowerCase() === q ||
        c.name.toLowerCase() === q ||
        (q === 'uae' && c.code === 'AE') ||
        (q === 'ind' && c.code === 'IN') ||
        (q === 'usa' && c.code === 'US') ||
        (q === 'gbr' && c.code === 'GB') ||
        (q === 'sau' && c.code === 'SA')
    ) || null
  );
}

// Helper to extract national subscriber number without country dial code
function getNationalNumber(rawVal: string, dialCode: string): string {
  if (!rawVal) return '';
  let val = rawVal.trim();
  const cleanDial = dialCode.replace(/\D/g, '');
  if (val.startsWith(dialCode)) {
    val = val.slice(dialCode.length).trim();
  } else if (val.startsWith(`+${cleanDial}`)) {
    val = val.slice(cleanDial.length + 1).trim();
  }
  return val.replace(/^[\s\-]+/, '');
}

function BaseCountryPhoneInput({
  value = '',
  onChange,
  label,
  required = false,
  colon = true,
  error,
  placeholder,
  className = '',
  disabled = false,
  countryCode,
  onCountryChange,
}: CountryPhoneInputProps) {
  const { user } = useAuth();
  const { organisation } = useOrganisation();

  // 1. Resolve country selected for the organization
  const orgCountry = useMemo(() => {
    const fromStorage = getStoredOrgCountry();
    if (fromStorage?.code || fromStorage?.name || fromStorage?.dialCode) {
      return fromStorage;
    }
    const org = organisation || user?.organisation;
    const c = org?.country;
    if (c) {
      return {
        code: c.countryCode,
        name: c.name,
        dialCode: c.dialCode ?? undefined,
      };
    }
    return null;
  }, [organisation, user?.organisation]);

  // 2. Find or dynamically build format info for org's country
  const orgCountryFormat = useMemo<CountryFormatInfo | null>(() => {
    if (!orgCountry) return null;
    const targetCode = orgCountry.code?.toLowerCase();
    const targetName = orgCountry.name?.toLowerCase();
    const targetDial = orgCountry.dialCode;

    const matched = COUNTRY_PHONE_FORMATS.find(
      (c) =>
        (targetCode && (c.code.toLowerCase() === targetCode || (targetCode === 'uae' && c.code === 'AE') || (targetCode === 'ind' && c.code === 'IN'))) ||
        (targetName && c.name.toLowerCase() === targetName) ||
        (targetDial && c.dialCode === targetDial)
    );
    if (matched) return matched;

    if (orgCountry.code && orgCountry.name) {
      return {
        code: orgCountry.code.toUpperCase(),
        name: orgCountry.name,
        dialCode: orgCountry.dialCode || '+1',
        format: '### ### ####',
        placeholder: '123 456 7890',
        flag: getFlagEmoji(orgCountry.code),
      };
    }
    return null;
  }, [orgCountry]);

  // 3. Keep all countries with org country positioned prominently at the top
  const allCountries = useMemo<CountryFormatInfo[]>(() => {
    const list = [...COUNTRY_PHONE_FORMATS];
    if (orgCountryFormat) {
      const existingIdx = list.findIndex((c) => c.code.toLowerCase() === orgCountryFormat.code.toLowerCase());
      if (existingIdx >= 0) {
        const [found] = list.splice(existingIdx, 1);
        list.unshift(found);
      } else {
        list.unshift(orgCountryFormat);
      }
    }
    return list;
  }, [orgCountryFormat]);

  // 4. Determine initial country selection: explicit prop > org's selected country > value match > default
  const [selectedCountry, setSelectedCountry] = useState<CountryFormatInfo>(() => {
    if (countryCode) {
      const found = findMatchingCountry(countryCode);
      if (found) return found;
    }
    if (orgCountryFormat) {
      return orgCountryFormat;
    }
    if (value) {
      const matched = COUNTRY_PHONE_FORMATS.find((c) =>
        value.trim().startsWith(c.dialCode)
      );
      if (matched) return matched;
    }
    return COUNTRY_PHONE_FORMATS[0];
  });

  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync if external countryCode changes
  useEffect(() => {
    if (countryCode) {
      const found = findMatchingCountry(countryCode);
      if (found && found.code !== selectedCountry.code) {
        setSelectedCountry(found);
      }
    }
  }, [countryCode, selectedCountry.code]);

  // Sync when orgCountryFormat becomes available (e.g. async fetch) unless user manually selected a different country
  useEffect(() => {
    if (!hasManuallySelected && !countryCode && orgCountryFormat) {
      if (selectedCountry.code !== orgCountryFormat.code) {
        setSelectedCountry(orgCountryFormat);
      }
    }
  }, [orgCountryFormat, hasManuallySelected, countryCode, selectedCountry.code]);

  // Auto-detect country from value if value starts with a known dial code and neither countryCode nor manual select was set
  useEffect(() => {
    if (!countryCode && !hasManuallySelected && value) {
      const matched = allCountries.find((c) =>
        value.trim().startsWith(c.dialCode)
      );
      if (matched && matched.code !== selectedCountry.code) {
        setSelectedCountry(matched);
      }
    }
  }, [countryCode, hasManuallySelected, value, selectedCountry.code, allCountries]);

  // Click outside listener for country dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPickerOpen]);

  useEffect(() => {
    if (isPickerOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isPickerOpen]);

  const handleSelectCountry = (country: CountryFormatInfo) => {
    setHasManuallySelected(true);
    setSelectedCountry(country);
    setIsPickerOpen(false);
    setSearchQuery('');
    onCountryChange?.(country);

    if (value) {
      const nationalNum = getNationalNumber(value, country.dialCode);
      if (nationalNum) {
        onChange?.(`${country.dialCode} ${nationalNum}`);
      } else {
        onChange?.('');
      }
    }
  };

  const displayValue = useMemo(() => {
    return getNationalNumber(value, selectedCountry.dialCode);
  }, [value, selectedCountry.dialCode]);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery, allCountries]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
          {colon ? ':' : ''}
        </label>
      )}

      <div className="relative flex rounded-lg shadow-sm">
        {/* Country Picker Toggle Button */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsPickerOpen((prev) => !prev)}
            className={`
              h-[42px] px-3 flex items-center gap-1.5 border border-r-0 rounded-l-lg
              bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium
              hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors
              ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            `}
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Country Selection Dropdown Popover */}
          {isPickerOpen && (
            <div className="absolute z-50 left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden py-1 text-sm animate-in fade-in zoom-in-95 duration-100">
              {/* Search filter */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-900/60">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-7 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-56 overflow-y-auto py-1">
                {filteredCountries.length === 0 ? (
                  <div className="py-3 px-3 text-center text-xs text-gray-400">
                    No country found
                  </div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountry.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleSelectCountry(c)}
                        className={`
                          w-full px-3 py-1.5 flex items-center justify-between text-left text-xs sm:text-sm transition-colors
                          ${isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="text-xs font-mono text-gray-400 ml-2 shrink-0">
                          {c.dialCode}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* PatternFormat Input from react-number-format */}
        <PatternFormat
          format={selectedCountry.format}
          mask="_"
          allowEmptyFormatting={false}
          value={displayValue}
          disabled={disabled}
          onValueChange={(values) => {
            if (!values.value) {
              onChange?.('');
            } else {
              onChange?.(`${selectedCountry.dialCode} ${values.formattedValue}`);
            }
          }}
          placeholder={placeholder || selectedCountry.placeholder}
          className={`
            min-h-[42px] w-full px-3 py-2 rounded-r-lg border transition-colors
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

/**
 * Reusable Country Phone Input component.
 * Can be used either as:
 * 1. A standalone controlled input with value/onChange.
 * 2. Directly inside a react-hook-form by passing `name` and `control`.
 * Automatically enforces and validates 10 digits for the national number.
 */
export function CountryPhoneInput(props: CountryPhoneInputProps) {
  if (props.control && props.name) {
    const { name, control, rules, required, error, ...rest } = props;
    const combinedRules: RegisterOptions = {
      ...rules,
      validate: (val: any, formValues: any) => {
        const phoneValidation = validate10DigitPhone(val, required);
        if (phoneValidation !== true) return phoneValidation;
        if (typeof rules?.validate === 'function') {
          return rules.validate(val, formValues);
        }
        if (typeof rules?.validate === 'object') {
          for (const key of Object.keys(rules.validate)) {
            const res = (rules.validate as any)[key](val, formValues);
            if (res !== true) return res;
          }
        }
        return true;
      },
    };

    return (
      <Controller
        name={name}
        control={control}
        rules={combinedRules}
        render={({ field, fieldState }) => (
          <BaseCountryPhoneInput
            {...rest}
            required={required}
            value={field.value || ''}
            onChange={field.onChange}
            error={error || fieldState.error?.message}
          />
        )}
      />
    );
  }

  return <BaseCountryPhoneInput {...props} />;
}

export default CountryPhoneInput;
