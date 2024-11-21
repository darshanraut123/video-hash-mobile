import React from 'react';
import {Modal, StyleSheet, Text, Pressable, View} from 'react-native';

const CustomModal: React.FC<any> = ({
  infoModalVisible,
  setInfoModalVisible,
  children,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={infoModalVisible ? true : false}
      onRequestClose={() => {
        setInfoModalVisible(null);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {children}
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              setInfoModalVisible(null);
            }}>
            <Text style={styles.textStyle}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    marginTop: 30,
    backgroundColor: '#2196F3',
    alignSelf: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomModal;
