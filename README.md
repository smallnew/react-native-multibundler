# react-native-multibundler
基于react native的metro bundler的配置化开发来处理分包，支持iOS和Android，metro bundler为官方打包的工具，使用官方分包方法更灵活稳定，比网上的一些方法更实用可靠。

metro官方：https://facebook.github.io/metro/


基于react native 0.57开发，同样适用与0.56版本，但由于0.55版本的打包配置还不完善，暂不支持0.55版本

iOS和Android都有加载多bundle实例，经测试稳定可靠

### demo使用说明：

     1、进入项目文件夹：npm install

     2、android：使用android studio打开android项目 iOS：使用xcode打开iOS项目

     3、直接运行android或iOS项目，jsbundle包已经事先打好
     
<img src="https://github.com/smallnew/react-native-multibundler/raw/master/demo.gif" width="250" alt="Demo Android"></img>
     
### js项目结构：

```
.
├── App.js               业务界面1
├── App2.js              业务界面2
├── LICENSE
├── README.md
├── android              android项目目录
├── app.json 
├── buz57.config.js      业务包的打包配置
├── index.js             业务1入口js
├── index2.js            业务2入口js
├── ios ios目录
├── multibundler_cmd.txt 打包命令
├── package.json
├── platform57.config.js 基础包打包配置
├── platformDep.js       基础包打包入口
└── platformEmptyDefaultExport.js 基础包补丁
```
### android目录结构
```
.
├── AndroidManifest.xml
├── assets
│   ├── index.android.bundle   业务包
│   ├── index2.android.bundle  
│   └── platform.android.bundle 基础包
└── java
    └── com
        ├── facebook
        │   └── react
        │       ├── AsyncReactActivity.java 重要！rn业务加载入口，业务activity重写该类
        │       ├── ReactUtil.java
        │       └── bridge
        └── reactnative_multibundler
            ├── FileUtils.java
            ├── ScriptLoadUtil.java
            └── demo   demo目录，集成项目可删除
                ├── Buz1Activity.java
                ├── Buz2Activity.java
                ├── MainActivity.java
                └── MainApplication.java
```


### 如何接入原有项目：
#### android

    1、拷贝除了demo文件夹下的所有代码文件到项目
    
    2、根据自己的需要自定义platformDep.js和platform57.config.js，这里确定基础包包含的js module
    
    3、根据自己的需要确定你的业务入口js和buz57.config.js，这里确定业务包包含的js代码
    
    4、打包：根据底下给出的打包命令打包
    
    5、业务的UI入口使用继承自AsyncReactActivity的activity，重写getScriptPath和getScriptPathType确定业务bundle路径，重写getMainComponentName确定加载的业务module
    
    6、根据需要事先加载基础包，如果没有事先加载基础包，AsyncReactActivity会自动加载，加载基础包代码如下
    
    ReactInstanceManager reactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
        reactInstanceManager.createReactContextInBackground();//这里会先加载基础包platform.android.bundle，也可以不加载
        
      
    7、重写ReactApplication返回基础包的位置
    
#### iOS

    1、暴露RCTBridge的executeSourceCode方法，做法为将本项目中的RCTBridge添加到自己的工程
    
    2～4、与android的做法一样，见上方
    
    5、事先加载基础包：
    
    jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"platform.ios" withExtension:@"bundle"];
    bridge = [[RCTBridge alloc] initWithBundleURL:jsCodeLocation
                                 moduleProvider:nil
                                  launchOptions:launchOptions];
                                  
    6、加载业务包：
    
    NSURL *jsCodeLocationBuz = [[NSBundle mainBundle] URLForResource:bundleName withExtension:@"bundle"];
      NSError *error = nil;
      NSData *sourceBuz = [NSData dataWithContentsOfFile:jsCodeLocationBuz.path
                                             options:NSDataReadingMappedIfSafe
                                               error:&error];
      [bridge.batchedBridge executeSourceCode:sourceBuz sync:NO];
      
    7、创建RCTRootView，并绑定业务代码
    
    RCTRootView* view = [[RCTRootView alloc] initWithBridge:bridge moduleName:moduleName initialProperties:nil];
    

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
