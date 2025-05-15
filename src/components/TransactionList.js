import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useCurrency } from '../context/CurrencyContext';
import { formatAmount } from '../constants/currencies';
import { format } from 'date-fns';

const TransactionList = ({ transactions, onPress }) => {
  const { selectedCurrency } = useCurrency();

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => onPress(item)}
    >
      <View style={styles.transactionInfo}>
        <View style={styles.mainInfo}>
          <Text style={styles.categoryName}>{item.category.name}</Text>
          <Text 
            style={[
              styles.amount,
              { color: item.type === 'income' ? Colors.income : Colors.expense }
            ]}
          >
            {item.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(parseFloat(item.amount)), selectedCurrency)}
          </Text>
        </View>
        <View style={styles.secondaryInfo}>
          <Text style={styles.date}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
          {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {transactions.map((item, index) => (
        <View key={item.id || index}>
          {renderTransaction({ item })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  transactionInfo: {
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  secondaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    ...Typography.body1,
    color: Colors.text,
    flex: 1,
  },
  amount: {
    ...Typography.body1,
    fontWeight: 'bold',
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  note: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.s,
    flex: 1,
    textAlign: 'right',
  },
});

export default TransactionList; 