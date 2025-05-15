import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import CategoryIcon from '../components/CategoryIcon';
import { Colors, Typography, Spacing } from '../constants/theme';
import { saveTransaction, getCategories } from '../storage/storageService';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currencies';

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedCurrency } = useCurrency();
  const [type, setType] = useState(route.params?.type || 'expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadCategories();
  }, [type]);
  
  const loadCategories = async () => {
    try {
      const allCategories = await getCategories();
      const filteredCategories = allCategories.filter(
        category => category.type === type
      );
      setCategories(filteredCategories);
      
      // Reset selected category when changing type
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };
  
  const handleSave = async () => {
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const transaction = {
        type,
        amount: parseFloat(amount),
        category: selectedCategory,
        date: date.toISOString(),
        notes,
      };
      
      await saveTransaction(transaction);
      
      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setDate(new Date());
      setNotes('');
      
      // Show success message
      Alert.alert(
        'Success', 
        'Transaction saved successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('DashboardTab') }]
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };
  
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const toggleType = () => {
    setType(type === 'expense' ? 'income' : 'expense');
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        {/* Transaction Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.activeTypeButton,
              type === 'expense' && { backgroundColor: Colors.expense },
            ]}
            onPress={() => setType('expense')}
          >
            <MaterialCommunityIcons 
              name="arrow-down-circle" 
              size={24} 
              color={type === 'expense' ? 'white' : Colors.expense} 
            />
            <Text 
              style={[
                styles.typeText,
                type === 'expense' && styles.activeTypeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.activeTypeButton,
              type === 'income' && { backgroundColor: Colors.income },
            ]}
            onPress={() => setType('income')}
          >
            <MaterialCommunityIcons 
              name="arrow-up-circle" 
              size={24} 
              color={type === 'income' ? 'white' : Colors.income} 
            />
            <Text 
              style={[
                styles.typeText,
                type === 'income' && styles.activeTypeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>
            {CURRENCIES[selectedCurrency]?.symbol || CURRENCIES[DEFAULT_CURRENCY]?.symbol || '$'} 
          </Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        
        {/* Category Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory?.id === category.id && styles.selectedCategoryItem,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <CategoryIcon
                  icon={category.icon}
                  color={category.color}
                  size="medium"
                />
                <Text 
                  style={[
                    styles.categoryName,
                    selectedCategory?.id === category.id && styles.selectedCategoryName,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Date Picker */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons 
              name="calendar" 
              size={24} 
              color={Colors.primary} 
            />
            <Text style={styles.dateText}>
              {format(date, 'MMMM dd, yyyy')}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        
        {/* Notes Input */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes here"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>
        
        {/* Save Button */}
        <Button
          title="Save Transaction"
          onPress={handleSave}
          type={type === 'income' ? 'success' : 'danger'}
          loading={isLoading}
          style={styles.saveButton}
        />
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.m,
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: Spacing.l,
    marginBottom: Spacing.xl,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.m,
    borderRadius: 8,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.card,
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
  activeTypeButton: {
    borderWidth: 0,
  },
  typeText: {
    ...Typography.body1,
    marginLeft: Spacing.s,
    fontWeight: '500',
  },
  activeTypeText: {
    color: 'white',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  currencySymbol: {
    ...Typography.h1,
    fontSize: 36,
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  amountInput: {
    ...Typography.h1,
    fontSize: 40,
    color: Colors.text,
    textAlign: 'center',
    minWidth: 150,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.m,
    color: Colors.text,
  },
  categoriesContainer: {
    paddingBottom: Spacing.s,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: Spacing.l,
    width: 70,
  },
  selectedCategoryItem: {
    backgroundColor: Colors.primaryLight + '20', // 20% opacity
    borderRadius: 8,
    padding: Spacing.xs,
  },
  categoryName: {
    ...Typography.caption,
    marginTop: Spacing.s,
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: Colors.primary,
    fontWeight: '500',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  dateText: {
    ...Typography.body1,
    marginLeft: Spacing.m,
    color: Colors.text,
  },
  notesInput: {
    backgroundColor: Colors.card,
    padding: Spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Typography.body1,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: Spacing.m,
  },
});

export default AddTransactionScreen; 