package com.reactnative_multibundler;

import android.content.Context;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactUtil;
import com.facebook.react.bridge.BridgeUtil;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;


public class ScriptLoadUtil {
    protected final static String TAG = "ScriptLoadUtil";
    public static final String REACT_DIR = "react_bundles";
    /** set this value when debug,you can set BuildConfig.DEBUG if need*/
    public static final boolean MULTI_DEBUG = false;//需要debug的时候设置成true,你也可以设置成跟BuildConfig.DEBUG一致
    private static Set<String> sLoadedScript = new HashSet<>();

    public static void recreateReactContextInBackgroundInner(ReactInstanceManager manager) {
        try {//recreateReactContextInBackground replace this
            Method method = ReactInstanceManager.class.getDeclaredMethod("recreateReactContextInBackgroundInner");
            method.setAccessible(true);
            method.invoke(manager);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public static void moveToResumedLifecycleState(ReactInstanceManager manager, boolean force) {
        try {
            Method method = ReactInstanceManager.class.getDeclaredMethod("moveToResumedLifecycleState", boolean.class);
            method.setAccessible(true);
            method.invoke(manager, force);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public static void setJsModuleName(ReactRootView rootView, String moduleName) {
        try {
            Field field = ReactRootView.class.getDeclaredField("mJSModuleName");
            field.setAccessible(true);
            field.set(rootView, moduleName);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    @Nullable
    public static CatalystInstance getCatalystInstance(ReactNativeHost host) {
        ReactInstanceManager manager = host.getReactInstanceManager();
        if (manager == null) {
            Log.e(TAG,"manager is null!!");
            return null;
        }

        ReactContext context = manager.getCurrentReactContext();
        if (context == null) {
            Log.e(TAG,"context is null!!");
            return null;
        }
        return context.getCatalystInstance();
    }

    public static void setJsBundleAssetPath(ReactContext reactContext,String bundleAssetPath){
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("sm-bundle-changed", bundleAssetPath);
    }

    @Nullable
    public static String getSourceUrl(CatalystInstance instance) {
        return ReactUtil.getSourceUrl(instance);
    }

    public static void loadScriptFromAsset(Context context,
                                    CatalystInstance instance,
                                    String assetName,boolean isSync) {
        if (sLoadedScript.contains(assetName)) {
            return;
        }
        BridgeUtil.loadScriptFromAsset(context,instance,assetName,isSync);
        sLoadedScript.add(assetName);
    }

    public static void loadScriptFromFile(String fileName,
                                           CatalystInstance instance,
                                           String sourceUrl,boolean isSync) {
        if (sLoadedScript.contains(sourceUrl)) {
            return;
        }
        BridgeUtil.loadScriptFromFile(fileName,instance,sourceUrl,isSync);
        sLoadedScript.add(sourceUrl);
    }

    public static void clearLoadedRecord(){
        if(sLoadedScript!=null){
            sLoadedScript.clear();
        }
    }

}
