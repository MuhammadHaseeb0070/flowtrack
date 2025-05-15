import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { DefaultCategories } from '../constants/categories';
import { v4 as uuidv4 } from 'uuid';

// Use a simple random string generator as fallback
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Try to use UUID v4, fall back to simple random string if not available
const generateUniqueId = () => {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('UUID generation failed, using fallback:', error);
    return generateId();
  }
};

// Storage Keys
const TRANSACTIONS_KEY = '@flowtrack_transactions';
const CATEGORIES_KEY = '@flowtrack_categories';
const CURRENCY_KEY = '@FlowTrack_currency';

// Transaction Operations
export const saveTransaction = async (transaction) => {
  try {
    // If there's no ID, generate one
    if (!transaction.id) {
      transaction.id = generateUniqueId();
    }
    
    const transactions = await getTransactions();
    const updatedTransactions = [...transactions, transaction];
    
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    return transaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const updateTransaction = async (updatedTransaction) => {
  try {
    const transactions = await getTransactions();
    const index = transactions.findIndex(t => t.id === updatedTransaction.id);
    
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    transactions[index] = updatedTransaction;
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.filter(
      transaction => transaction.id !== transactionId
    );
    
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Category Operations
export const getCategories = async () => {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    const categories = data ? JSON.parse(data) : null;
    
    // If no categories exist yet, use the default categories
    if (!categories) {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DefaultCategories));
      return DefaultCategories;
    }
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return DefaultCategories;
  }
};

export const saveCategory = async (category) => {
  try {
    // If there's no ID, generate one
    if (!category.id) {
      category.id = generateUniqueId();
    }
    
    const categories = await getCategories();
    const updatedCategories = [...categories, category];
    
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
    return category;
  } catch (error) {
    console.error('Error saving category:', error);
    throw error;
  }
};

export const updateCategory = async (updatedCategory) => {
  try {
    const categories = await getCategories();
    const updatedCategories = categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    );
    
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
    return updatedCategory;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const categories = await getCategories();
    const updatedCategories = categories.filter(
      category => category.id !== categoryId
    );
    
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Data Export/Import
export const exportData = async () => {
  try {
    const transactions = await getTransactions();
    const categories = await getCategories();
    
    return JSON.stringify({
      transactions,
      categories,
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.transactions) {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions));
    }
    
    if (data.categories) {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Clear all data
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    await AsyncStorage.removeItem(CATEGORIES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
};

export const getCurrency = async () => {
  try {
    const currency = await AsyncStorage.getItem(CURRENCY_KEY);
    return currency || DEFAULT_CURRENCY;
  } catch (error) {
    console.error('Error getting currency:', error);
    return DEFAULT_CURRENCY;
  }
};

export const setCurrency = async (currencyCode) => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY, currencyCode);
  } catch (error) {
    console.error('Error setting currency:', error);
  }
}; 