import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './src/core/store/store';
import { queryClient } from './src/core/api/queryClient';
import { RootNavigator } from './src/core/navigation/RootNavigator';
import { linking } from './src/core/navigation/linking';
import { OfflineBanner } from './src/shared/components/OfflineBanner';
import './global.css';

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );
}
