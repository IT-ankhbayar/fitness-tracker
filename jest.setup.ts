// Safe default mocks for React Native/testing environment
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children }: any) => React.createElement('div', null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Provide a very light mock for react-native primitives so components can render
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children }: any) => React.createElement('div', null, children),
    Text: ({ children }: any) => React.createElement('span', null, children),
    ScrollView: ({ children }: any) => React.createElement('div', null, children),
    ActivityIndicator: () => React.createElement('div', null, 'Loading...'),
    Pressable: ({ children, onPress }: any) => React.createElement('button', { onClick: onPress }, children),
    TouchableOpacity: ({ children, onPress }: any) => React.createElement('button', { onClick: onPress }, children),
    RefreshControl: () => null,
    FlatList: ({ data = [], renderItem, keyExtractor }: any) =>
      React.createElement(
        'div',
        null,
        data.map((item: any, index: number) =>
          React.createElement(
            'div',
            { key: keyExtractor ? keyExtractor(item, index) : index },
            renderItem({ item, index })
          )
        )
      ),
  };
});

// Mock vector icons used in UI
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Icon = ({ name }: any) => React.createElement('span', null, name || 'icon');
  return { Ionicons: Icon };
});
