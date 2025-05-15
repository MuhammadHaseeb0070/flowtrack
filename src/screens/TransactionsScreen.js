import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import TransactionItem from '../components/TransactionItem';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getTransactions, deleteTransaction } from '../storage/storageService';

const TransactionsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income'
  
  useEffect(() => {
    loadTransactions();
    
    // Add listener for when screen comes into focus (for data refresh)
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType, transactions]);
  
  const loadTransactions = async () => {
    setIsLoading(true);
    
    try {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...transactions];
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Apply search filter (search in category name or notes)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.category.name.toLowerCase().includes(query) || 
        (t.notes && t.notes.toLowerCase().includes(query))
      );
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredTransactions(filtered);
  };
  
  const handleDeleteTransaction = (transactionId) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transactionId);
              // Update the local state
              setTransactions(prev => 
                prev.filter(t => t.id !== transactionId)
              );
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        },
      ]
    );
  };
  
  // Group transactions by date
  const groupTransactionsByDate = () => {
    const grouped = {};
    
    filteredTransactions.forEach(transaction => {
      const date = transaction.date.split('T')[0]; // Get YYYY-MM-DD format
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    
    // Convert to array for FlatList
    return Object.entries(grouped).map(([date, transactions]) => ({
      date,
      transactions,
    }));
  };
  
  const renderDateHeader = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const transactionDate = new Date(date);
    
    let dateLabel;
    if (transactionDate.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = format(transactionDate, 'MMMM dd, yyyy');
    }
    
    return (
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
    );
  };
  
  const renderTransactionGroup = ({ item }) => {
    return (
      <View>
        {renderDateHeader(item.date)}
        {item.transactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onPress={() => navigation.navigate('TransactionDetail', { transaction })}
            hideDate={true}
          />
        ))}
      </View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Search and Filter Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={24} 
            color={Colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons 
                name="close" 
                size={20} 
                color={Colors.textSecondary} 
              />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filterType === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'expense' && styles.activeFilterButton,
            ]}
            onPress={() => setFilterType('expense')}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filterType === 'expense' && styles.activeFilterText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'income' && styles.activeFilterButton,
            ]}
            onPress={() => setFilterType('income')}
          >
            <Text 
              style={[
                styles.filterButtonText,
                filterType === 'income' && styles.activeFilterText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={groupTransactionsByDate()}
          renderItem={renderTransactionGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.transactionsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="poll" 
            size={64} 
            color={Colors.textSecondary} 
          />
          <Text style={styles.emptyText}>
            {searchQuery || filterType !== 'all'
              ? 'No transactions match your search'
              : 'No transactions yet'}
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTab')}
          >
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </View>
      )}
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
  searchContainer: {
    padding: Spacing.m,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
  },
  searchInput: {
    flex: 1,
    ...Typography.body1,
    marginLeft: Spacing.s,
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: Spacing.m,
  },
  filterButton: {
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 16,
    marginRight: Spacing.s,
    backgroundColor: Colors.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  transactionsList: {
    paddingBottom: Spacing.xl,
  },
  dateHeader: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  dateText: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginTop: Spacing.m,
    marginBottom: Spacing.l,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.l,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.button,
    color: 'white',
  },
});

export default TransactionsScreen; 