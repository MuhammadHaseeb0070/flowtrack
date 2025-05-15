import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CategoryIcon = ({ 
  icon, 
  color, 
  size = 'medium', 
  onPress 
}) => {
  // Size variants
  const sizes = {
    small: { container: 32, icon: 16 },
    medium: { container: 40, icon: 20 },
    large: { container: 48, icon: 24 },
  };
  
  const containerStyle = {
    width: sizes[size].container,
    height: sizes[size].container,
    borderRadius: sizes[size].container / 2,
    backgroundColor: color,
  };
  
  const iconSize = sizes[size].icon;
  
  const IconComponent = () => (
    <View style={[styles.container, containerStyle]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={iconSize} 
        color="white" 
      />
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <IconComponent />
      </TouchableOpacity>
    );
  }
  
  return <IconComponent />;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryIcon; 