package com.reactnative_multibundler.demo;


import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.reactnative_multibundler.R;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_act_loadbundle);
        ReactInstanceManager reactInstanceManager = ((ReactApplication)getApplication()).getReactNativeHost().getReactInstanceManager();
        if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.createReactContextInBackground();//这里会先加载基础包platform.android.bundle，也可以不加载
        }
        //事先加载基础包可以减少后面页面加载的时间，但相应的会增加内存使用
        // 当然也可以不用事先加载基础包，AsyncReactActivity中已经包含了这个逻辑，如果判断出没加载基础包会先加载基础包再加载业务包
        //请根据自己的需求使用
        findViewById(R.id.btn_go_buz1).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {//点击进入rn业务1
                startActivity(new Intent(MainActivity.this,Buz1Activity.class));
            }
        });
        findViewById(R.id.btn_go_buz2).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {//点击进入rn业务2
                startActivity(new Intent(MainActivity.this,Buz2Activity.class));
            }
        });
        findViewById(R.id.btn_go_buz3).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {//点击进入rn业务3
                startActivity(new Intent(MainActivity.this,Buz3Activity.class));
            }
        });
    }
}
