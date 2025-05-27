import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';
import { CurrencyProvider } from './src/context/CurrencyContext';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>FlowTrack</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <CurrencyProvider>
        <NavigationContainer>
          <StatusBar backgroundColor={Colors.card} barStyle="dark-content" />
          <AppNavigator />
        </NavigationContainer>
      </CurrencyProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});