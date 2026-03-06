/**
 * React Native Fast Confetti Test App
 * Advanced customizable confetti animations with real-time parameter control
 *
 * @format
 */

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
  Alert,
  TextInput,
  Switch,
  Dimensions,
  Clipboard,
  Image,
  Animated,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  Confetti,
  PIConfetti,
  ContinuousConfetti,
} from 'react-native-fast-confetti';
import type {
  ConfettiMethods,
  PIConfettiMethods,
} from 'react-native-fast-confetti';
import { useSVG, useImage, type SkSVG, type SkImage } from '@shopify/react-native-skia';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// SVG assets optimized for confetti textures
const svgAssets = [
  require('./images/svg/Petals.svg'),      
  require('./images/svg/Sqiggles.svg'),   
  require('./images/svg/Stars.svg'),     
  require('./images/svg/GreenDonuts.svg'), 
  require('./images/svg/Rectangles.svg'),
  require('./images/svg/Squares.svg'),
] as const;

// PNG assets for confetti textures (fallback/alternative)
const pngAssets = [
  require('./images/png/Petals.png'),
  require('./images/png/Sqiggles.png'),
  require('./images/png/Stars.png'),
  require('./images/png/GreenDonuts.png'),
  require('./images/png/Rectangles.png'),
  require('./images/png/Squares.png'),
] as const;

// Configuration interfaces for each confetti type
interface BaseConfettiConfig {
  flakeSize: { width: number; height: number };
  count: number;
  width?: number;
  height?: number;
  fallDuration: number;
  autoStartDelay: number;
  sizeVariation: number;
  randomSpeed: { min: number; max: number };
  randomOffset: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  rotation: { x: { min: 0; max: 0 } };
  fadeOutOnEnd: boolean;
  radiusRange: [number, number];
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

interface BasicConfettiConfig extends BaseConfettiConfig {
  type: 'basic';
  blastDuration: number;
  cannonsPositions: { x: number; y: number }[];
  verticalSpacing: number;
  autoplay: boolean;
  isInfinite: boolean;
}

interface PIConfettiConfig extends BaseConfettiConfig {
  type: 'pi';
  blastDuration: number;
  blastPosition: { x: number; y: number };
  blastRadius: number;
  blastPositionOffset: number;
}

interface ContinuousConfettiConfig extends BaseConfettiConfig {
  type: 'continuous';
  verticalSpacing: number;
}

type CustomConfettiConfig = BasicConfettiConfig | PIConfettiConfig | ContinuousConfettiConfig;

// Preset configurations - shared between default config and parameter editor
const presetConfigs = {
  basic: {
    type: 'basic' as const,
    flakeSize: { width: 24, height: 24 } as const,
    count: 200,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    fallDuration: 3000,
    blastDuration: 300,
    cannonsPositions: [
      { x: 50, y: SCREEN_HEIGHT - 200 },
      { x: SCREEN_WIDTH - 50, y: SCREEN_HEIGHT - 200 },
    ] as { x: number; y: number }[],
    autoplay: false,
    isInfinite: false,
    autoStartDelay: 0,
    sizeVariation: 0.3, // Increased for more natural texture variation
    randomSpeed: { min: 0.9, max: 1.3 },
    randomOffset: { x: { min: -50, max: 50 }, y: { min: 0, max: 150 } },
    fadeOutOnEnd: true,
    radiusRange: [0, 0] as [number, number], // Better size range for texture visibility
    rotation: { x: { min: 0 as const, max: 0 as const } },
    verticalSpacing: 30,
  },
  pi: {
    type: 'pi' as const,
    flakeSize: { width: 24, height: 24 } as const,
    count: 300,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    fallDuration: 2500,
    blastDuration: 300,
    blastPosition: { x: SCREEN_WIDTH / 2, y: 150 },
    blastRadius: 180,
    blastPositionOffset: 10,
    autoStartDelay: 0,
    sizeVariation: 0.4, // More variation for dynamic texture sizes
    randomSpeed: { min: 0.8, max: 1.2 },
    randomOffset: { x: { min: -30, max: 30 }, y: { min: 0, max: 100 } },
    fadeOutOnEnd: true,
    rotation: { x: { min: 0 as const, max: 0 as const } },
    radiusRange: [0, 0] as [number, number], // Optimized for texture display
  },
  continuous: {
    type: 'continuous' as const,
    flakeSize: { width: 24, height: 24 } as const,
    count: 150,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    fallDuration: 5000,
    autoStartDelay: 0,
    sizeVariation: 0.2, // Moderate variation for steady texture appearance
    randomSpeed: { min: 1.0, max: 1.2 },
    randomOffset: { x: { min: -40, max: 40 }, y: { min: 0, max: 200 } },
    fadeOutOnEnd: false,
    rotation: { x: { min: 0 as const, max: 0 as const } },
    radiusRange: [0, 0] as [number, number], // Larger particles for better texture visibility
    verticalSpacing: 200,
  },
} as const;

// Default configuration
const defaultConfig: CustomConfettiConfig = presetConfigs.basic;

// UI Components
const SwitchControl = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <View style={styles.switchContainer}>
    <Text style={styles.switchLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: "#4CAF50" }}
      thumbColor={value ? "#ffffff" : "#f4f3f4"}
    />
  </View>
);

const PositionControl = ({
  label,
  x,
  y,
  onXChange,
  onYChange,
  maxX = SCREEN_WIDTH,
  maxY = SCREEN_HEIGHT,
}: {
  label: string;
  x: number;
  y: number;
  onXChange: (x: number) => void;
  onYChange: (y: number) => void;
  maxX?: number;
  maxY?: number;
}) => (
  <View style={styles.cannonPositionContainer}>
    <Text style={styles.cannonLabel}>{label}</Text>
    <SliderControl
      label="X Position"
      value={x}
      onValueChange={onXChange}
      minimumValue={0}
      maximumValue={maxX}
      step={10}
      suffix="px"
    />
    <SliderControl
      label="Y Position"
      value={y}
      onValueChange={onYChange}
      minimumValue={0}
      maximumValue={maxY}
      step={10}
      suffix="px"
    />
  </View>
);

const ControlButton = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
}: { 
  title: string; 
  onPress: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'info';
  disabled?: boolean;
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary': return styles.playButton;
      case 'secondary': return styles.pauseButton;
      case 'danger': return styles.resetButton;
      case 'info': return styles.copyButton;
      default: return styles.controlButton;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.controlButton,
        getButtonStyle(),
        disabled && { opacity: 0.5 }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.controlButtonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Accordion Component for collapsible sections
const AccordionSection = ({
  title,
  children,
  initiallyExpanded = false,
  icon = '📊',
}: {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  icon?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const animatedHeight = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust max height as needed
  });

  const rotate = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.accordionHeaderContent}>
          <Text style={styles.accordionIcon}>{icon}</Text>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Animated.Text style={[styles.accordionArrow, { transform: [{ rotate }] }]}>
            ▼
          </Animated.Text>
        </View>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.accordionContent,
          {
            maxHeight,
            opacity: animatedHeight,
          },
        ]}
      >
        <View style={styles.accordionInnerContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const SliderControl = ({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  suffix = '',
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  suffix?: string;
}) => {
  const increment = () => {
    const newValue = Math.min(value + step, maximumValue);
    onValueChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, minimumValue);
    onValueChange(newValue);
  };

  const handleTextChange = (text: string) => {
    const numValue = parseFloat(text) || minimumValue;
    const clampedValue = Math.max(minimumValue, Math.min(maximumValue, numValue));
    onValueChange(clampedValue);
  };

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value.toFixed(step < 1 ? 1 : 0)}{suffix}</Text>
      </View>
      <View style={styles.sliderControls}>
        <TouchableOpacity style={styles.sliderButton} onPress={decrement}>
          <Text style={styles.sliderButtonText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.sliderInput}
          value={value.toFixed(step < 1 ? 1 : 0)}
          onChangeText={handleTextChange}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.sliderButton} onPress={increment}>
          <Text style={styles.sliderButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sliderRange}>
        <Text style={styles.rangeText}>{minimumValue}</Text>
        <Text style={styles.rangeText}>{maximumValue}</Text>
      </View>
    </View>
  );
};


// Parameter Editor Component
const ParameterEditor = ({
  config,
  onConfigChange,
  onPresetLoad,
}: {
  config: CustomConfettiConfig;
  onConfigChange: (config: CustomConfettiConfig) => void;
  onPresetLoad: (preset: CustomConfettiConfig) => void;
}) => {
  const updateConfig = useCallback((updates: Partial<CustomConfettiConfig>) => {
    onConfigChange({ ...config, ...updates } as CustomConfettiConfig);
  }, [config, onConfigChange]);

  const updateNestedConfig = useCallback((key: string, subKey: string, value: any) => {
    const nested = { ...(config as any)[key] };
    nested[subKey] = value;
    updateConfig({ [key]: nested } as any);
  }, [config, updateConfig]);

  // Use shared preset configurations

  return (
    <ScrollView style={styles.parameterEditor} showsVerticalScrollIndicator={false}>
      <View style={styles.parameterContent}>
        <Text style={styles.editorTitle}>✨ Custom Animation Builder</Text>
      
      {/* Presets */}
      <View style={styles.editorSection}>
        <Text style={styles.editorSectionTitle}>Quick Presets</Text>
        <View style={styles.presetButtonsContainer}>
          {Object.entries(presetConfigs).map(([name, preset]) => (
            <ControlButton
              key={name}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
              onPress={() => onPresetLoad(preset)}
              variant="info"
            />
          ))}
        </View>
      </View>

      {/* Type Selection */}
      <View style={styles.editorSection}>
        <Text style={styles.editorSectionTitle}>Animation Type</Text>
        <View style={styles.typeSelector}>
          {(['basic', 'pi', 'continuous'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                config.type === type && styles.typeButton_selected
              ]}
              onPress={() => {
                // Merge current config with preset config for the new type
                const presetForType = presetConfigs[type];
                const mergedConfig = {
                  ...presetForType,
                  // Keep some current values if they exist and make sense
                  count: config.count,
                  fallDuration: config.fallDuration,
                  sizeVariation: config.sizeVariation,
                  fadeOutOnEnd: config.fadeOutOnEnd,
                };
                updateConfig(mergedConfig as CustomConfettiConfig);
              }}
            >
              <Text style={[
                styles.typeButtonText,
                config.type === type && styles.typeButtonText_selected
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Basic Parameters */}
      <View style={styles.editorSection}>
        <Text style={styles.editorSectionTitle}>Basic Parameters</Text>
        
        <SliderControl
          label="Count"
          value={config.count}
          onValueChange={(count) => updateConfig({ count })}
          minimumValue={50}
          maximumValue={1000}
          step={10}
        />
        
        <SliderControl
          label="Fall Duration"
          value={config.fallDuration}
          onValueChange={(fallDuration) => updateConfig({ fallDuration })}
          minimumValue={1000}
          maximumValue={10000}
          step={100}
          suffix="ms"
        />
        
        <SliderControl
          label="Size Variation"
          value={config.sizeVariation}
          onValueChange={(sizeVariation) => updateConfig({ sizeVariation })}
          minimumValue={0}
          maximumValue={0.5}
          step={0.05}
        />

        <SliderControl
          label="Auto Start Delay"
          value={config.autoStartDelay}
          onValueChange={(autoStartDelay) => updateConfig({ autoStartDelay })}
          minimumValue={0}
          maximumValue={5000}
          step={100}
          suffix="ms"
        />

        <SliderControl
          label="Min Radius Range"
          value={config.radiusRange[0]}
          onValueChange={(min) => updateConfig({
            radiusRange: [min, config.radiusRange[1]] as [number, number]
          })}
          minimumValue={0}
          maximumValue={20}
          step={1}
          suffix="px"
        />

        <SliderControl
          label="Max Radius Range"
          value={config.radiusRange[1]}
          onValueChange={(max) => updateConfig({
            radiusRange: [config.radiusRange[0], max] as [number, number]
          })}
          minimumValue={0}
          maximumValue={20}
          step={1}
          suffix="px"
        />

        <SwitchControl
          label="Fade Out on End"
          value={config.fadeOutOnEnd}
          onValueChange={(fadeOutOnEnd) => updateConfig({ fadeOutOnEnd })}
        />
      </View>

      {/* Speed & Movement */}
      <View style={styles.editorSection}>
        <Text style={styles.editorSectionTitle}>Speed & Movement</Text>
        
        <SliderControl
          label="Min Speed"
          value={config.randomSpeed.min}
          onValueChange={(min) => updateNestedConfig('randomSpeed', 'min', min)}
          minimumValue={0.1}
          maximumValue={2.0}
          step={0.1}
        />
        
        <SliderControl
          label="Max Speed"
          value={config.randomSpeed.max}
          onValueChange={(max) => updateNestedConfig('randomSpeed', 'max', max)}
          minimumValue={0.1}
          maximumValue={3.0}
          step={0.1}
        />
      </View>

      {/* Type-specific parameters */}
      {config.type === 'basic' && (
        <View style={styles.editorSection}>
          <Text style={styles.editorSectionTitle}>Basic Confetti Settings</Text>
          
          <SliderControl
            label="Blast Duration"
            value={(config as BasicConfettiConfig).blastDuration || 300}
            onValueChange={(blastDuration) => updateConfig({ blastDuration })}
            minimumValue={100}
            maximumValue={1000}
            step={50}
            suffix="ms"
          />
          
          <SliderControl
            label="Vertical Spacing"
            value={(config as BasicConfettiConfig).verticalSpacing || 30}
            onValueChange={(verticalSpacing) => updateConfig({ verticalSpacing })}
            minimumValue={10}
            maximumValue={100}
            step={5}
            suffix="px"
          />

          <SwitchControl
            label="Autoplay"
            value={(config as BasicConfettiConfig).autoplay}
            onValueChange={(autoplay) => updateConfig({ autoplay })}
          />

          <SwitchControl
            label="Infinite Loop"
            value={(config as BasicConfettiConfig).isInfinite}
            onValueChange={(isInfinite) => updateConfig({ isInfinite })}
          />

          {/* Cannon Positions */}
          <Text style={[styles.editorSectionTitle, { marginTop: 16 }]}>Cannon Positions</Text>
          {(config as BasicConfettiConfig).cannonsPositions.map((cannon, index) => (
            <PositionControl
              key={index}
              label={`Cannon ${index + 1}`}
              x={cannon.x}
              y={cannon.y}
              onXChange={(x) => {
                const newPositions = [...(config as BasicConfettiConfig).cannonsPositions];
                newPositions[index] = { ...cannon, x };
                updateConfig({ cannonsPositions: newPositions });
              }}
              onYChange={(y) => {
                const newPositions = [...(config as BasicConfettiConfig).cannonsPositions];
                newPositions[index] = { ...cannon, y };
                updateConfig({ cannonsPositions: newPositions });
              }}
            />
          ))}
        </View>
      )}

      {config.type === 'pi' && (
        <View style={styles.editorSection}>
          <Text style={styles.editorSectionTitle}>Burst Settings</Text>
          
          <SliderControl
            label="Blast Duration"
            value={(config as PIConfettiConfig).blastDuration || 300}
            onValueChange={(blastDuration) => updateConfig({ blastDuration })}
            minimumValue={100}
            maximumValue={1000}
            step={50}
            suffix="ms"
          />
          
          <SliderControl
            label="Blast Radius"
            value={(config as PIConfettiConfig).blastRadius || 180}
            onValueChange={(blastRadius) => updateConfig({ blastRadius })}
            minimumValue={50}
            maximumValue={300}
            step={10}
            suffix="px"
          />
          
          <PositionControl
            label="Blast Position"
            x={(config as PIConfettiConfig).blastPosition?.x || SCREEN_WIDTH / 2}
            y={(config as PIConfettiConfig).blastPosition?.y || 150}
            onXChange={(x) => updateConfig({ 
              blastPosition: { 
                ...((config as PIConfettiConfig).blastPosition || { y: 150 }), 
                x 
              }
            })}
            onYChange={(y) => updateConfig({ 
              blastPosition: { 
                ...((config as PIConfettiConfig).blastPosition || { x: SCREEN_WIDTH / 2 }), 
                y 
              }
            })}
            maxY={SCREEN_HEIGHT / 2}
          />
          
          <SliderControl
            label="Position Offset"
            value={(config as PIConfettiConfig).blastPositionOffset || 10}
            onValueChange={(blastPositionOffset) => updateConfig({ blastPositionOffset })}
            minimumValue={0}
            maximumValue={50}
            step={2}
            suffix="px"
          />
        </View>
      )}

      {config.type === 'continuous' && (
        <View style={styles.editorSection}>
          <Text style={styles.editorSectionTitle}>Continuous Settings</Text>
          
          <SliderControl
            label="Vertical Spacing"
            value={(config as ContinuousConfettiConfig).verticalSpacing || 200}
            onValueChange={(verticalSpacing) => updateConfig({ verticalSpacing })}
            minimumValue={50}
            maximumValue={500}
            step={25}
            suffix="px"
          />
        </View>
      )}
      </View>
    </ScrollView>
  );
};

// Custom hook to load optimized SVGs for confetti textures
const useLoadSVGs = () => {
  const svgs = [
    useSVG(svgAssets[0]), // Petals
    useSVG(svgAssets[1]), // Squiggles  
    useSVG(svgAssets[2]), // Stars
    useSVG(svgAssets[3]), // GreenDonuts
    useSVG(svgAssets[4]), // Rectangles
    useSVG(svgAssets[5]), // Squares
  ];

  const loadedSvgs = useMemo(
    () => {
      const filtered = svgs.filter(Boolean) as SkSVG[];
      console.log(`SVG Loading: ${filtered.length}/${svgAssets.length} SVGs loaded`);
      console.log('SVG Assets:', filtered.map((svg, idx) => `${idx}: ${Boolean(svg)}`));
      return filtered.length === svgAssets.length ? filtered : null;
    },
    svgs
  );

  useEffect(() => {
    if (loadedSvgs) {
      console.log('🎨 All SVGs loaded successfully!', loadedSvgs.length);
    } else {
      console.log('⚠️ SVGs still loading...');
    }
  }, [loadedSvgs]);

  return loadedSvgs;
};

// Custom hook to load PNG assets (alternative to SVGs)
const useLoadPNGs = () => {
  const pngs = [
    useImage(pngAssets[0]), // Petals
    useImage(pngAssets[1]), // Squiggles  
    useImage(pngAssets[2]), // Stars
    useImage(pngAssets[3]), // GreenDonuts
    useImage(pngAssets[4]), // Rectangles
    useImage(pngAssets[5]), // Squares
  ];

  const loadedPngs = useMemo(
    () => {
      const filtered = pngs.filter(Boolean) as SkImage[];
      console.log(`PNG Loading: ${filtered.length}/${pngAssets.length} PNGs loaded`);
      console.log('PNG Assets:', filtered.map((png, idx) => `${idx}: ${Boolean(png)}`));
      return filtered.length === pngAssets.length ? filtered : null;
    },
    pngs
  );
  
  useEffect(() => {
    // PNGs are loaded via require(), so they're available immediately
    console.log('�️ PNG assets loaded successfully!');
    console.log('🔍 PNG Assets:', pngAssets.map((asset, index) => `${index}: ${typeof asset}`));
    if (loadedPngs) {
      console.log('🖼️ All PnGs loaded successfully!', loadedPngs.length);
    } else {
      console.log('⚠️ PNGs still loading...');
    }
  }, [loadedPngs]);
  
  return loadedPngs;
};

// Texture Preview Bar Component
const TexturePreviewBar = ({
  loadedSvgs,
  loadedPngs,
  useTextures,
  onTextureTypeChange,
}: {
  loadedSvgs: any[] | null;
  loadedPngs: any[] | null;
  useTextures: 'svg' | 'png' | 'none';
  onTextureTypeChange: (type: 'svg' | 'png') => void;
}) => {
  const textureNames = ['Petals', 'Squiggles', 'Stars', 'GreenDonuts', 'Rectangles', 'Squares'];
  
  return (
    <View style={styles.texturePreviewBar}>      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.textureScrollView}>
        <View style={styles.textureRow}>
          {textureNames.map((name, index) => {
            const hasSvg = loadedSvgs && loadedSvgs[index];
            const hasPng = loadedPngs && loadedPngs[index];
            const isActive = (useTextures === 'svg' && hasSvg) || (useTextures === 'png' && hasPng);
            
            return (
              <View key={`texture-${index}-${name}`} style={styles.textureItemContainer}>
                <View style={styles.textureImageContainer}>
                  {useTextures === 'png' && hasPng ? (
                    <Image
                      source={pngAssets[index]}
                      style={styles.textureImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.texturePlaceholder}>
                      <Text style={styles.texturePlaceholderText}>
                        {hasSvg ? 'SVG' : hasPng ? 'PNG' : '❌'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.textureName,
                  isActive && styles.textureNameActive
                ]}>
                  {name}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={styles.textureStats}>
        <Text style={styles.textureStatsText}>
          📊 SVGs: {loadedSvgs?.length || 0}/6 • PNGs: {loadedPngs?.length || 0}/6
        </Text>
      </View>
    </View>
  );
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.container}>
        <ConfettiTestApp />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ConfettiTestApp() {
  // Unified ref management for all confetti types
  const confettiRefs = useRef<Array<ConfettiMethods | PIConfettiMethods | null>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomConfettiConfig>(defaultConfig);
  const [configKey, setConfigKey] = useState(0); // Force re-mount when config changes significantly
  const [useTextures, setUseTextures] = useState<'svg' | 'png' | 'none'>('png'); // Start with PNG for better Android compatibility
  
  const loadedSvgs = useLoadSVGs();
  const loadedPngs = useLoadPNGs();

  // Force re-render when textures become available for the first time
  useEffect(() => {
    const texturesAvailable = (useTextures === 'svg' && loadedSvgs && loadedSvgs.length === svgAssets.length) || 
                             (useTextures === 'png' && loadedPngs && loadedPngs.length === pngAssets.length);
    
    if (texturesAvailable) {
      console.log('🔄 All textures loaded, forcing confetti re-render with textures');
      setConfigKey(prev => prev + 1);
    }
  }, [loadedSvgs, loadedPngs, useTextures]);

  // Prevent rendering when textures are partially loaded to avoid array mismatch errors
  const areTexturesReady = useMemo(() => {
    if (useTextures === 'svg') {
      return loadedSvgs && loadedSvgs.length === svgAssets.length;
    } else if (useTextures === 'png') {
      return loadedPngs && loadedPngs.length === pngAssets.length;
    }
    return true; // No textures needed
  }, [useTextures, loadedSvgs, loadedPngs]);

  const handleAnimationStart = useCallback((type: string) => {
    console.log(`🎊 ${type} confetti animation started`);
    setIsRunning(true);
  }, []);

  const handleAnimationEnd = useCallback((type: string) => {
    console.log(`🎊 ${type} confetti animation ended`);
    // Simply stop running when any animation ends
    setIsRunning(false);
  }, []);

  const handleConfettiAction = (action: 'start' | 'pause' | 'reset') => {
    console.log(`🎮 Confetti Action: ${action}`);
    console.log(`🎨 Current texture mode: ${useTextures}`);
    console.log(`📦 SVGs loaded: ${loadedSvgs?.length || 0}`);
    console.log(`🖼️ PNGs loaded: ${loadedPngs?.length || 0}`);
    
    // Get all active confetti refs (support multiple texture layers)
    const activeRefs = confettiRefs.current.filter(ref => ref !== null);
    
    // Force reload if no refs are available
    if (activeRefs.length === 0) {
      console.log(`🔄 No active refs available, forcing component remount`);
      setConfigKey(prev => prev + 1);
      return;
    }
    
    try {
      console.log(`🎯 Executing ${action} on ${activeRefs.length} confetti layer(s)`);
      
      // Apply action to all active confetti layers
      activeRefs.forEach((ref, index) => {
        if (action === 'start') {
          ref.restart?.();
        } else if (action === 'pause') {
          ref.pause?.();
        } else if (action === 'reset') {
          ref.reset?.();
        }
        console.log(`✅ ${action} applied to layer ${index}`);
      });

      if (action === 'start' && !isRunning) {
        setIsRunning(true);
      } else if (action === 'pause' || action === 'reset') {
        setIsRunning(false);
      }
      
      console.log(`✅ ${action} applied successfully to all ${activeRefs.length} confetti layers`);

    } catch (error) {
      console.error(`❌ Confetti error:`, error);
      Alert.alert('Error', `Failed to ${action} confetti: ${error}`);
    }
  };

  // Safe config update that resets animation when needed
  const updateCustomConfig = useCallback((newConfig: CustomConfettiConfig) => {
    const oldConfig = customConfig;
    
    // Check if we need to force remount (significant changes)
    const needsRemount = 
      oldConfig.type !== newConfig.type ||
      oldConfig.count !== newConfig.count;
    
    if (needsRemount) {
      // Reset custom animation if running
      if (isRunning) {
        handleConfettiAction('reset');
      }
      setConfigKey(prev => prev + 1); // Force component remount
    }
    
    setCustomConfig(newConfig);
  }, [customConfig, isRunning]);

  // Copy config to clipboard
  const copyConfigToClipboard = useCallback(async () => {
    try {
      const configJson = JSON.stringify(customConfig, null, 2);
      await Clipboard.setString(configJson);
      Alert.alert('Success', 'Configuration copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', `Failed to copy configuration: ${error}`);
    }
  }, [customConfig]);

  // Paste config from clipboard
  const pasteConfigFromClipboard = useCallback(async () => {
    try {
      const rawClipboardContent = await Clipboard.getString();
      
      if (!rawClipboardContent || !rawClipboardContent.trim()) {
        Alert.alert('Error', 'Clipboard is empty');
        return;
      }

      // Clean up the clipboard content (remove potential hidden characters, normalize whitespace)
      const clipboardContent = rawClipboardContent
        .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Replace various unicode spaces with regular spaces
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
        .trim();

      console.log('📋 Clipboard content length:', clipboardContent.length);
      console.log('📋 First 100 chars:', clipboardContent.substring(0, 100));

      // Parse JSON
      let parsedConfig: any;
      try {
        parsedConfig = JSON.parse(clipboardContent);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        Alert.alert(
          'JSON Parse Error', 
          `Invalid JSON format in clipboard.\n\nError: ${parseError instanceof Error ? parseError.message : String(parseError)}\n\nFirst 200 characters:\n${clipboardContent.substring(0, 200)}...`
        );
        return;
      }

      console.log('✅ JSON parsed successfully:', Object.keys(parsedConfig));

      // Validate config structure
      const requiredFields = [
        'type', 'flakeSize', 'count', 'fallDuration',
        'autoStartDelay', 'sizeVariation', 'randomSpeed',
        'randomOffset', 'fadeOutOnEnd', 'radiusRange'
      ];
      
      const missingFields = requiredFields.filter(field => 
        parsedConfig[field] === undefined || parsedConfig[field] === null
      );
      
      if (missingFields.length > 0) {
        console.error('❌ Missing fields:', missingFields);
        Alert.alert('Validation Error', `Missing required fields: ${missingFields.join(', ')}\n\nFound fields: ${Object.keys(parsedConfig).join(', ')}`);
        return;
      }

      // Validate confetti type
      if (!['basic', 'pi', 'continuous'].includes(parsedConfig.type)) {
        Alert.alert('Validation Error', `Invalid confetti type: "${parsedConfig.type}". Must be: basic, pi, or continuous`);
        return;
      }

      console.log('🎯 Config type validated:', parsedConfig.type);

      // Type-specific validation
      if (parsedConfig.type === 'basic') {
        const requiredBasicFields = ['blastDuration', 'cannonsPositions', 'verticalSpacing', 'autoplay', 'isInfinite'];
        const missingBasicFields = requiredBasicFields.filter(field => 
          parsedConfig[field] === undefined || parsedConfig[field] === null
        );
        if (missingBasicFields.length > 0) {
          console.error('❌ Missing basic fields:', missingBasicFields);
          Alert.alert('Basic Confetti Validation Error', `Missing basic confetti fields: ${missingBasicFields.join(', ')}\n\nFound fields: ${Object.keys(parsedConfig).join(', ')}`);
          return;
        }
        
        // Validate cannonsPositions array structure
        if (!Array.isArray(parsedConfig.cannonsPositions)) {
          Alert.alert('Validation Error', 'cannonsPositions must be an array');
          return;
        }
        
      } else if (parsedConfig.type === 'pi') {
        const requiredPiFields = ['blastDuration', 'blastPosition', 'blastRadius', 'blastPositionOffset'];
        const missingPiFields = requiredPiFields.filter(field => 
          parsedConfig[field] === undefined || parsedConfig[field] === null
        );
        if (missingPiFields.length > 0) {
          console.error('❌ Missing PI fields:', missingPiFields);
          Alert.alert('PI Confetti Validation Error', `Missing PI confetti fields: ${missingPiFields.join(', ')}\n\nFound fields: ${Object.keys(parsedConfig).join(', ')}`);
          return;
        }
      } else if (parsedConfig.type === 'continuous') {
        if (parsedConfig.verticalSpacing === undefined || parsedConfig.verticalSpacing === null) {
          Alert.alert('Continuous Confetti Validation Error', 'Missing continuous confetti field: verticalSpacing');
          return;
        }
      }

      // Set default dimensions if not provided
      const newConfig = {
        ...parsedConfig,
        width: parsedConfig.width || SCREEN_WIDTH,
        height: parsedConfig.height || SCREEN_HEIGHT,
        // Remove functions that can't be serialized
        onAnimationStart: undefined,
        onAnimationEnd: undefined,
      };

      // Ask user for confirmation before applying
      Alert.alert(
        'Apply Configuration?',
        `Apply pasted ${newConfig.type} confetti configuration with ${newConfig.count} particles?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Apply',
            onPress: () => {
              // Stop current animation before applying new config
              if (isRunning) {
                handleConfettiAction('reset');
              }
              
              // Apply the new configuration
              updateCustomConfig(newConfig as CustomConfettiConfig);
              
              Alert.alert('Success', 'Configuration applied successfully!');
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', `Failed to paste configuration: ${error}`);
    }
  }, [isRunning, handleConfettiAction, updateCustomConfig]);

  // Helper function to render a single confetti instance with texture support
  const renderSingleConfettiLayer = (
    Component: any, 
    baseProps: any, 
    typeSpecificProps: any, 
    componentKey: string, 
    typeName: string,
    textureAsset: any,
    hasValidTextures: boolean,
    layerIndex = 0
  ) => {
    console.log(`🏗️ Rendering ${typeName} confetti layer ${layerIndex} with ${hasValidTextures ? useTextures : 'default'} texture`);
    
    const props = {
      ...baseProps,
      ...typeSpecificProps,
      // Always include flakeSize for proper rendering
      flakeSize: customConfig.flakeSize,
      // Apply texture based on type according to official documentation
      ...(useTextures === 'svg' && textureAsset ? {
        type: 'svg',
        flakeSvg: textureAsset, // Use flakeSvg for SVG textures
      } : useTextures === 'png' && textureAsset ? {
        type: 'image', 
        flakeImage: textureAsset, // Use flakeImage for PNG textures
      } : {
        // Fallback to basic confetti if no texture
        type: 'default',
      }),
    };
    
    console.log(`🔧 Layer ${layerIndex} props:`, {
      type: props.type,
      count: props.count,
      hasTexture: !!(props.flakeSvg || props.flakeImage),
      textureType: props.flakeSvg ? 'SVG' : props.flakeImage ? 'PNG' : 'default',
      flakeSize: props.flakeSize,
    });
    
    return (
      <Component
        key={`${componentKey}-${typeName}-layer-${layerIndex}`}
        ref={(ref: any) => {
          console.log(`📌 Setting layer ${layerIndex} ref:`, ref ? 'SET' : 'NULL');
          confettiRefs.current[layerIndex] = ref;
        }}
        {...props}
      />
    );
  };

  const renderCustomConfetti = () => {
    // Don't render if textures are not ready to prevent array mismatch
    if (!areTexturesReady) {
      console.log('⏳ Waiting for textures to load completely before rendering confetti');
      return null;
    }

    // Create a stable key for remounting
    const componentKey = `custom-${customConfig.type}-${configKey}`;
    
    // Get all available textures instead of just the first one
    let availableTextures: any[] = [];
    let hasValidTextures = false;
    
    if (useTextures === 'svg' && loadedSvgs && loadedSvgs.length === svgAssets.length) {
      availableTextures = loadedSvgs; // Use all SVG textures
      hasValidTextures = true;
      console.log(`🎨 Using all ${availableTextures.length} SVG textures:`, availableTextures.map((_, idx) => `texture-${idx}`));
    } else if (useTextures === 'png' && loadedPngs && loadedPngs.length === pngAssets.length) {
      availableTextures = loadedPngs; // Use all PNG textures
      hasValidTextures = true;
      console.log(`🎨 Using all ${availableTextures.length} PNG textures:`, availableTextures.map((_, idx) => `texture-${idx}`));
    }
    
    // If no textures available, render single basic confetti
    if (!hasValidTextures) {
      console.log(`⚠️ No textures available - rendering basic confetti without textures`);
      console.log(`Debug - SVGs available: ${Boolean(loadedSvgs)}, count: ${loadedSvgs?.length || 0}`);
      console.log(`Debug - PNGs available: ${Boolean(loadedPngs)}, count: ${loadedPngs?.length || 0}`);
      console.log(`Debug - useTextures mode: ${useTextures}`);
      availableTextures = [null]; // Single layer with no texture
    }
    
    // Calculate count per texture layer for even distribution
    const totalCount = customConfig.count;
    const countPerTexture = Math.ceil(totalCount / availableTextures.length);
    
    const baseProps = {
      width: customConfig.width,
      height: customConfig.height,
      autoplay: false,
      isInfinite: false,
      fallDuration: customConfig.fallDuration,
      autoStartDelay: customConfig.autoStartDelay,
      sizeVariation: customConfig.sizeVariation,
      randomSpeed: customConfig.randomSpeed,
      randomOffset: customConfig.randomOffset,
      fadeOutOnEnd: customConfig.fadeOutOnEnd,
      radiusRange: customConfig.radiusRange,
      rotation: customConfig.rotation,
      flakeSize: customConfig.flakeSize,
      onAnimationStart: () => handleAnimationStart('custom'),
      onAnimationEnd: () => handleAnimationEnd('custom'),
    };

    console.log(`🚀 Rendering ${availableTextures.length} ${customConfig.type} confetti layers with ${hasValidTextures ? useTextures : 'basic'} textures`);
    console.log(`🔧 ${countPerTexture} particles per texture, total: ${totalCount}`);

    // Render multiple confetti layers, each with a different texture
    return (
      <>
        {availableTextures.map((texture, index) => {
          const layerProps = {
            ...baseProps,
            count: countPerTexture,
          };

          if (customConfig.type === 'basic') {
            const typeProps = {
              blastDuration: (customConfig as BasicConfettiConfig).blastDuration || 300,
              verticalSpacing: (customConfig as BasicConfettiConfig).verticalSpacing || 30,
              cannonsPositions: (customConfig as BasicConfettiConfig).cannonsPositions,
              autoplay: (customConfig as BasicConfettiConfig).autoplay,
              isInfinite: (customConfig as BasicConfettiConfig).isInfinite,
            };
            return renderSingleConfettiLayer(
              Confetti, 
              layerProps, 
              typeProps, 
              `${componentKey}-layer-${index}`, 
              'basic', 
              texture, 
              hasValidTextures,
              index // Pass layer index for ref management
            );
          } else if (customConfig.type === 'pi') {
            const basePosition = (customConfig as PIConfettiConfig).blastPosition || { x: SCREEN_WIDTH / 2, y: 150 };
            const offsetRange = ((customConfig as PIConfettiConfig).blastPositionOffset || 10) * 2;
            
            const typeProps = {
              blastDuration: (customConfig as PIConfettiConfig).blastDuration || 300,
              blastPosition: { 
              x: basePosition.x + ((Math.random() - 0.5) * offsetRange), 
              y: basePosition.y + ((Math.random() - 0.5) * offsetRange) 
              },
              blastRadius: (customConfig as PIConfettiConfig).blastRadius || 180,
            };
            return renderSingleConfettiLayer(
              PIConfetti, 
              layerProps, 
              typeProps, 
              `${componentKey}-layer-${index}`, 
              'pi', 
              texture, 
              hasValidTextures,
              index
            );
          } else if (customConfig.type === 'continuous') {
            const typeProps = {
              verticalSpacing: (customConfig as ContinuousConfettiConfig).verticalSpacing || 200,
            };
            return renderSingleConfettiLayer(
              ContinuousConfetti, 
              layerProps, 
              typeProps, 
              `${componentKey}-layer-${index}`, 
              'continuous', 
              texture, 
              hasValidTextures,
              index
            );
          }
          return null;
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Custom Confetti - rendered in background */}
      <View style={styles.confettiOverlay} pointerEvents="none">
        {renderCustomConfetti()}
      </View>

      {/* Main Parameter Editor Interface */}
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎊 Confetti Builder</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={[
                styles.controlButton, 
                styles.playButton,
              ]}
              onPress={() => handleConfettiAction('start')}
            >
              <Text style={styles.controlButtonText}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.controlButton, 
                styles.pauseButton,
                !isRunning && { opacity: 0.5 }
              ]}
              onPress={() => handleConfettiAction('pause')}
              disabled={!isRunning}
            >
              <Text style={styles.controlButtonText}>⏸</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={() => handleConfettiAction('reset')}
            >
              <Text style={styles.controlButtonText}>⏹</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.copyButton]}
              onPress={copyConfigToClipboard}
            >
              <Text style={styles.controlButtonText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.pasteButton]}
              onPress={pasteConfigFromClipboard}
            >
              <Text style={styles.controlButtonText}>📥</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: useTextures === 'svg' ? '#FF9800' : '#666' },
              ]}
              onPress={() => {
                setUseTextures(useTextures === 'svg' ? 'png' : 'svg');
                console.log(`🔄 Switched to ${useTextures === 'svg' ? 'PNG' : 'SVG'} textures`);
              }}
            >
              <Text style={styles.controlButtonText}>{useTextures === 'svg' ? 'SVG' : 'PNG'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <AccordionSection
          title="Status & Info"
          icon="📊"
          initiallyExpanded={false}
        >
          <View style={styles.accordionStatusContent}>
            <Text style={styles.statusText}>
              Status: {isRunning ? '🎊 Running' : '⏸️ Stopped'} | Textures: {useTextures.toUpperCase()}
            </Text>
            <Text style={styles.configText}>
              {customConfig.type} | {customConfig.count} particles | {customConfig.fallDuration}ms
            </Text>
             <TexturePreviewBar
            loadedSvgs={loadedSvgs}
            loadedPngs={loadedPngs}
            useTextures={useTextures}
            onTextureTypeChange={(type) => {
              setUseTextures(type);
              console.log(`🔄 Switched to ${type.toUpperCase()} textures from preview bar`);
            }}
          />
          </View>
        </AccordionSection>
        
        <ParameterEditor
          config={customConfig}
          onConfigChange={updateCustomConfig}
          onPresetLoad={(preset) => {
            updateCustomConfig({ ...preset } as CustomConfettiConfig);
          }}
        />
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Main interface styles
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  confettiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 20,
    flexBasis: '100%',
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    opacity: 1,
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  copyButton: {
    backgroundColor: '#2196F3',
  },
  pasteButton: {
    backgroundColor: '#9C27B0',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  // Accordion styles
  accordionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    overflow: 'hidden',
    zIndex: 2,
  },
  accordionHeader: {
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  accordionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  accordionArrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  accordionContent: {
    overflow: 'hidden',
  },
  accordionInnerContent: {
    paddingBottom: 8,
  },
  accordionStatusContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  configText: {
    fontSize: 12,
    color: '#388E3C',
  },
  
  // Texture Preview Bar styles
  texturePreviewBar: {
    paddingVertical: 8,
  },
  textureBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  textureScrollView: {
    paddingHorizontal: 8,
  },
  textureRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  textureItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  textureItemActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  textureItemContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  textureImageContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  textureImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  texturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  texturePlaceholderText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  textureStatus: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textureStatusActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  textureStatusText: {
    fontSize: 10,
  },
  textureName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  textureNameActive: {
    color: '#2E7D32',
  },
  textureInfo: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  textureStats: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  textureStatsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Parameter Editor styles
  parameterEditor: {
    flex: 1,
    backgroundColor: 'rgba(245, 245, 245, 0.95)',
    zIndex: 2,
  },
  parameterContent: {
    padding: 16,
  },
  editorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 20,
  },
  editorSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editorSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  // Type Selector styles
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeButton_selected: {
    backgroundColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonText_selected: {
    color: 'white',
  },
  
  // Slider styles
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sliderValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderInput: {
    flex: 1,
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    fontSize: 12,
    color: '#666',
  },
  
  // Switch styles
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Cannon position styles
  cannonPositionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cannonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    textAlign: 'center',
  },
  
});

export default App;
