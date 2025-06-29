import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

export default function Card({ children, style, ...props }) {
  const { theme } = useTheme();
  
  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 0,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 