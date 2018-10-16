package com.reactnative_multibundler;

import com.facebook.react.AsyncReactActivity;

public class MainActivity extends AsyncReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "reactnative_multibundler";
    }


    @Override
    protected String getScriptPath() {
        return "index.android.bundle";
    }

    @Override
    protected ScriptType getScriptPathType() {
        return ScriptType.ASSET;
    }
}
