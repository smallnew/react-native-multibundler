import'react';
import'react-native';
import React,{Component} from "react";
import {Text} from "react-native";
import EmptyExport from './platformEmptyDefaultExport';//Requiring unknown module "node_modules_@babel_runtime_helpers_interopRequireDefault"

var _ = require('lodash');
Text.render = _.wrap(Text.render, function (func, ...args) {
    let originText = func.apply(this, args)
    return React.cloneElement(originText, {allowFontScaling: false})
})
