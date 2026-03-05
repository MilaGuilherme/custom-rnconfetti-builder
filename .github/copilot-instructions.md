# Copilot Instructions

This is a React Native project for testing the react-native-fast-confetti library.

## Project Setup Status
- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements  
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete

## Known Issues
- Node.js v20.1.0 causes Metro bundler compatibility issues
- React Native 0.84.0 requires Node.js >= 20.19.4
- Update Node.js to resolve Metro bundler startup problems

## Next Steps
To fully test the confetti library:
1. Update Node.js to version 20.19.4 or later
2. Run `npm start` to start Metro bundler
3. Run `npm run ios` or `npm run android` to launch the app
4. Test all four confetti types via the app interface

## Project Description
React Native project to test react-native-fast-confetti library functionality including:
- Basic confetti animations
- PIConfetti (burst effect)
- ContinuousConfetti (continuous falling effect)
- Custom textures and configurations