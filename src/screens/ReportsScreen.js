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
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getTransactions, getCurrency } from '../storage/storageService';
import { formatAmount } from '../constants/currencies';
import { useCurrency } from '../context/CurrencyContext';

const PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all'
};

const screenWidth = Dimensions.get('window').width;

const EmptyContentMessage = ({ message }) => (
  <View style={styles.emptyContentContainer}>
    <Text style={styles.emptyContentText}>{message}</Text>
  </View>
);

const ReportsScreen = () => {
  const { selectedCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState(PERIODS.MONTH);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );
  
  useEffect(() => {
    if (transactions.length > 0) {
      processData();
    }
  }, [transactions, period]);
  
  useEffect(() => {
    loadCurrency();
  }, []);
  
  const loadTransactions = async () => {
    setIsLoading(true);
    
    try {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions for reports:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadCurrency = async () => {
    const currency = await getCurrency();
    setSelectedCurrency(currency);
  };
  
  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case PERIODS.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case PERIODS.MONTH:
        startDate = startOfMonth(now);
        break;
      case PERIODS.YEAR:
        startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      case PERIODS.ALL:
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };
  
  const processData = () => {
    const filteredTransactions = getFilteredTransactions();
    
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
    const now = new Date();
    let startDate;
    let dateFormat;
    
    switch (period) {
      case PERIODS.WEEK:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        dateFormat = 'EEE'; // Mon, Tue, etc.
        break;
      case PERIODS.MONTH:
        startDate = startOfMonth(now);
        dateFormat = 'd'; // 1, 2, ..., 31
        break;
      case PERIODS.YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        dateFormat = 'MMM'; // Jan, Feb, etc.
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        dateFormat = 'MMM';
    }
    
    // Only create daily data for Week and Month periods
    if (period === PERIODS.WEEK || period === PERIODS.MONTH) {
      const days = eachDayOfInterval({ start: startDate, end: now });
      
      const dailyExpenses = days.map(day => {
        const dayExpenses = filteredTransactions
          .filter(t => t.type === 'expense' && isSameDay(parseISO(t.date), day))
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        return {
          date: day,
          label: format(day, dateFormat),
          expense: dayExpenses,
          income: filteredTransactions
            .filter(t => t.type === 'income' && isSameDay(parseISO(t.date), day))
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        };
      });
      
      setDailyData(dailyExpenses);
    }
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
    const chartData = {
      labels: dailyData.map(d => d.label),
      datasets: [
        {
          data: dailyData.map(d => d.expense),
          color: (opacity = 1) => Colors.expense,
          strokeWidth: 2
        },
        {
          data: dailyData.map(d => d.income),
          color: (opacity = 1) => Colors.income,
          strokeWidth: 2
        }
      ]
    };

    // Calculate chart width based on number of data points
    const chartWidth = Math.max(screenWidth - 40, dailyData.length * 50);

    return (
      <Card style={styles.chartCard}>
        <Text style={styles.cardTitle}>{period === PERIODS.WEEK ? 'Weekly Trend' : period === PERIODS.MONTH ? 'Monthly Trend' : 'Data Trend'}</Text>
        {(period !== PERIODS.WEEK && period !== PERIODS.MONTH) || dailyData.length === 0 ? (
          <EmptyContentMessage message={`No trend data available for the selected period or data type.`} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={chartData}
              width={chartWidth}
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
              renderDotContent={({ x, y, index, indexData, color }) => {
                const datasetType = color === Colors.expense ? 'expense' : 'income';
                const uniqueId = `${datasetType}-${index}-${Math.random()}`;
                return (
                  <View 
                    key={uniqueId}
                    style={[styles.dotLabel, { left: x - 20, top: y - 20 }]}
                  >
                    <Text style={styles.dotLabelText}>${indexData}</Text>
                  </View>
                );
              }}
            />
          </ScrollView>
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
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {Object.values(PERIODS).map(p => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.activePeriodButton,
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text 
              style={[
                styles.periodButtonText,
                period === p && styles.activePeriodText,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
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
            <Text 
              style={[
                styles.summaryAmount, 
                { color: balance >= 0 ? Colors.income : Colors.expense }
              ]}
            >
              {balance >= 0 ? '+' : '-'}{formatAmount(Math.abs(balance), selectedCurrency)}
            </Text>
          </View>
        </View>
      </Card>
      
      {/* Daily Trend */}
      {(period === PERIODS.WEEK || period === PERIODS.MONTH) && renderDailyTrend()}
      
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
  periodSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.m,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.s,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.xs,
    borderRadius: 4,
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activePeriodText: {
    color: 'white',
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
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    ...Typography.h3,
    fontWeight: 'bold',
  },
  chartCard: {
    marginBottom: Spacing.m,
  },
  chartContainer: {
    position: 'relative',
    height: 220,
  },
  chartScrollView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  chartScrollContainer: {
    flexGrow: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  dotLabel: {
    position: 'absolute',
    backgroundColor: Colors.card,
    padding: 4,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dotLabelText: {
    ...Typography.caption,
    color: Colors.text,
  },
  note: {
    ...Typography.caption,
    color: Colors.textSecondary,
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

export default ReportsScreen; 