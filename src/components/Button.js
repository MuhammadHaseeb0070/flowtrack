import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography } from '../constants/theme';

const Button = ({ 
  title, 
  onPress, 
  type = 'primary',
  size = 'medium', 
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  // Button types
  const buttonTypes = {
    primary: {
      backgroundColor: Colors.primary,
      textColor: 'white',
    },
    secondary: {
      backgroundColor: Colors.secondary,
      textColor: Colors.text,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: Colors.primary,
      borderColor: Colors.primary,
      borderWidth: 1,
    },
    danger: {
      backgroundColor: Colors.expense,
      textColor: 'white',
    },
    success: {
      backgroundColor: Colors.income,
      textColor: 'white',
    },
  };
  
  // Button sizes
  const buttonSizes = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: Typography.caption.fontSize,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: Typography.button.fontSize,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      fontSize: Typography.h3.fontSize,
    },
  };
  
  const buttonTypeStyle = buttonTypes[type];
  const buttonSizeStyle = buttonSizes[size];
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonTypeStyle.backgroundColor,
          paddingVertical: buttonSizeStyle.paddingVertical,
          paddingHorizontal: buttonSizeStyle.paddingHorizontal,
          borderColor: buttonTypeStyle.borderColor,
          borderWidth: buttonTypeStyle.borderWidth,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={buttonTypeStyle.textColor} 
          size="small" 
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: buttonTypeStyle.textColor,
              fontSize: buttonSizeStyle.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Button; 