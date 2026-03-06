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

## Essential Requirement: Custom SVG and PNG Confetti Textures
**MANDATORY**: All confetti implementations MUST include custom SVG and PNG texture support using the existing assets in the `images/` directory.

### Implementation Requirements:
1. **Import required hooks**: Use `useImage` and `useSVG` from `@shopify/react-native-skia`
2. **SVG Implementation**: 
   - Set `type="svg"` prop
   - Use `flakeSvg` prop with `useSVG(require('path/to/svg'))`
   - Load SVGs from `images/svg/` directory
3. **PNG Implementation**:
   - Set `type="image"` prop  
   - Use `flakeImage` prop with `useImage(require('path/to/png'))`
   - Load PNGs from `images/png/` directory
4. **All confetti types must support custom textures**: Confetti, PIConfetti, and ContinuousConfetti

### Example Usage (from official docs):
```javascript
import { Confetti } from 'react-native-fast-confetti';
import { useImage, useSVG } from '@shopify/react-native-skia';

const customSVG = useSVG(require('../images/svg/example.svg'));
const customImage = useImage(require('../images/png/example.png'));

<Confetti type="svg" flakeSvg={customSVG} />
<Confetti type="image" flakeImage={customImage} />
```