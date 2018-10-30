package com.reactnative_multibundler.demo;

import com.facebook.react.AsyncReactActivity;

public class Buz2Activity extends AsyncReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "reactnative_multibundler2";
    }


    @Override
    protected String getScriptPath() {
        return "index2.android.bundle";
    }

    @Override
    protected ScriptType getScriptPathType() {
        return ScriptType.ASSET;
    }
}
