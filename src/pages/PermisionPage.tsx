import React, {useCallback, useEffect, useState} from 'react';
import {Linking, SafeAreaView} from 'react-native';

import {StyleSheet, View, Text} from 'react-native';
import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';
import {CONTENT_SPACING, SAFE_AREA_PADDING} from './constants';

export function PermissionsPage({navigation}: any): React.ReactElement {
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    useState<CameraPermissionStatus>('not-determined');

  const requestCameraPermission = useCallback(async () => {
    console.log('Requesting camera permission...');
    const permission = await Camera.requestCameraPermission();
    console.log(`Camera permission status: ${permission}`);

    if (permission === 'denied') await Linking.openSettings();
    setCameraPermissionStatus(permission);
  }, []);

  useEffect(() => {
    if (cameraPermissionStatus === 'granted') navigation.navigate('CameraPage');
  }, [cameraPermissionStatus, navigation]);

  const backHome = async () => {
    navigation.navigate('HomePage');
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to{'\n'}Vision Camera.</Text>
        <View style={styles.permissionsContainer}>
          {cameraPermissionStatus !== 'granted' && (
            <Text style={styles.permissionText}>
              Vision Camera needs{' '}
              <Text style={styles.bold}>Camera permission</Text>.{' '}
              <Text style={styles.hyperlink} onPress={requestCameraPermission}>
                Grant
              </Text>
            </Text>
          )}
        </View>
        <Text style={styles.hyperlink} onPress={backHome}>
          Back home
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 38,
    fontWeight: 'bold',
    maxWidth: '80%',
  },
  banner: {
    position: 'absolute',
    opacity: 0.4,
    bottom: 0,
    left: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    ...SAFE_AREA_PADDING,
  },
  permissionsContainer: {
    marginTop: CONTENT_SPACING * 2,
  },
  permissionText: {
    fontSize: 17,
  },
  hyperlink: {
    color: '#007aff',
    fontWeight: 'bold',
  },
  bold: {
    fontWeight: 'bold',
  },
});
