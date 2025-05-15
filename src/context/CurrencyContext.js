import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrency } from '../storage/storageService';
import { DEFAULT_CURRENCY } from '../constants/currencies';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    const currency = await getCurrency();
    setSelectedCurrency(currency);
  };

  const updateCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode);
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 