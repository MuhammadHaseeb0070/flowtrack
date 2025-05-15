export const CURRENCIES = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'before', // symbol position: 'before' or 'after'
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'after',
    decimalPlaces: 2,
    decimalSeparator: ',',
    thousandsSeparator: '.'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    position: 'before',
    decimalPlaces: 0,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  PKR: {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  VUV: {
    code: 'VUV',
    name: 'Vanuatu Vatu',
    symbol: 'Vt',
    position: 'before',
    decimalPlaces: 0,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  YER: {
    code: 'YER',
    name: 'Yemeni Rial',
    symbol: '﷼',
    position: 'before',
    decimalPlaces: 0,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  ZMW: {
    code: 'ZMW',
    name: 'Zambian Kwacha',
    symbol: 'ZK',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  ZWL: {
    code: 'ZWL',
    name: 'Zimbabwean Dollar',
    symbol: 'Z$',
    position: 'before',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ','
  }
};

export const DEFAULT_CURRENCY = 'PKR';

export const formatAmount = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = CURRENCIES[currencyCode];
  if (!currency) {
    // Basic fallback if currency code is not found
    return amount.toString();
  }

  let numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return amount.toString(); // Or handle error appropriately
  }

  let valueToFormat;
  if (currency.decimalPlaces > 0 && numAmount % 1 === 0) {
    // It's a whole number, and the currency supports decimals
    valueToFormat = numAmount.toFixed(0);
  } else {
    valueToFormat = numAmount.toFixed(currency.decimalPlaces);
  }

  const parts = valueToFormat.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
  const formattedAmount = parts.join(currency.decimalSeparator);

  return currency.position === 'before'
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount}${currency.symbol}`;
}; 