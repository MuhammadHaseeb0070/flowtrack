import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getTransactions } from '../storage/storageService';
import { useCurrency } from '../context/CurrencyContext';
import { formatAmount } from '../constants/currencies';
import { format } from 'date-fns';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { selectedCurrency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    
    return unsubscribe;
  }, [navigation, selectedCurrency]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const allTransactions = await getTransactions();
      // Sort transactions by date, most recent first
      const sortedTransactions = allTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
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
            {item.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(item.amount), selectedCurrency)}
          </Text>
        </View>
        <View style={styles.secondaryInfo}>
          <Text style={styles.date}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
          {item.notes ? <Text style={styles.note}>{item.notes}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        extraData={selectedCurrency}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.m,
  },
  transactionItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: Spacing.m,
    padding: Spacing.m,
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

export default TransactionHistoryScreen; 