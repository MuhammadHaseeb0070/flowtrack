import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Share,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import { Colors, Typography, Spacing } from '../constants/theme';
import { exportData, clearAllData, getCurrency, setCurrency } from '../storage/storageService';
import { DefaultCategories } from '../constants/categories';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENCIES, DEFAULT_CURRENCY, formatAmount } from '../constants/currencies';
import { useNavigation } from '@react-navigation/native';
import { useCurrency } from '../context/CurrencyContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { selectedCurrency, updateCurrency } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  
  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    const currency = await getCurrency();
    updateCurrency(currency);
  };

  const handleCurrencySelect = async (currencyCode) => {
    await setCurrency(currencyCode);
    updateCurrency(currencyCode);
    setShowCurrencyModal(false);
  };
  
  const handleManageCategories = () => {
    navigation.navigate('CategoryManagement');
  };
  
  const handleExportData = () => {
    setShowExportOptions(true);
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            
            try {
              await clearAllData();
              // Reset to default categories
              await AsyncStorage.setItem('@flowtrack_categories', JSON.stringify(DefaultCategories));
              Alert.alert('Success', 'All data has been cleared');
              // Force a reload of the app
              navigation.reset({
                index: 0,
                routes: [{ name: 'DashboardTab' }],
              });
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setIsClearing(false);
            }
          }
        },
      ]
    );
  };
  
  const renderSettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>
        <MaterialCommunityIcons 
          name={icon} 
          size={24} 
          color={Colors.primary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ? (
        rightElement
      ) : (
        onPress && (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={Colors.textSecondary} 
          />
        )
      )}
    </TouchableOpacity>
  );
  
  const renderExportOptions = () => {
    const options = [
      {
        title: 'JSON Data',
        icon: 'code-json',
        onPress: async () => {
          setShowExportOptions(false);
          setIsExporting(true);
          try {
            const jsonData = await exportData();
            await Share.share({
              message: jsonData,
              title: 'FlowTrack Data Export',
            });
          } catch (error) {
            console.error('Error exporting JSON:', error);
            Alert.alert('Export Failed', 'There was an error exporting your data.');
          } finally {
            setIsExporting(false);
          }
        }
      },
      {
        title: 'Monthly Summary Report',
        icon: 'file-document-outline',
        onPress: async () => {
          setShowExportOptions(false);
          setIsExporting(true);
          try {
            const data = await exportData();
            const transactions = JSON.parse(data).transactions;
            
            let report = 'FlowTrack Monthly Summary Report\n';
            report += 'Generated on: ' + new Date().toLocaleDateString() + '\n\n';
            
            // Group transactions by month
            const monthlyData = {};
            transactions.forEach(transaction => {
              const date = new Date(transaction.date);
              const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              
              if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = {
                  income: 0,
                  expenses: 0,
                  categories: {}
                };
              }
              
              if (transaction.type === 'income') {
                monthlyData[monthYear].income += parseFloat(transaction.amount);
              } else {
                monthlyData[monthYear].expenses += parseFloat(transaction.amount);
              }

              // Track category totals
              const categoryKey = transaction.category.name;
              if (!monthlyData[monthYear].categories[categoryKey]) {
                monthlyData[monthYear].categories[categoryKey] = {
                  amount: 0,
                  type: transaction.type
                };
              }
              monthlyData[monthYear].categories[categoryKey].amount += parseFloat(transaction.amount);
            });
            
            // Generate report content
            Object.entries(monthlyData).forEach(([month, data]) => {
              report += `\n=== ${month} ===\n`;
              report += `Total Income: $${data.income.toFixed(2)}\n`;
              report += `Total Expenses: $${data.expenses.toFixed(2)}\n`;
              const balance = data.income - data.expenses;
              report += `Net: ${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}\n\n`;
              
              // Category breakdown
              report += 'Category Breakdown:\n';
              Object.entries(data.categories)
                .sort((a, b) => b[1].amount - a[1].amount)
                .forEach(([category, info]) => {
                  report += `${category}: $${info.amount.toFixed(2)} (${info.type})\n`;
                });
              report += '\n';
            });
            
            report += '\n--- Generated by FlowTrack App ---\n';
            
            await Share.share({
              message: report,
              title: 'FlowTrack Monthly Summary',
            });
          } catch (error) {
            console.error('Error exporting report:', error);
            Alert.alert('Export Failed', 'There was an error generating the report.');
          } finally {
            setIsExporting(false);
          }
        }
      },
      {
        title: 'Detailed Transaction List',
        icon: 'format-list-text',
        onPress: async () => {
          setShowExportOptions(false);
          setIsExporting(true);
          try {
            const data = await exportData();
            const transactions = JSON.parse(data).transactions;
            
            let history = 'FlowTrack Detailed Transaction List\n';
            history += 'Generated on: ' + new Date().toLocaleDateString() + '\n\n';
            
            // Group by date
            const groupedTransactions = {};
            transactions.forEach(t => {
              const date = new Date(t.date).toLocaleDateString();
              if (!groupedTransactions[date]) {
                groupedTransactions[date] = [];
              }
              groupedTransactions[date].push(t);
            });
            
            // Sort dates in reverse chronological order
            Object.keys(groupedTransactions)
              .sort((a, b) => new Date(b) - new Date(a))
              .forEach(date => {
                history += `Date: ${date}\n`;
                history += '----------------------------------------\n';
                
                groupedTransactions[date]
                  .sort((a, b) => {
                    // Sort by type (income first) then by amount
                    if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
                    return parseFloat(b.amount) - parseFloat(a.amount);
                  })
                  .forEach(t => {
                    history += `${t.type === 'income' ? 'Income' : 'Expense'}: $${t.amount}\n`;
                    history += `Category: ${t.category.name}\n`;
                    if (t.note) history += `Note: ${t.note}\n`;
                    history += '----------------------------------------\n';
                  });
                
                history += '\n';
              });
            
            history += '\n--- Generated by FlowTrack App ---\n';
            
            await Share.share({
              message: history,
              title: 'FlowTrack Transactions',
            });
          } catch (error) {
            console.error('Error exporting history:', error);
            Alert.alert('Export Failed', 'There was an error generating the transaction list.');
          } finally {
            setIsExporting(false);
          }
        }
      }
    ];

    return (
      <Modal
        visible={showExportOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExportOptions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowExportOptions(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Export Data</Text>
                  <TouchableOpacity 
                    onPress={() => setShowExportOptions(false)}
                    style={styles.closeButton}
                  >
                    <MaterialCommunityIcons 
                      name="close" 
                      size={24} 
                      color={Colors.text} 
                    />
                  </TouchableOpacity>
                </View>
                
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exportOption}
                    onPress={option.onPress}
                  >
                    <MaterialCommunityIcons 
                      name={option.icon} 
                      size={24} 
                      color={Colors.primary} 
                    />
                    <Text style={styles.exportOptionText}>{option.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Currency Selection */}
      <Card style={styles.section}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowCurrencyModal(true)}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Currency</Text>
            <Text style={styles.settingValue}>
              {CURRENCIES[selectedCurrency].name} ({CURRENCIES[selectedCurrency].symbol})
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </Card>
      
      {/* Categories Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        
        {renderSettingItem({
          icon: 'shape',
          title: 'Manage Categories',
          subtitle: 'Add, edit or delete expense and income categories',
          onPress: handleManageCategories,
        })}
      </Card>
      
      {/* Data Management Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {renderSettingItem({
          icon: 'database-export',
          title: 'Export Data',
          subtitle: 'Export all your transaction data',
          rightElement: isExporting ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : null,
          onPress: handleExportData,
        })}
        
        {renderSettingItem({
          icon: 'delete-forever',
          title: 'Clear All Data',
          subtitle: 'Delete all transactions and reset the app',
          rightElement: isClearing ? (
            <ActivityIndicator size="small" color={Colors.expense} />
          ) : null,
          onPress: handleClearData,
        })}
      </Card>
      
      {/* About Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        {renderSettingItem({
          icon: 'information',
          title: 'App Version',
          subtitle: '1.0.0',
        })}
        
        {renderSettingItem({
          icon: 'shield',
          title: 'Privacy Policy',
          onPress: () => {
            // Open privacy policy
          },
        })}
        
        {renderSettingItem({
          icon: 'help-circle',
          title: 'Help & Support',
          onPress: () => {
            // Open help section
          },
        })}
      </Card>
      
      {renderExportOptions()}
      
      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity 
                onPress={() => setShowCurrencyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.currencyList}>
              {Object.values(CURRENCIES).map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyItem,
                    selectedCurrency === currency.code && styles.selectedCurrencyItem
                  ]}
                  onPress={() => handleCurrencySelect(currency.code)}
                >
                  <Text style={styles.currencyName}>{currency.name}</Text>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.m,
  },
  section: {
    marginBottom: Spacing.m,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.m,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`, // 15% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body1,
    color: Colors.text,
  },
  settingSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.m,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
    paddingBottom: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  exportOptionText: {
    ...Typography.body1,
    color: Colors.text,
    marginLeft: Spacing.m,
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedCurrencyItem: {
    backgroundColor: Colors.primary + '20',
  },
  currencyName: {
    ...Typography.body,
    color: Colors.text,
  },
  currencySymbol: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

export default SettingsScreen; 