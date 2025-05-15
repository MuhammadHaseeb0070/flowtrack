import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Colors, Typography, Spacing } from '../constants/theme';
import { deleteTransaction } from '../storage/storageService';
import { useCurrency } from '../context/CurrencyContext';
import { formatAmount } from '../constants/currencies';
import Card from '../components/Card';

const TransactionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedCurrency } = useCurrency();
  const { transaction } = route.params;

  const handleDelete = async () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditTransaction', { transaction });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text 
          style={[
            styles.amount,
            { color: transaction.type === 'income' ? Colors.income : Colors.expense }
          ]}
        >
          {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount), selectedCurrency)}
        </Text>
      </Card>

      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{transaction.category.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {format(new Date(transaction.date), 'MMMM dd, yyyy')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text 
            style={[
              styles.detailValue,
              { color: transaction.type === 'income' ? Colors.income : Colors.expense }
            ]}
          >
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </Text>
        </View>

        {transaction.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailValue}>{transaction.notes}</Text>
          </View>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <MaterialCommunityIcons name="pencil" size={24} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="delete" size={24} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.m,
  },
  amountCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.m,
  },
  amountLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.s,
  },
  amount: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: 'bold',
  },
  detailsCard: {
    marginBottom: Spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailLabel: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.body1,
    color: Colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.m,
  },
  buttonContainer: {
    gap: Spacing.m,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.m,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: Colors.primaryLight + '20',
  },
  deleteButton: {
    backgroundColor: Colors.error + '10',
  },
  editButtonText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: Spacing.s,
  },
  deleteButtonText: {
    ...Typography.button,
    color: Colors.error,
    marginLeft: Spacing.s,
  },
});

export default TransactionDetailScreen; 