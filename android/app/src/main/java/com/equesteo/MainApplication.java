package com.equesteo;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.rnfs.RNFSPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import net.no_mad.tts.TextToSpeechPackage;
import com.transistorsoft.rnbackgroundgeolocation.*;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import org.reactnative.camera.RNCameraPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.instanceid.RNFirebaseInstanceIdPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.sentry.RNSentryPackage;
import com.mapbox.rctmgl.RCTMGLPackage;
import com.reactnativecommunity.rnpermissions.RNPermissionsPackage;

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
        // ReadableNativeArray.setUseNativeAccessor(true);
        // ReadableNativeMap.setUseNativeAccessor(true);


        // https://codedaily.io/tutorials/4/Increase-Android-AsyncStorage-Size-in-React-Native
        // https://sentry.io/equesteo/equesteo-android/issues/707620247/
        long size = 50L * 1024L * 1024L; // 50 MB
        com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
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
            new PickerPackage(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new ReactNativePushNotificationPackage(),
            new RNFirebaseInstanceIdPackage(),
            new RNSentryPackage(),
            new SvgPackage(),
            new RCTMGLPackage(),
            new RNCameraPackage(),
            new RNCWebViewPackage(),
            new RNFetchBlobPackage(),
            new RNBackgroundFetchPackage(),
            new TextToSpeechPackage(),
            new NetInfoPackage(),
            new CameraRollPackage(),
            new RNFSPackage(),
            new AsyncStoragePackage(),
            new RNBackgroundGeolocation(),
            new RNPermissionsPackage()
        );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }
}
