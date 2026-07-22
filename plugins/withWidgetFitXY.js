const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');
const { applyWidgetFixes } = require('../scripts/fix-android-widget');

const LAYOUT = `<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@android:id/background"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <ImageView
        android:id="@+id/rn_widget_image_light"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@android:color/transparent"
        android:scaleType="fitXY"
        android:visibility="visible" />

    <ImageView
        android:id="@+id/rn_widget_image_dark"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@android:color/transparent"
        android:scaleType="fitXY"
        android:visibility="gone" />

    <FrameLayout
        android:id="@+id/rn_widget_clickable_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <FrameLayout
        android:id="@+id/rn_widget_collection_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>
`;

module.exports = function withWidgetFitXY(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      applyWidgetFixes();
      const dir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'layout');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'rn_widget.xml'), LAYOUT);
      return cfg;
    },
  ]);
};
