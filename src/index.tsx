import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import RootStackNavigator from './navigation/navigators/RootStackNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <RootStackNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
