import './shim';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';
import {
    StyleSheet,
    useColorScheme,
    View,
} from 'react-native';
import {PermissionsPage} from './pages/PermisionPage';
import {CameraPage} from './pages/CameraPage';
import {HomePage} from './pages/HomePage';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ActionPage, webRef} from './pages/ActionPage';
import {WebViewWrapperProvider} from './WebViewProvider';

const Tab = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();
export default function App(): React.ReactElement | null {
    const isDarkMode = useColorScheme() === 'dark';
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
    // return 'aa';
    const backgroundStyle = {
        // backgroundColor: Colors.lighter,
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <NavigationContainer>
            <View style={styles.root}>
                <WebViewWrapperProvider>
                    <Tab.Navigator
                        // screenOptions={({route}) => ({
                        //   tabBarIcon: ({focused, color, size}) => {
                        //     let iconName;
                        //
                        //     if (route.name === 'Home') {
                        //       iconName = focused
                        //         ? 'ios-information-circle'
                        //         : 'ios-information-circle-outline';
                        //     } else if (route.name === 'Settings') {
                        //       iconName = focused ? 'ios-list' : 'ios-list-outline';
                        //     }
                        //
                        //     // You can return any component that you like here!
                        //     return <Ionicons name={iconName} size={size} color={color} />;
                        //   },
                        //   tabBarActiveTintColor: 'tomato',
                        //   tabBarInactiveTintColor: 'gray',
                        // })}
                        screenOptions={{
                            // headerShown: false,
                            statusBarStyle: 'dark',
                            animationTypeForReplace: 'push',
                        }}
                        initialRouteName={
                            showPermissionsPage ? 'PermissionsPage' : 'HomePage'
                            // showPermissionsPage ? 'PermissionsPage' : 'PermissionsPage'
                        }>
                        <Tab.Screen name="PermissionsPage" component={PermissionsPage}/>
                        <Tab.Screen name="CameraPage" component={CameraPage} />
                        <Tab.Screen name="HomePage" component={HomePage} />
                        <Tab.Screen name="ActionPage" component={ActionPage} />
                        {/*<Stack.Screen*/}
                        {/*  name="MediaPage"*/}
                        {/*  component={MediaPage}*/}
                        {/*  options={{*/}
                        {/*    animation: 'none',*/}
                        {/*    presentation: 'transparentModal',*/}
                        {/*  }}*/}
                        {/*/>*/}
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
