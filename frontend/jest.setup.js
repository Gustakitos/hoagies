jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo', () => ({
  __ExpoImportMetaRegistry: {},
}));

jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest')
);

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        return (props) => React.createElement(View, props);
      },
    }
  );
});

jest.mock('react-native-reanimated', () => {
  const { View, Text, Image, ScrollView } = require('react-native');

  const createChainableAnimation = () => {
    const chainable = {
      delay: jest.fn(() => chainable),
      duration: jest.fn(() => chainable),
      springify: jest.fn(() => chainable),
      damping: jest.fn(() => chainable),
      mass: jest.fn(() => chainable),
      stiffness: jest.fn(() => chainable),
      overshootClamping: jest.fn(() => chainable),
      restDisplacementThreshold: jest.fn(() => chainable),
      restSpeedThreshold: jest.fn(() => chainable),
      withCallback: jest.fn(() => chainable),
      withInitialValues: jest.fn(() => chainable),
      randomDelay: jest.fn(() => chainable),
    };
    return chainable;
  };

  return {
    default: {
      View,
      Text,
      Image,
      ScrollView,
      createAnimatedComponent: (component) => component,
      call: () => {},
    },
    Easing: {
      linear: (x) => x,
      ease: (x) => x,
      quad: (x) => x,
      cubic: (x) => x,
      bezier: () => (x) => x,
    },
    useSharedValue: jest.fn((value) => ({ value })),
    useAnimatedStyle: jest.fn((callback) => callback()),
    useAnimatedProps: jest.fn((callback) => callback()),
    useDerivedValue: jest.fn((callback) => ({ value: callback() })),
    useAnimatedScrollHandler: jest.fn(() => ({})),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDecay: jest.fn((value) => value),
    withDelay: jest.fn((_, value) => value),
    withSequence: jest.fn((...values) => values[0]),
    withRepeat: jest.fn((value) => value),
    cancelAnimation: jest.fn(),
    runOnJS: jest.fn((fn) => fn),
    runOnUI: jest.fn((fn) => fn),
    FadeIn: createChainableAnimation(),
    FadeOut: createChainableAnimation(),
    FadeInDown: createChainableAnimation(),
    FadeInUp: createChainableAnimation(),
    FadeOutDown: createChainableAnimation(),
    FadeOutUp: createChainableAnimation(),
    SlideInDown: createChainableAnimation(),
    SlideInUp: createChainableAnimation(),
    SlideInLeft: createChainableAnimation(),
    SlideInRight: createChainableAnimation(),
    SlideOutDown: createChainableAnimation(),
    SlideOutUp: createChainableAnimation(),
    SlideOutLeft: createChainableAnimation(),
    SlideOutRight: createChainableAnimation(),
    Layout: createChainableAnimation(),
    LinearTransition: createChainableAnimation(),
    SequencedTransition: createChainableAnimation(),
  };
});

jest.mock('sonner-native', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    promise: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

jest.mock('./src/context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#F2F2F7',
      text: '#000000',
      border: '#C6C6C8',
      notification: '#FF3B30',
    },
  }),
  ThemeProvider: ({ children }: any) => children,
}));
