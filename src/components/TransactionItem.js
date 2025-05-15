import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/theme';
import { format } from 'date-fns';
import { useCurrency } from '../context/CurrencyContext';
import { formatAmount } from '../constants/currencies';

const TransactionItem = ({ 
  transaction, 
  onPress,
  hideDate = false
}) => {
  const { type, amount, category, date, notes } = transaction;
  const { selectedCurrency } = useCurrency();
  const isExpense = type === 'expense';
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress && onPress(transaction)}
    >
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <MaterialCommunityIcons 
          name={category.icon} 
          size={20} 
          color="white" 
        />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category.name}</Text>
        {notes ? <Text style={styles.notes} numberOfLines={1}>{notes}</Text> : null}
        {!hideDate && (
          <Text style={styles.date}>
            {format(new Date(date), 'MMM dd, yyyy')}
          </Text>
        )}
      </View>
      
      <Text style={[
        styles.amount, 
        { color: isExpense ? Colors.expense : Colors.income }
      ]}>
        {isExpense ? '-' : '+'}{formatAmount(Math.abs(amount), selectedCurrency)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  categoryName: {
    ...Typography.body1,
    color: Colors.text,
    marginBottom: 2,
  },
  notes: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  amount: {
    ...Typography.body1,
    fontWeight: 'bold',
  },
});

export default TransactionItem; 