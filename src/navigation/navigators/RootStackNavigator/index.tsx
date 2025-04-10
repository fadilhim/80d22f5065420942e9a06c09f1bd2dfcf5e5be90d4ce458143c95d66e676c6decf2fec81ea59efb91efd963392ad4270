import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootRoutes } from './RootRoute';
import JokesScreen from '../../../modules/jokes/screens/JokesScreen';

const Stack = createStackNavigator();

const RootStackNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={RootRoutes.JOKES}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={RootRoutes.JOKES} component={JokesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStackNavigator;
