import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';

// Import theme
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each main section
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: Colors.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
      },
      headerTintColor: Colors.text,
    }}
  >
    <Stack.Screen 
      name="Dashboard" 
      component={DashboardScreen} 
      options={{ title: 'FlowTrack' }}
    />
    <Stack.Screen 
      name="TransactionDetail" 
      component={TransactionDetailScreen} 
      options={{ title: 'Transaction Details' }}
    />
    <Stack.Screen 
      name="EditTransaction" 
      component={EditTransactionScreen} 
      options={{ title: 'Edit Transaction' }}
    />
  </Stack.Navigator>
);

const TransactionsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
      },
      headerTintColor: Colors.text,
    }}
  >
    <Stack.Screen 
      name="Transactions" 
      component={TransactionsScreen} 
      options={{ title: 'Transactions' }}
    />
    <Stack.Screen 
      name="TransactionDetail" 
      component={TransactionDetailScreen} 
      options={{ title: 'Transaction Details' }}
    />
    <Stack.Screen 
      name="EditTransaction" 
      component={EditTransactionScreen} 
      options={{ title: 'Edit Transaction' }}
    />
  </Stack.Navigator>
);

const AddStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
      },
      headerTintColor: Colors.text,
    }}
  >
    <Stack.Screen 
      name="AddTransaction" 
      component={AddTransactionScreen} 
      options={{ title: 'Add Transaction' }}
    />
  </Stack.Navigator>
);

const ReportsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
      },
      headerTintColor: Colors.text,
    }}
  >
    <Stack.Screen 
      name="Reports" 
      component={ReportsScreen} 
      options={{ title: 'Reports & Analytics' }}
    />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.card,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
      },
      headerTintColor: Colors.text,
    }}
  >
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="CategoryManagement" 
      component={CategoryManagementScreen} 
      options={{ title: 'Manage Categories' }}
    />
  </Stack.Navigator>
);

// Custom add button in the center of the tab bar
const AddButton = () => {
  const navigation = useNavigation();
  
  return (
    <TouchableOpacity 
      style={styles.addButtonContainer}
      onPress={() => navigation.navigate('AddTab', {
        screen: 'AddTransaction'
      })}
    >
      <View style={styles.addButton}>
        <MaterialCommunityIcons 
          name="plus" 
          size={28} 
          color="white" 
        />
      </View>
    </TouchableOpacity>
  );
};

// Main tab navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'TransactionsTab') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted-square';
          } else if (route.name === 'AddTab') {
            return null; // We're using a custom button
          } else if (route.name === 'ReportsTab') {
            iconName = focused ? 'chart-pie' : 'chart-pie';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.divider,
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardStack} 
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="TransactionsTab" 
        component={TransactionsStack} 
        options={{ tabBarLabel: 'Transactions' }}
      />
      <Tab.Screen 
        name="AddTab" 
        component={AddStack} 
        options={{
          tabBarLabel: '',
          tabBarButton: () => <AddButton />
        }}
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={ReportsStack} 
        options={{ tabBarLabel: 'Reports' }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStack} 
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default AppNavigator; 