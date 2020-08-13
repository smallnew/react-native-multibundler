import {AppRegistry,DeviceEventEmitter,View,Platform} from 'react-native';
import'react';
import'react-native';
import React,{Component} from "react";

import {SmartAssets} from "react-native-smartassets";
SmartAssets.initSmartAssets();
DeviceEventEmitter.addListener('sm-bundle-changed',
	(bundlePath)=>{
		SmartAssets.setBundlePath(bundlePath);
	});

import { NativeEventEmitter, NativeModules } from 'react-native';
if(Platform.OS != 'android') {//ios
	const {BundleloadEventEmiter} = NativeModules;

	const bundleLoadEmitter = new NativeEventEmitter(BundleloadEventEmiter);

	const subscription = bundleLoadEmitter.addListener(
		'BundleLoad',
		(bundleInfo) => {
			console.log('BundleLoad==' + bundleInfo.path);
			SmartAssets.setBundlePath(bundleInfo.path);
		}
	);
}

require('react-native/Libraries/Core/checkNativeVersion');
