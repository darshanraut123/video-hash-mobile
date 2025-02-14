import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {fetchVersionInfo} from '../util/device-info';

const Header: React.FC<any> = ({
  onBackArrowPress,
  onMenuPress,
  screenName,
}: any) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackArrowPress} style={styles.leftIcon}>
          <MaterialIcons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.title} onPress={fetchVersionInfo}>
          <Text style={styles.titleText}>
            {screenName ? screenName : 'REALITY REGISTRY'}
          </Text>
        </TouchableOpacity>
        {onMenuPress ? (
          <TouchableOpacity onPress={() => {}} style={styles.rightIcon}>
            <Icon name="menu" size={24} color="#007BFF" />
          </TouchableOpacity>
        ) : (
          <View style={{width: 24}} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    flexGrow: 1,
  },
  titleText: {
    fontSize: 18,
    color: '#292929',
    textAlign: 'center',
    fontFamily: "Poppins-Medium"
  },
  leftIcon: {
    width: 24,
    display: 'flex',
    justifyContent: 'center',
  },
  rightIcon: {
    width: 24,
    display: 'flex',
    justifyContent: 'center',
  },
});

export default Header;
