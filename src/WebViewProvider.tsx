import React, {createContext, useRef} from 'react';
import {fromByteArray} from 'react-native-quick-base64';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import {witnessStr} from './witness';

export const WebViewContext = createContext<{
  witnessCalculationWebView: Function;
}>({witnessCalculationWebView: () => ({})});

export const WebViewWrapperProvider = (props: any) => {
  const webViewRef = useRef(null);
  let resolveMethod: any;
  const eventHandler = (event: {nativeEvent: {data: string}}) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('WebView event: ', data.event);
    if (!resolveMethod) return;
    if (data.event === '@EXECUTION_RESULT') {
      resolveMethod(data.witnessCalculationResult);
    }
  };
  const witnessCalculationWebView = async (
    binary: Uint8Array,
    inputs: any,
  ): Promise<Uint8Array> => {
    // @ts-ignore
    webViewRef.current.postMessage(
      JSON.stringify({
        event: '@EXECUTE_WASM',
        binary: fromByteArray(binary),
        inputs,
      }),
    );

    console.log('sent to webView');
    return await new Promise(resolve => {
      resolveMethod = resolve;
    });
  };

  return (
    <WebViewContext.Provider
      value={{
        witnessCalculationWebView,
      }}>
      <View style={{flex: 0}}>
        <WebView
          ref={webViewRef}
          style={{height: 0}}
          source={{
            html: ` 
          <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
              </head>
              <body>
                <h1>Silver area is a Webview</h1>
              </body>
        </html>        
    `,
          }}
          injectedJavaScriptBeforeContentLoaded={witnessStr}
          onMessage={event => {
            eventHandler(event);
          }}
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          allowFileAccess
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>
      {props.children}
    </WebViewContext.Provider>
  );
};
