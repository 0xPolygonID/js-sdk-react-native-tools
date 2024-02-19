import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import {useIsForeground} from '../hooks/useIsForegraund';

export function CameraPage({navigation}: any) {
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const [isActive, setIsActive] = useState(isFocussed && isForeground);
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: codes => {
      setIsActive(false);
      console.log(`Scanned ${codes.length} codes!`);
      const [code] = codes;
      navigateToAction(code.value);
      console.log(code.value);
    },
  });
  useEffect(() => {
    if (!isFocussed || !isForeground) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
    return () => {
      console.log('leave Camera Page');
    };
  }, [isFocussed, isForeground]);
  const navigateToAction = (data = 'ssd') => {
    navigation.navigate('ActionPage', {data});
  };
  console.log('isActive Camera');
  console.log(isActive);
  if (!isActive) return null;
  if (device == null) return <Text> No Device</Text>;
  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={camera}
        // style={StyleSheet.absoluteFill}
        style={styles.camera}
        isActive={isActive}
        device={device}
        codeScanner={codeScanner}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
  camera: {
    top: 100,
    left: 20,
    width: 300,
    height: 350,
  },
});
