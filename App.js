/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const instructions = '业务1设置了一个全局变量供业务2读取';

type Props = {};
export default class App extends Component<Props> {
  componentDidMount(){
    global.buz1Param = '业务2你好，我是业务1，我们是在同一个js环境下';
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎来到业务1的世界！</Text>
        <Image source={require('./imgs/index1.jpg')}/>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
