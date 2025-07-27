/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDB } from './src/database/Database';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DrawerNavigator from './src/navigation/DrawerNavigator';

const App: React.FC = () => {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <DrawerNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;