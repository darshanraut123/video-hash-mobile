import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // If you want to use vector icons

interface BlankHeaderProps {
  onClose: () => void;
  title: string;
}

const BlankHeader = ({ onClose, title }: BlankHeaderProps) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onClose} style={styles.iconContainer}>
        {/* Using a cross icon (Ionicons or any other icon library) */}
        <Icon name="close" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute items evenly
    height: 50, // Adjust height based on your design
    paddingHorizontal: 15, // Adjust spacing
    borderBottomWidth: 1, // To add a bottom border
    borderBottomColor: '#ccc', // Gray color for the border
    backgroundColor: 'white', // Background color
  },
  iconContainer: {
    padding: 10, // To give some padding around the icon
  },
  title: {
    fontSize: 18, // Font size for the title
    fontWeight: 'bold', // Make the text bold
    color: 'black',
  },
  spacer: {
    width: 24, // Same width as the icon to keep everything centered
  },
});

export default BlankHeader;
