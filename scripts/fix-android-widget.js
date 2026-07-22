const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'react-native-android-widget', 'android', 'src', 'main');
const layoutPath = path.join(root, 'res', 'layout', 'rn_widget.xml');
const utilPath = path.join(root, 'java', 'com', 'reactnativeandroidwidget', 'RNWidgetUtil.java');

const ORIGINAL_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
        return AppWidgetManager.getInstance(context).getAppWidgetOptions(widgetId).getInt(key, 0);
    }`;

const PATCHED_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
        int value = AppWidgetManager.getInstance(context).getAppWidgetOptions(widgetId).getInt(key, 0);
        if (value > 0) {
            return value;
        }

        AppWidgetProviderInfo providerInfo = AppWidgetManager.getInstance(context).getAppWidgetInfo(widgetId);
        if (providerInfo == null) {
            return 0;
        }

        boolean isWidth = AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH.equals(key)
            || AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH.equals(key);
        int fallbackPx = isWidth ? providerInfo.minWidth : providerInfo.minHeight;
        return (int) Math.round(pxToDp(context, fallbackPx));
    }`;

const layout = fs.readFileSync(layoutPath, 'utf8');
fs.writeFileSync(layoutPath, layout.replace(/android:scaleType="matrix"/g, 'android:scaleType="fitXY"'));

let util = fs.readFileSync(utilPath, 'utf8');
if (!util.includes('AppWidgetProviderInfo providerInfo')) {
  if (!util.includes(ORIGINAL_SIZE_FN)) {
    console.error('[fix-android-widget] RNWidgetUtil.java has unexpected content — update scripts/fix-android-widget.js');
    process.exit(1);
  }
  util = util.replace(ORIGINAL_SIZE_FN, PATCHED_SIZE_FN);
  fs.writeFileSync(utilPath, util);
}

console.log('[fix-android-widget] fitXY + widget size fallback applied');
