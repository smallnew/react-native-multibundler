/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.facebook.react;

import android.content.Intent;
import android.os.Bundle;
import android.view.KeyEvent;

import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;
import com.reactnative_multibundler.ScriptLoadUtil;
import com.reactnative_multibundler.demo.MainApplication;


import java.io.File;

import javax.annotation.Nullable;

/**
 * 异步加载业务bundle的activity
 */
public abstract class AsyncReactActivity extends androidx.fragment.app.FragmentActivity
        implements DefaultHardwareBackBtnHandler, PermissionAwareActivity {

    public enum ScriptType {ASSET,FILE}


    private final ReactActivityDelegate mDelegate;

    protected AsyncReactActivity() {
        mDelegate = createReactActivityDelegate();
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     * e.g. "MoviesApp"
     */
    protected @Nullable String getMainComponentName() {
        return null;
    }

    /**
     * Called at construction time, override if you have a custom delegate implementation.
     */
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final ReactInstanceManager manager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
        if (!manager.hasStartedCreatingInitialContext()) {
            manager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                @Override
                public void onReactContextInitialized(ReactContext context) {
                    loadScript();
                    initView();
                    manager.removeReactInstanceEventListener(this);
                }
            });
            ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager().createReactContextInBackground();
        }else{
            loadScript();
            initView();
        }

    }

    protected abstract String getScriptPath();
    protected abstract ScriptType getScriptPathType();

    protected void loadScript(){
        /** all buz module is loaded when in debug mode*/
        if(ScriptLoadUtil.MULTI_DEBUG){//当设置成debug模式时，所有需要的业务代码已经都加载好了
            return;
        }
        ScriptType pathType = getScriptPathType();
        String scriptPath = getScriptPath();
        CatalystInstance instance = ScriptLoadUtil.getCatalystInstance(getReactNativeHost());
        if(pathType== ScriptType.ASSET) {
            ScriptLoadUtil.loadScriptFromAsset(getApplicationContext(),instance,scriptPath,false);
        }else {
            File scriptFile = new File(getApplicationContext().getFilesDir()
                    +File.separator+/*ScriptLoadUtil.REACT_DIR+File.separator+*/scriptPath);
            scriptPath = scriptFile.getAbsolutePath();
            ScriptLoadUtil.loadScriptFromFile(scriptPath,instance,scriptPath,false);
        }
    }

    protected void initView(){
        mDelegate.onCreate(null);
    }

    @Override
    protected void onPause() {
        super.onPause();
        mDelegate.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        mDelegate.onResume();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mDelegate.onDestroy();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        mDelegate.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        return mDelegate.onKeyDown(keyCode, event) || super.onKeyDown(keyCode, event);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        return mDelegate.onKeyUp(keyCode, event) || super.onKeyUp(keyCode, event);
    }

    @Override
    public boolean onKeyLongPress(int keyCode, KeyEvent event) {
        return mDelegate.onKeyLongPress(keyCode, event) || super.onKeyLongPress(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        if (!mDelegate.onBackPressed()) {
            super.onBackPressed();
        }
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (!mDelegate.onNewIntent(intent)) {
            super.onNewIntent(intent);
        }
    }

    @Override
    public void requestPermissions(
            String[] permissions,
            int requestCode,
            PermissionListener listener) {
        mDelegate.requestPermissions(permissions, requestCode, listener);
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] grantResults) {
        mDelegate.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    protected final ReactNativeHost getReactNativeHost() {
        return mDelegate.getReactNativeHost();
    }

    protected final ReactInstanceManager getReactInstanceManager() {
        return mDelegate.getReactInstanceManager();
    }

    protected final void loadApp(String appKey) {
        mDelegate.loadApp(appKey);
    }
}
