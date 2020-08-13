/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {TouchableOpacity, Platform, StyleSheet, Text, View} from 'react-native';
import 'react-native-gesture-handler'

const instructions = '业务3打包的时候依赖了react-navigation，这里展示业务包依赖第三方模块的例子';

type Props = {};
export class App3_1 extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={()=>this.props.navigation.push('App3_2')} >
          <Text style={[styles.navBtn]}>导航到js页面2</Text>
        </TouchableOpacity>
        <Text style={styles.welcome}>欢迎来到业务3 页面1的世界！</Text>
        <Text style={styles.instructions}>To get started, edit App31.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }
}

export class App3_2 extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>欢迎来到业务3 页面2的世界！</Text>
        <Text style={styles.instructions}>To get started, edit App32.js</Text>
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
  navBtn: {
    fontSize: 20,
    textAlign: 'center',
    margin: 40,
    padding:15,
    backgroundColor: 'red',
    borderRadius:6
  },
});
