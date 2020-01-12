package com.reactnative_multibundler.demo;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnative_multibundler.BuildConfig;
import com.reactnative_multibundler.ScriptLoadUtil;
import com.smallnew.smartassets.RNSmartassetsPackage;

import java.util.Arrays;
import java.util.List;

import javax.annotation.Nullable;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return ScriptLoadUtil.MULTI_DEBUG;//是否是debug模式
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
              new RNSmartassetsPackage()
      );
    }

    @Nullable
    @Override
    protected String getBundleAssetName() {
      return "platform.android.bundle";
    }

    @Override
    protected String getJSMainModuleName() {
      return "MultiDenugEntry";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
