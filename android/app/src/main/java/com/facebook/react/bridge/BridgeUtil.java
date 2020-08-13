package com.facebook.react.bridge;

import android.content.Context;


public class BridgeUtil {

    public static void loadScriptFromAsset(Context context,
                                    CatalystInstance instance,
                                    String assetName,boolean loadSynchronously) {
        String source = assetName;
        if(!assetName.startsWith("assets://")) {
            source = "assets://" + assetName;
        }
        ((CatalystInstanceImpl)instance).loadScriptFromAssets(context.getAssets(), source,loadSynchronously);
    }


    public static void loadScriptFromFile(String fileName,
                                    CatalystInstance instance,
                                    String sourceUrl,boolean loadSynchronously) {
        ((CatalystInstanceImpl)instance).loadScriptFromFile(fileName, sourceUrl,loadSynchronously);
    }
}
