module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|sonner-native|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-masked-view|react-native-worklets|lucide-react-native)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
