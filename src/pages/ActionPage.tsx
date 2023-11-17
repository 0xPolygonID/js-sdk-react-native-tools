import {CommonActions} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

import { Button, NativeEventEmitter, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {fromByteArray} from 'react-native-quick-base64';
import {WebView} from 'react-native-webview';

import {SAFE_AREA_PADDING} from './constants';
import {Base64} from 'js-base64';
import {approveMethod, receiveMethod} from '../services/Approve.service';
import {witnessStr} from './witness';

const RequestType = {
  Auth: 'auth',
  CredentialOffer: 'credentialOffer',
  Proof: 'proof',
};

const getTitle = (requestType: string): string => {
  switch (requestType) {
    case RequestType.Auth:
      return 'Authorization';
    case RequestType.CredentialOffer:
      return 'Receive Claim';
    case RequestType.Proof:
      return 'Proof request';
    default:
      return '';
  }
};
export let webRef = null;

class Emitter {
  emit(data: any) {
    this.listen(data);
  }
  listen(data: any) {}
}
const eventEmitter = new Emitter();

// export const witnessCalc = async (binary, inputs): Promise<Uint8Array> => {
//   webRef.postMessage(
//     JSON.stringify({event: '@EXECUTE_WASM', binary: fromByteArray(binary), inputs}),
//   );
//   console.log("sent to web");
//   return await new Promise((resolve, reject) => {
//     eventEmitter.listen = (event) => {
//       // eventHandler(event);
//       const data = JSON.parse(event.nativeEvent.data);
//       console.log(data.event);
//       if (data.event === '@EXECUTION_RESULT') {
//         resolve(data.witnessCalculationResult);
//       }
//     };
//   });
// };
// webRef.props.onMessage=(event) => {
//   // eventHandler(event);
//   console.log(event.type);
//   const data = JSON.parse(event.data);
//   if (data.event === '@EXECUTE_WASM_RESULT') {
//     resolve(data.value);
//   }
// }
// webRef.props.addEventListener("message", message => {
//   const data = JSON.parse(message.data);
//   if (data.event === '@EXECUTE_WASM_RESULT') {
//     resolve(data.value);
//   }
// });
// });
// };

export function ActionPage({route, navigation}: any) {
  const {data: inputData} = route.params || {};
  const [requestType, setRequestType] = useState(RequestType.Auth);
  const [data, setData] = useState(JSON.parse(inputData));
  const [isPrcessing, setIsPrcessing] = useState(false);
  const webviewRef = useRef();

  const detectRequest = (unpackedMessage: any) => {
    const {type, body} = unpackedMessage;
    const {scope = []} = body;

    if (type.includes('request') && scope.length) {
      return RequestType.Proof;
    } else if (type.includes('offer')) {
      return RequestType.CredentialOffer;
    } else if (type.includes('request')) {
      return RequestType.Auth;
    }
    return '';
  };
  // const data = JSON.parse(inputData);
  console.log('ActionPage data');
  console.log(data.body);
  console.log(Base64.encode(inputData));
  // console.log(typeof data);
  useEffect(() => {
    console.log('data ActionPage changed');
    const message = JSON.parse(inputData);
    setData(message);
    setRequestType(detectRequest(message));
  }, [inputData]);

  const resetToHome = (message: any) => {
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{name: 'HomePage', params: {message}}],
    });
    navigation.dispatch(resetAction);
  };

  async function handleClickReject() {
    console.log('handleClickReject');
    resetToHome('Rejected');
  }

  async function handleClickApprove() {
    console.log('handleClickApprove');

    // setIsReady(false);
    try {
      setIsPrcessing(true);
      await approveMethod(Base64.encode(JSON.stringify(data)));
      console.log('ActionHome Authorized');
      resetToHome('Success auth');
    } catch (e) {
      console.log(e);
      resetToHome('Error on auth');
    }
  }

  async function handleClickReceive() {
    console.log('handleClickReceive');

    // setIsReady(false);
    try {
      setIsPrcessing(true);
      await receiveMethod(Base64.encode(JSON.stringify(data)));
      resetToHome('Success Receive');
    } catch (e) {
      console.log(e);
      resetToHome('Error on Receive');
    }
  }

  async function handleClickProof() {
    console.log('handleClickProof');
    try {
      setIsPrcessing(true);
      await approveMethod(Base64.encode(JSON.stringify(data)));
      resetToHome('Success Proof');
    } catch (e) {
      console.log(e);
      resetToHome('Error on Proof');
    }
  }

  const getCredentialRequestData = () => {
    const {body} = data;
    const {scope = []} = body;
    return scope.map(({circuitId, query}: any) => {
      let data = [];
      data.push({
        name: 'Credential type',
        value: query.type,
      });
      query.credentialSubject &&
        data.push({
          name: 'Requirements',
          value: Object.keys(query.credentialSubject).reduce((acc, field) => {
            const filter = query.credentialSubject[field];
            const filterStr = Object.keys(filter).map(operator => {
              return `${field} - ${operator} ${filter[operator]}\n`;
            });
            return acc.concat(...filterStr);
          }, ''),
        });
      data.push({
        name: 'Allowed issuers',
        value: query.allowedIssuers.join(', '),
      });
      data.push({
        name: 'Proof type',
        value: circuitId,
      });
      return data;
    });
  };

  console.log('data');
  console.log(data);
  console.log(webRef);
  return (
    <SafeAreaView style={styles.container}>
      <Text>Action PAGE {isPrcessing && 'Processing...'}</Text>
      <Text>Action Type: [{getTitle(requestType)}]</Text>
      <Text>-----------------------</Text>
      <Text>{data && JSON.stringify(data)}</Text>
      <Text>-----------------------</Text>
      <View>
        {requestType && requestType === RequestType.Proof && (
          <>
            <Text>
              This organization requests a valid proof of next credential for [
              {data.body.reason}]
            </Text>
            <Text>From : {data?.from}</Text>
            {getCredentialRequestData().map((oneCredentialRequest: any[]) => {
              return oneCredentialRequest.map((data, index) => {
                return (
                  <View key={index}>
                    <Text>{data.name}</Text>
                    <Text>{data.value}</Text>
                  </View>
                );
              });
            })}
            <View style={styles.horizontalButtons}>
              <Button
                disabled={isPrcessing}
                title={'Approve'}
                onPress={handleClickProof}></Button>
              <Button
                disabled={isPrcessing}
                title={'Reject'}
                onPress={handleClickReject}></Button>
            </View>
          </>
        )}
        {requestType && requestType === RequestType.Auth && (
          <>
            <Text>Reason : {data?.body?.reason}</Text>
            <Text>From : {data?.from}</Text>
            <View style={styles.horizontalButtons}>
              <Button
                disabled={isPrcessing}
                title={'Approve'}
                onPress={handleClickApprove}></Button>
              <Button
                disabled={isPrcessing}
                title={'Reject'}
                onPress={handleClickReject}></Button>
            </View>
          </>
        )}
        {requestType && requestType === RequestType.CredentialOffer && (
          <>
            <Text>From : {data.from}</Text>
            <Text>Credentails:</Text>
            {data.body.credentials.map((cred: any) => (
              <View key={cred.id}>
                <Text>{cred.description}</Text>
                <Text>{cred.id}</Text>
              </View>
            ))}
            <View style={styles.horizontalButtons}>
              <Button
                disabled={isPrcessing}
                title={'Receive'}
                onPress={handleClickReceive}></Button>
              <Button
                disabled={isPrcessing}
                title={'Reject'}
                onPress={handleClickReject}></Button>
            </View>
          </>
        )}
      </View>
      <View style={styles.rightButtonRow}>
        <Button
          title={'reset Home'}
          onPress={() => resetToHome('from Action message')}></Button>
      </View>
      {/*<WebView*/}
      {/*  ref={(ref) => {*/}
      {/*    webRef = ref;*/}
      {/*  }}*/}
      {/*  style={styles.container}*/}
      {/*  source={{ html: ` */}
      {/*            <html>*/}
      {/*                <head>*/}
      {/*                  <meta name="viewport" content="width=device-width, initial-scale=1" />*/}
      {/*                </head>*/}
      {/*                <body>*/}
      {/*                  <h1>Silver area is a Webview</h1>*/}
      {/*                </body>*/}
      {/*          </html>        */}
      {/*      `,}}*/}
      {/*  injectedJavaScriptBeforeContentLoaded={witnessStr}*/}
      {/*  onMessage={(event) => {*/}
      {/*    // eventHandler(event);*/}
      {/*    console.log("res onMessage");*/}
      {/*    eventEmitter.emit(event);*/}
      {/*    // console.log(event.type);*/}
      {/*  }}*/}
      {/*  allowFileAccessFromFileURLs*/}
      {/*  allowUniversalAccessFromFileURLs*/}
      {/*  allowFileAccess*/}
      {/*  onError={(syntheticEvent) => {*/}
      {/*    const { nativeEvent } = syntheticEvent;*/}
      {/*    console.warn('WebView error: ', nativeEvent);*/}
      {/*  }}*/}
      {/*/>*/}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
  horizontalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
