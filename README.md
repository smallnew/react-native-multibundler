# react-native-multibundler
基于react native的metro bundler的配置化开发来处理分包，支持iOS和Android，metro bundler为官方打包的工具，使用官方分包方法更灵活稳定，比网上的一些方法更实用可靠。
metro官方：https://facebook.github.io/metro/
基于react native 0.57开发，同样适用与0.56版本，但由于0.55版本的打包配置还不完善，暂不支持0.55版本
iOS和Android都有加载多bundle实例，经测试稳定可靠

打包命令如下：
## android
### 打android基础包
node ./node_modules/react-native/local-cli/cli.js bundle --platform android --dev false --entry-file platformDep.js --bundle-output ./android/app/src/main/assets/platform.android.bundle --assets-dest android/app/src/main/res/ --config /{你的绝对路径}/platform57.config.js
### 打android业务包
node ./node_modules/react-native/local-cli/cli.js bundle --platform android --dev false --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ --config /{你的绝对路径}/buz57.config.js


## iOS
### 打iOS基础包
node ./node_modules/react-native/local-cli/cli.js bundle --platform ios --dev false --entry-file platformDep.js --bundle-output ./ios/platform.ios.bundle --assets-dest ./ios/ --config /{你的绝对路径}/platform57.config.js
### 打iOS业务包
node ./node_modules/react-native/local-cli/cli.js bundle --platform ios --dev false --entry-file index.js --bundle-output ./ios/index.ios.bundle --assets-dest ./ios/ --config /{你的绝对路径}/buz57.config.js
