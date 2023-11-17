import React, {useContext, useEffect, useState} from 'react';

import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SAFE_AREA_PADDING} from './constants';
import {CircuitStorageInstance, AppService, IdentityService} from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {storage} from '../../share/storage/store';
import {W3CCredential} from '@0xpolygonid/js-sdk';
import {WebViewContext} from '../WebViewProvider';
import {witnessCalculationNative} from '../../share/proof/witness-calculator-native';

export function HomePage({route, navigation}: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPresentIdentity, setIsPresentIdentity] = useState(false);
  const [isPresentCircuits, setIsPresentCircuits] = useState(false);
  const [isInited, setIsInited] = useState(false);
  const [credentials, setCredentials] = useState<W3CCredential[]>([]);
  const [circuitsUrl, setCircuitsUrl] = useState<string>('http://192.168.0.100:3000');
  const webViewContext = useContext(WebViewContext);

  const [keys, setKeys] = useState<string[]>([]);
  const [text, setText] = useState('circuits');
  const {message} = route.params || {};

  console.log('HomePage data');
  console.log(message);
  useEffect(() => {
    console.log('message changed');
  }, [message]);
  useEffect(() => {
    console.log('init HomePage');
    getAllDataFromStorage().then();
    checkCircuits().then((res) => {
      setIsPresentCircuits(res)
    });
    getCreds().then((creds) => {
      setCredentials(creds);
    });
    checkIdentity().then((res) => {
      setIsPresentIdentity(res);
    });
    setIsInited(AppService.isInited());
    getAllDataFromStorage();
    // checkCircuits();
  }, [isPresentIdentity, isInited]);

  const getCreds = async () => {
    try {
      const {credWallet, dataStorage} = AppService.getExtensionServiceInstance();
      const creds = await credWallet.list();
      return creds;
    } catch (e) {
      return [];
    }
  };
  const reset = () => {
    setIsInited(false);

    AppService.reset();
    setIsProcessing(false);
    setIsPresentIdentity(false);
    setCredentials([]);
  };
  const checkIdentity = async (): Promise<boolean> => {
    const {dataStorage} = AppService.getExtensionServiceInstance() || {};
    if(!dataStorage) return false;
    const identities = await dataStorage.identity.getAllIdentities();
    return identities?.length > 0;
  };
  const initWebViewWitness = async () => {
    console.time('init sdk');
    setIsProcessing(true);
    await AppService.init(circuitsUrl, webViewContext.witnessCalculationWebView);
    console.timeEnd('init sdk');
    setIsInited(true);
    setIsProcessing(false);
  };


  const initNativeWitness = async () => {
    console.time('init sdk');
    setIsProcessing(true);
    await AppService.init(circuitsUrl, witnessCalculationNative);
    console.timeEnd('init sdk with native witness');
    setIsInited(true);
    setIsProcessing(false);
  };
  const createIdentity = async () => {
    console.time('home: createIdentity');
    setIsProcessing(true);
    await IdentityService.createIdentity();
    const {credWallet} = AppService.getExtensionServiceInstance();
    const creds = await credWallet.list();
    setIsPresentIdentity(true);
    setIsInited(true);
    setCredentials(creds);
    setIsProcessing(false);
    console.timeEnd('home: createIdentity');
  };
  const checkCircuits = async () => {
    await CircuitStorageInstance.init(circuitsUrl);
    const isPresentCircuit = await CircuitStorageInstance.checkCircuits();
    setIsPresentCircuits(isPresentCircuit);
    return isPresentCircuit;

  };
  const loadCircuits = async () => {
    try {
      setIsProcessing(true);
      await CircuitStorageInstance.loadCircuits();
      setIsPresentCircuits(true);
      getAllDataFromStorage();
      setIsProcessing(false);
    } catch (e) {
      console.log('error load circuits', e);
    }
  };

  const openCamera = () => {
    navigation.navigate('CameraPage');
  };

  const getAllDataFromStorage = async () => {
    console.log('getAllDataFromStorage');
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keys2 = storage.getAllKeys();
      const data = [...keys, ...keys2];
      console.log(data.length);
      setKeys(data);
    } catch (error) {
      console.error(error);
    }
  };
  const getKeyFromStorage = async (key: string) => {
    try {
      let value: string | null | undefined = storage.getString(key);

      value = !value ? await AsyncStorage.getItem(key) : value;

      // @ts-ignore
      alert(value);
    } catch (error) {
      console.error(error);
    }
  };
  const clearAllData = async () => {
    storage.clearAll();
    AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys))
      .then(() => {
        reset();
        getAllDataFromStorage();
        setIsPresentCircuits(false);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>HOME PAGE {`${isProcessing ? '-----LOADING-----': ''}`}</Text>
      <Text>{message}</Text>
      {
          !isPresentCircuits && <Button
            title={'check circuits in storage'}
            onPress={() => checkCircuits()}></Button>
      }
      <Text>{isInited ? 'INITED' : 'NOT READY'}</Text>
      {isPresentCircuits && !isInited && <Button title={'init SDK WebView Witness'} onPress={() => initWebViewWitness()}></Button>}
      {isPresentCircuits && !isInited && <Button title={'init SDK Native Witness'} onPress={() => initNativeWitness()}></Button>}
      {
        !isPresentIdentity && isInited && <Button title={'Create identity'} onPress={() => createIdentity()}></Button>
      }

      {
        !isPresentCircuits &&
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 1}}
              placeholder="Type here storage key"
              onChangeText={newText => setCircuitsUrl(newText)}
              defaultValue={circuitsUrl}
            />
            <Button
              title="Load circuits"
              onPress={() => loadCircuits()}
            />
          </View>
      }

      {isPresentCircuits ? (
        <Text>Circuits present</Text>
      ) : (
          <Text>Circuits absent</Text>
      )}
      <Text>----------------CREDENTIALS----------------------</Text>
      {credentials.map((cred, i) => (
        <View key={i}>
          <Text>Type:{cred.credentialSubject.type as String}</Text>
          <Text>Issuer: {cred.issuer}</Text>
          <Text>
            Proof:{' '}
            {cred.proof &&
              (cred.proof as Array<Object>)?.map((a: any) => a?.type).join(',')}
          </Text>
        </View>
      ))}
      <Text>----------------CREDENTIALS END----------------------</Text>
      <View style={{flex: 1}}>
        <Text>--------------------------------------</Text>

        <Button
          title="Get all stored keys"
          onPress={() => getAllDataFromStorage()}
        />
        <View>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            placeholder="Type here storage key"
            onChangeText={newText => setText(newText)}
            defaultValue={text}
          />
          <Button
            title="Get data by key"
            onPress={() => getKeyFromStorage(text)}
          />
        </View>
        <Text>--------------------------------------</Text>
        <Button
          title="Delete All Data From Storages"
          onPress={() => clearAllData()}
        />
        <Text>--------------------------------------</Text>

        <ScrollView style={{marginBottom: 40, flex: 1}}>
          {
            keys.map((item, i) => (<Text
                key={item+i}
                style={styles.item}
                onPress={() => {
                  setText(item);
                }}>
              {item}
            </Text>))
          }
        </ScrollView>

      </View>
      <View style={styles.rightButtonRow}>
        <Button title={'open Camera'} onPress={() => openCamera()}></Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
  item: {
    height: 30,
  },
  rightButtonRow: {
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // right: SAFE_AREA_PADDING.paddingRight,
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
});
