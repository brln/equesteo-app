package com.equesteo;

import android.app.Application;
import com.airbnb.android.react.maps.MapsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.marianhello.bgloc.react.BackgroundGeolocationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.instanceid.RNFirebaseInstanceIdPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.sentry.RNSentryPackage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends NavigationApplication {

    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        };
        return new ReactGateway(this, isDebug(), host);
    }

    @Override
    public void onCreate() {
        // workaround for bug where array cant have more than 512 elements
        // https://github.com/facebook/react-native/issues/18292
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        ReadableNativeArray.setUseNativeAccessor(true);
        ReadableNativeMap.setUseNativeAccessor(true);
    }

    @Override
    public boolean isDebug() {
        // Make sure you are using BuildConfig from your own application
        return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
        // Add additional packages you require here
        // No need to add RnnPackage and MainReactPackage
        return Arrays.<ReactPackage>asList(
            new MapsPackage(),
            new PickerPackage(),
            new BackgroundGeolocationPackage(),
            new LocationServicesDialogBoxPackage(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new ReactNativePushNotificationPackage(),
            new RNFirebaseInstanceIdPackage(),
            new RNSentryPackage(MainApplication.this),
            new SvgPackage()
        );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }
}
