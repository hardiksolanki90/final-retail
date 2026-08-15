import {
  ChevronDown,
  Search,
} from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import { getCountryCallingCode } from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'

interface PhoneInput2Props {
  value?: string
  onChange: (value: string | undefined) => void
  onBlur?: any
  onInput?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  name?: string
  id?: string
}

const PhoneInput2 = ({
  value,
  onChange,
  onBlur,
  onInput,
  placeholder = 'Enter phone number',
  disabled = false,
  error = false,
  className = '',
  name,
  id,
}: PhoneInput2Props) => {
  const [transformedValue, setTransformedValue] = useState('')

  function extractNumbers(input: string) {
    return input.replace(/\D/g, '')
  }

  function getCleanPhone(value: string) {
    let cleanPhone = extractNumbers(value)
    if (cleanPhone.startsWith('1')) {
      cleanPhone = cleanPhone.slice(1)
      return `+1${cleanPhone}`
    }

    if (!cleanPhone.startsWith('1')) {
      return `+1${cleanPhone}`
    }

    return cleanPhone
  }

  useEffect(() => {
    if (value) {
      setTransformedValue(getCleanPhone(value))
    }
  }, [value])

  const handlePhoneChange = (phoneValue: string | undefined) => {
    // onChange: keep the full value with country code
    onChange(phoneValue)

    // onInput: provide clean phone number without country code
    if (onInput && phoneValue) {
      // Extract the national number (without country code)
      try {
        const phoneNumber =
          require('libphonenumber-js').parsePhoneNumber(phoneValue)
        if (phoneNumber) {
          onInput(phoneNumber.nationalNumber)
        } else {
          onInput(phoneValue.replace(/\D/g, ''))
        }
      } catch {
        // Fallback: remove non-digits
        onInput(phoneValue.replace(/\D/g, ''))
      }
    }
  }

  // Custom country select component with search
  const CountrySelect = ({ value, onChange, options }: any) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredOptions = options.filter((option: any) => {
      if (!option || !option.label || !option.value) return false
      const countryName = option.label.toLowerCase()
      const countryCode = option.value.toLowerCase()
      const searchLower = search.toLowerCase()
      return (
        countryName.includes(searchLower) || countryCode.includes(searchLower)
      )
    })

    // Prioritize India, US, Canada at the top
    const prioritizedOptions = filteredOptions.sort((a: any, b: any) => {
      const priority = { IN: 0 }
      const aPriority = priority[a.value as keyof typeof priority] ?? 999
      const bPriority = priority[b.value as keyof typeof priority] ?? 999

      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }

      return a.label.localeCompare(b.label)
    })

    const selectedOption = options.find((option: any) => option.value === value)

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'block w-full px-3 py-2 rounded-lg transition-colors',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'dark:disabled:bg-gray-900 dark:disabled:text-gray-500',
            'flex items-center gap-2',
            error
              ? ''
              : '',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {selectedOption && (
            <>
              <img
                src={`https://flagcdn.com/24x18/${
                  selectedOption.value?.toLowerCase() || 'us'
                }.png`}
                alt={`${selectedOption.label} flag`}
                className="h-4 w-6 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=`
                }}
              />
              <span className="text-sm font-medium dark:text-white">
                +
                {selectedOption.value
                  ? getCountryCallingCode(selectedOption.value)
                  : '1'}
              </span>
            </>
          )}
          <ChevronDown
            className={clsx(
              'h-4 w-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-80 overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-300 dark:border-gray-600">
            {/* Search */}
            <div className="border-b border-gray-200 p-3 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-2 pl-10 pr-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="max-h-48 overflow-y-auto">
              {prioritizedOptions.length > 0 ? (
                prioritizedOptions.map((option: any) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={`https://flagcdn.com/24x18/${option?.value?.toLowerCase()}.png`}
                      alt={`${option.label} flag`}
                      className="h-4 w-6 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo=`
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {option.label || ''}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      +{option.value ? getCountryCallingCode(option.value) : ''}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setSearch('')
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={clsx('relative', className)}>
      <PhoneInput
        value={transformedValue}
        placeholder={placeholder}
        onChange={(value) => {
          onChange(value)
        }}
        onBlur={onBlur}
        defaultCountry="IN"
        disabled={disabled}
        countrySelectComponent={CountrySelect}
        countryCallingCodeEditable={false}
        international={false}
        numberInputProps={{
          id,
          name,
          className: clsx(
            'flex-1 px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0 border-0 rounded-r-lg',
            disabled && 'opacity-50 cursor-not-allowed'
          ),
        }}
        className={clsx(
          'react-phone-number-input flex rounded-lg border transition-colors',
          error
            ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500'
            : 'border-gray-300 dark:border-gray-600 focus-within:ring-primary-500 focus-within:border-primary-500',
          'focus-within:ring-2'
        )}
        maxLength={14}
      />

      <style jsx global>{`
        .react-phone-number-input {
          display: flex;
          align-items: stretch;
        }

        .react-phone-number-input__input {
          flex: 1;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 0;
        }

        .react-phone-number-input__country {
          margin-right: 0;
        }

        .react-phone-number-input__country-select {
          border-radius: 0.5rem 0 0 0.5rem;
          border-right: 0;
        }
      `}</style>
    </div>
  )
}

export default PhoneInput2