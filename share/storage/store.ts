import AsyncStorage from '@react-native-async-storage/async-storage';
import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV();

export const getItem = async (key: string): Promise<any> => {
  const value = await AsyncStorage.getItem(key);
  if (value) {
    return value;
  }
  return null;
};

export const setItem = async (key: string, inputData: string) => {
  return await AsyncStorage.setItem(key, inputData);
};

export const clear = async () => {
  const keys = await AsyncStorage.getAllKeys();
  return await AsyncStorage.multiRemove(keys);
};

export const appStorage = {
  getItem,
  setItem,
  clear,
};
