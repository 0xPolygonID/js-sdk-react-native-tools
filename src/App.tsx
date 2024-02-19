import './shim';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';
import {StyleSheet, View} from 'react-native';
import {PermissionsPage} from './pages/PermisionPage';
import {CameraPage} from './pages/CameraPage';
import {HomePage} from './pages/HomePage';
import {ActionPage} from './pages/ActionPage';
import {WebViewWrapperProvider} from './WebViewProvider';

const Tab = createNativeStackNavigator();
export default function App(): React.ReactElement | null {
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>();

  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setCameraPermission);
  }, []);

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission}`);

  if (cameraPermission == null) {
    // still loading
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'granted';

  return (
    <NavigationContainer>
      <View style={styles.root}>
        <WebViewWrapperProvider>
          <Tab.Navigator
            screenOptions={{
              // headerShown: false,
              statusBarStyle: 'dark',
              animationTypeForReplace: 'push',
            }}
            initialRouteName={
              showPermissionsPage ? 'PermissionsPage' : 'HomePage'
              // showPermissionsPage ? 'PermissionsPage' : 'PermissionsPage'
            }>
            <Tab.Screen name="PermissionsPage" component={PermissionsPage} />
            <Tab.Screen name="CameraPage" component={CameraPage} />
            <Tab.Screen name="HomePage" component={HomePage} />
            <Tab.Screen name="ActionPage" component={ActionPage} />
          </Tab.Navigator>
        </WebViewWrapperProvider>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
