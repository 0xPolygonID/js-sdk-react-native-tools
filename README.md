This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

[//]: # (# Getting Started)

[//]: # ()
[//]: # (>**Note**: Make sure you have completed the [React Native - Environment Setup]&#40;https://reactnative.dev/docs/environment-setup&#41; instructions till "Creating a new application" step, before proceeding.)
## First: Checking dependencies
Please check **_react-native-rapidsnark_** in [package.json](package.json). Native prover as _snarkjs.groth16_ method
- if using local need to add manually *.a files from [react-native-rapidsnark](https://github.com/0xPolygonID/react-native-rapidsnark/tree/develop/ios) to Link Binary With Libraries(Build phases) in Xcode
## Check bundlers
Please look at [metro.config.js](metro.config.js). There are **extraNodeModules**.
Please look at [babel.config.js](babel.config.js). There are **alias** to js sdk esm source code
## ProofService initialization
- Need to add custom prover for [ProofService](https://github.com/0xPolygonID/js-sdk/blob/d38bec28a7e60e3bc4bad01dfe9495a649cd453a/src/proof/proof-service.ts#L175C12-L175C31).
- Example is using [react-native-rapidsnark](https://github.com/0xPolygonID/react-native-rapidsnark/tree/develop/ios). See [ReactNativeZKProver]().

## Witness Calculation
Example shows 2 possible ways to do Witness Calculation.
1. Using [react-native-webassembly](https://github.com/cawfree/react-native-webassembly) written on C++. See [witness-calculator-native.ts](share%2Fproof%2Fwitness-calculator-native.ts)
2. Using **WebView** with [witness.ts](src%2Fwitness.ts) string for execution. See [WebViewProvider.tsx](src%2FWebViewProvider.tsx)

**WebView** faster 15x+. [react-native-webassembly](https://github.com/cawfree/react-native-webassembly) ~7sec vs **WebView** ~0.3sec.
## Other
Added [shim.ts](src%2Fshim.ts) in [App.tsx](src%2FApp.tsx) for global polyfills.

Folder [share](share) contains **storages** & **proof service**.

Need to set `RHS_URL` & `RPC_URL` in [common.constants.ts](src%2Fconstants%2Fcommon.constants.ts)
## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
