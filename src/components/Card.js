import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../constants/theme';

const Card = ({ children, style, shadowLevel = 'small' }) => {
  return (
    <View style={[
      styles.card, 
      Shadows[shadowLevel], 
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
  },
});

export default Card; 