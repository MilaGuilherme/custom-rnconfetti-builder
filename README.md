# React Native Fast Confetti Test App

A comprehensive test application for the [react-native-fast-confetti](https://github.com/AlirezaHadjar/react-native-fast-confetti) library, showcasing all confetti types and configurations.

## 🎊 Features

This app demonstrates four different confetti effects:

- **Basic Confetti**: Simple falling confetti animation
- **PI Confetti**: Burst effect that explodes outward then falls gracefully  
- **Continuous Confetti**: Non-stop falling confetti effect
- **Cannon Confetti**: Confetti shot from multiple cannons positioned at screen corners

## 📦 Dependencies

The app includes all necessary dependencies:

- `react-native-fast-confetti` - The main confetti library
- `react-native-reanimated` - For smooth animations
- `@shopify/react-native-skia` - For hardware-accelerated graphics
- `react-native-safe-area-context` - For safe area handling

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.19.4 (Note: Current Node.js v20.1.0 has compatibility issues)
- React Native development environment (Android Studio / Xcode)
- iOS Simulator or Android Emulator

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **iOS Setup (macOS only):**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

### Running the App

#### Start Metro Bundler

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```bash
npm start
```

#### Run on iOS
```bash
npm run ios
```

#### Run on Android  
```bash
npm run android
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
