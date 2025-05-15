import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CategoryIcon from '../components/CategoryIcon';
import Button from '../components/Button';
import { Colors, Typography, Spacing } from '../constants/theme';
import { getCategories, saveCategory, updateCategory, deleteCategory } from '../storage/storageService';

// Icon options for categories
const ICONS = [
  'food', 'cart', 'shopping', 'cash', 'credit-card', 'car', 'home', 
  'lightbulb-outline', 'phone', 'medical-bag', 'school', 'briefcase', 
  'gift-outline', 'book', 'music', 'movie', 'gamepad-variant', 'dumbbell',
  'airplane', 'bus', 'train', 'wallet', 'cash-multiple', 'chart-line'
];

// Color options for categories
const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', 
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'
];

const CategoryManagementScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryType, setCategoryType] = useState('expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    setIsLoading(true);
    
    try {
      const allCategories = await getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredCategories = categories
    .filter(category => category.type === categoryType)
    .sort((a, b) => {
      // If either category is "Other", it should go last
      if (a.name === 'Other') return 1;
      if (b.name === 'Other') return -1;
      // Otherwise sort alphabetically
      return a.name.localeCompare(b.name);
    });
  
  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setSelectedIcon(ICONS[0]);
    setSelectedColor(COLORS[0]);
    setModalVisible(true);
  };
  
  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setModalVisible(true);
  };
  
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }
    
    try {
      if (editingCategory) {
        // Update existing category
        const updatedCategory = {
          ...editingCategory,
          name: categoryName.trim(),
          icon: selectedIcon,
          color: selectedColor,
        };
        
        await updateCategory(updatedCategory);
        
        // Update local state
        setCategories(prevCategories => 
          prevCategories.map(c => 
            c.id === updatedCategory.id ? updatedCategory : c
          )
        );
      } else {
        // Add new category
        const newCategory = {
          name: categoryName.trim(),
          icon: selectedIcon,
          color: selectedColor,
          type: categoryType,
        };
        
        const savedCategory = await saveCategory(newCategory);
        
        // Update local state
        setCategories(prevCategories => [...prevCategories, savedCategory]);
      }
      
      // Close modal
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };
  
  const handleDeleteCategory = (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? Transactions with this category will need to be reassigned.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
              
              // Update local state
              setCategories(prevCategories => 
                prevCategories.filter(c => c.id !== categoryId)
              );
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        },
      ]
    );
  };
  
  const renderCategory = ({ item }) => (
    <View style={styles.categoryItem}>
      <CategoryIcon 
        icon={item.icon} 
        color={item.color} 
        size="medium"
      />
      
      <Text style={styles.categoryName}>{item.name}</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <MaterialCommunityIcons 
            name="pencil" 
            size={20} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item.id)}
        >
          <MaterialCommunityIcons 
            name="delete" 
            size={20} 
            color={Colors.expense} 
          />
        </TouchableOpacity>
      </View>
    </View>
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
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            categoryType === 'expense' && styles.activeTypeButton,
          ]}
          onPress={() => setCategoryType('expense')}
        >
          <Text 
            style={[
              styles.typeButtonText,
              categoryType === 'expense' && styles.activeTypeText,
            ]}
          >
            Expense Categories
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            categoryType === 'income' && styles.activeTypeButton,
          ]}
          onPress={() => setCategoryType('income')}
        >
          <Text 
            style={[
              styles.typeButtonText,
              categoryType === 'income' && styles.activeTypeText,
            ]}
          >
            Income Categories
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.categoriesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {categoryType} categories found
            </Text>
          </View>
        }
      />
      
      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={openAddModal}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
      
      {/* Add/Edit Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Category Name Input */}
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={Colors.textSecondary}
            />
            
            {/* Icon Selector */}
            <Text style={styles.inputLabel}>Icon</Text>
            <FlatList
              data={ICONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    selectedIcon === item && styles.selectedIconItem,
                    { backgroundColor: selectedColor + '40' }, // 40% opacity
                  ]}
                  onPress={() => setSelectedIcon(item)}
                >
                  <MaterialCommunityIcons 
                    name={item} 
                    size={24} 
                    color={selectedIcon === item ? selectedColor : Colors.textSecondary} 
                  />
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
            />
            
            {/* Color Selector */}
            <Text style={styles.inputLabel}>Color</Text>
            <FlatList
              data={COLORS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.colorsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.colorItem,
                    selectedColor === item && styles.selectedColorItem,
                    { backgroundColor: item },
                  ]}
                  onPress={() => setSelectedColor(item)}
                />
              )}
              keyExtractor={item => item}
            />
            
            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.preview}>
                <CategoryIcon 
                  icon={selectedIcon} 
                  color={selectedColor} 
                  size="large"
                />
                <Text style={styles.previewText}>
                  {categoryName || 'Category Name'}
                </Text>
              </View>
            </View>
            
            {/* Save Button */}
            <Button
              title={editingCategory ? 'Update Category' : 'Save Category'}
              onPress={handleSaveCategory}
              type="primary"
              style={styles.saveButton}
            />
          </View>
        </View>
      </Modal>
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
  typeSelector: {
    flexDirection: 'row',
    padding: Spacing.m,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.xs,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  activeTypeButton: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  activeTypeText: {
    color: 'white',
    fontWeight: '500',
  },
  categoriesList: {
    padding: Spacing.m,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.m,
    marginBottom: Spacing.m,
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
  categoryName: {
    ...Typography.body1,
    flex: 1,
    marginLeft: Spacing.m,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.s,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  addButton: {
    position: 'absolute',
    right: Spacing.l,
    bottom: Spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.l,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  inputLabel: {
    ...Typography.body1,
    color: Colors.text,
    marginBottom: Spacing.s,
    marginTop: Spacing.m,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    ...Typography.body1,
    color: Colors.text,
  },
  iconsList: {
    paddingVertical: Spacing.s,
  },
  iconItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.s,
    backgroundColor: Colors.background,
  },
  selectedIconItem: {
    borderWidth: 2,
  },
  colorsList: {
    paddingVertical: Spacing.s,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: Spacing.s,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: Colors.text,
  },
  previewContainer: {
    marginTop: Spacing.l,
    alignItems: 'center',
  },
  previewLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.s,
  },
  preview: {
    alignItems: 'center',
  },
  previewText: {
    ...Typography.body1,
    marginTop: Spacing.s,
    color: Colors.text,
  },
  saveButton: {
    marginTop: Spacing.l,
  },
});

export default CategoryManagementScreen; 