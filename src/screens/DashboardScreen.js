import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getTransactions } from '../storage/storageService';
import { useCurrency } from '../context/CurrencyContext';
import { formatAmount } from '../constants/currencies';

const screenWidth = Dimensions.get('window').width;

const EmptyContentMessage = ({ message }) => (
  <View style={styles.emptyContentContainer}>
    <Text style={styles.emptyContentText}>{message}</Text>
  </View>
);

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { selectedCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const allTransactions = await getTransactions();
          setTransactions(allTransactions);
        } catch (error) {
          console.error('Error loading transactions for dashboard:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [])
  );
  
  useEffect(() => {
    if (transactions.length > 0) {
      processData();
    }
  }, [transactions]);
  
  const processData = () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
    
    // Process expenses by category
    const expenseCategoriesMap = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryId = transaction.category.id;
        if (!expenseCategoriesMap[categoryId]) {
          expenseCategoriesMap[categoryId] = {
            id: categoryId,
            name: transaction.category.name,
            color: transaction.category.color,
            amount: 0,
          };
        }
        expenseCategoriesMap[categoryId].amount += parseFloat(transaction.amount);
      });
    
    const expensesData = Object.values(expenseCategoriesMap)
      .sort((a, b) => b.amount - a.amount);
    
    setExpensesByCategory(expensesData);
      
    // Process income by category
    const incomeCategoriesMap = {};
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        const categoryId = transaction.category.id;
        if (!incomeCategoriesMap[categoryId]) {
          incomeCategoriesMap[categoryId] = {
            id: categoryId,
            name: transaction.category.name,
            color: transaction.category.color,
            amount: 0,
          };
        }
        incomeCategoriesMap[categoryId].amount += parseFloat(transaction.amount);
      });
      
    const incomeData = Object.values(incomeCategoriesMap)
      .sort((a, b) => b.amount - a.amount);
    
    setIncomeByCategory(incomeData);
    
    // Process daily data for line chart
    const days = eachDayOfInterval({ start: startDate, end: now });
    
    const dailyExpenses = days.map(day => {
      const dayExpenses = filteredTransactions
        .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day))
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      return {
        date: day,
        label: format(day, 'EEE'),
        expense: dayExpenses,
        income: filteredTransactions
          .filter(t => t.type === 'income' && isSameDay(parseISO(t.date), day))
          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
      };
    });
    
    setDailyData(dailyExpenses);
  };
  
  // Calculate totals
  const totalExpenses = expensesByCategory.reduce((sum, category) => sum + category.amount, 0);
  const totalIncome = incomeByCategory.reduce((sum, category) => sum + category.amount, 0);
  const balance = totalIncome - totalExpenses;
  
  const renderPieChart = (data, title) => {
    const chartData = data.map(category => ({
      name: category.name,
      amount: category.amount,
      color: category.color,
      legendFontColor: Colors.text,
      legendFontSize: 12
    }));

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>{title}</Text>
        {chartData.length === 0 ? (
          <EmptyContentMessage message={`No data for ${title.toLowerCase()}.`} />
        ) : (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
      </Card>
    );
  };

  const renderDailyTrend = () => {
    // Only take the last 7 days of data
    const lastSevenDays = dailyData.slice(-7);

    const chartData = {
      labels: lastSevenDays.map(d => d.label),
      datasets: [
        {
          data: lastSevenDays.map(d => d.expense),
          color: (opacity = 1) => Colors.expense,
          strokeWidth: 2
        },
        {
          data: lastSevenDays.map(d => d.income),
          color: (opacity = 1) => Colors.income,
          strokeWidth: 2
        }
      ]
    };

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Weekly Trend</Text>
        {dailyData.length === 0 ? (
          <EmptyContentMessage message="No transaction data for the weekly trend." />
        ) : (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: Colors.card,
              backgroundGradientFrom: Colors.card,
              backgroundGradientTo: Colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2"
              }
            }}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={true}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
          />
        )}
      </Card>
    );
  };

  const renderRecentTransactions = () => {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <EmptyContentMessage message="No recent transactions to show." />
        ) : (
          recentTransactions.map((transaction, index) => (
            <TouchableOpacity
              key={transaction.id || index}
              style={styles.transactionItem}
              onPress={() => navigation.navigate('TransactionDetail', { transaction })}
            >
              <View style={styles.transactionInfo}>
                <View style={styles.mainInfo}>
                  <Text style={styles.categoryName}>{transaction.category.name}</Text>
                  <Text 
                    style={[
                      styles.amount,
                      { color: transaction.type === 'income' ? Colors.income : Colors.expense }
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatAmount(Math.abs(transaction.amount), selectedCurrency)}
                  </Text>
                </View>
                <View style={styles.secondaryInfo}>
                  <Text style={styles.date}>{format(new Date(transaction.date), 'MMM dd, yyyy')}</Text>
                  {transaction.notes ? <Text style={styles.note}>{transaction.notes}</Text> : null}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>
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
    <ScrollView style={styles.container}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Monthly Summary</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.income }]}>
              {formatAmount(totalIncome, selectedCurrency)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: Colors.expense }]}>
              {formatAmount(totalExpenses, selectedCurrency)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <View style={styles.balanceDisplayContainer}> 
              
              <Text 
                style={[
                  styles.summaryAmount,
                  { color: balance >= 0 ? Colors.income : Colors.expense }
                ]}
              >
                {formatAmount(Math.abs(balance), selectedCurrency)}
              </Text>
              <MaterialCommunityIcons
                name={balance >= 0 ? "arrow-up-thick" : "arrow-down-thick"}
                size={styles.summaryAmount.fontSize || 22}
                color={balance >= 0 ? Colors.income : Colors.expense}
                style={styles.balanceIcon}
              />
            </View>
          </View>
        </View>
      </Card>
      
      {/* Daily Trend */}
      {renderDailyTrend()}
      
      {/* Recent Transactions */}
      {renderRecentTransactions()}
      
      {/* Expense Categories */}
      {renderPieChart(expensesByCategory, 'Expense Breakdown')}
      
      {/* Income Categories */}
      {renderPieChart(incomeByCategory, 'Income Sources')}
      
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  summaryCard: {
    marginBottom: Spacing.m,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.m,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryAmount: {
    ...Typography.h4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIcon: {
    marginLeft: Spacing.xs,
  },
  chartCard: {
    marginBottom: Spacing.m,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  transactionItem: {
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
  emptyContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.l,
  },
  emptyContentText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
});

export default DashboardScreen; 