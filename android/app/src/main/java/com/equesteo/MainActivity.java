package com.equesteo;
import com.reactnativenavigation.NavigationActivity;

import android.os.Bundle;
import android.view.Gravity;
import android.graphics.drawable.Drawable;
import androidx.core.content.ContextCompat;
import android.widget.LinearLayout;

public class MainActivity extends NavigationActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(this.createSplashLayout());
    }

    public LinearLayout createSplashLayout() {
        LinearLayout splash = new LinearLayout(this);
        Drawable launch_screen_bitmap = ContextCompat.getDrawable(getApplicationContext(),R.drawable.launch_screen_bitmap);
        splash.setBackground(launch_screen_bitmap);
        return splash;
    }
}
