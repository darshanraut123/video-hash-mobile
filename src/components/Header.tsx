import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Make sure the correct icon set is imported
import { SafeAreaView } from 'react-native-safe-area-context';

const Header: React.FC = () => {
  return (
    <SafeAreaView style={styles.headerContainer}>
      {/* Left Side - Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>REALITY REGISTRY</Text>
      </View>

      {/* Right Side - Notification Bell, Profile Image, Dropdown */}
      <View style={styles.rightContainer}>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#000" style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>EB</Text>
        </View>

        <TouchableOpacity>
          <Icon name="chevron-down-outline" size={20} color="#000" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    color: '#007bff', // Blue color similar to the image
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 20,
  },
  profileContainer: {
    backgroundColor: '#a0c4ff', // Light blue profile background color
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  profileText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Header;
