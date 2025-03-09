const { SUPABASE_URL, SUPABASE_ANON_KEY, DEEPSEEK_API_KEY, HUGGINGFACE_API_KEY } = require('./env.js');

module.exports = {
  name: 'ProductivityAI',
  slug: 'productivityai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'productivityai',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.productivityai'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.productivityai'
  },
  plugins: [
    "expo-secure-store",
    "expo-notifications"
  ],
  extra: {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    deepseekApiKey: DEEPSEEK_API_KEY,
    huggingFaceApiKey: HUGGINGFACE_API_KEY
  },
  experiments: {
    tsconfigPaths: true
  }
}; 