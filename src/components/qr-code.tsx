import React from 'react';
import {View, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const QrCodeComponent = (props: any) => {
  // Ensure the qrCodeRefs array grows when new data is added
  React.useEffect(() => {
    if (props.qrCodeData.length > props.qrCodeRefs.current.length) {
      // Append null refs for new items
      props.qrCodeRefs.current = [
        ...props.qrCodeRefs.current,
        ...Array(
          props.qrCodeData.length - props.qrCodeRefs.current.length,
        ).fill(null),
      ];
    }
  }, [props.qrCodeData, props.qrCodeRefs]);

  return (
    <>
      {props.qrCodeData.map((element: string, index: number) => (
        <View key={index} style={styles.qrcodeContainer}>
          <QRCode
            backgroundColor="white"
            value={JSON.stringify(element)}
            size={50}
            getRef={el => (props.qrCodeRefs.current[index] = el)}
          />
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  qrcodeContainer: {
    padding: 10,
  },
});

export default QrCodeComponent;
