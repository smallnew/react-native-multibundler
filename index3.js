/** @format */

import {AppRegistry} from 'react-native';
import React, {Component} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {App3_1,App3_2} from "./App3";

const Stack = createStackNavigator();

function App3() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="App3_1" component={App3_1} />
        <Stack.Screen name="App3_2" component={App3_2} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent("reactnative_multibundler3", () => App3);
