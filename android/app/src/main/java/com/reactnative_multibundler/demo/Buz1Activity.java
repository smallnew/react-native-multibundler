package com.reactnative_multibundler.demo;

import com.facebook.react.AsyncReactActivity;
import com.reactnative_multibundler.RnBundle;

public class Buz1Activity extends AsyncReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "reactnative_multibundler";
    }

    @Override
    protected RnBundle getBundle(){
        RnBundle bundle = new RnBundle();
        bundle.scriptType = ScriptType.ASSET;
        bundle.scriptPath = "index.android.bundle";
        bundle.scriptUrl = "index.android.bundle";
        return bundle;
    }
}
