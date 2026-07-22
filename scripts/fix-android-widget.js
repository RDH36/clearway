const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'react-native-android-widget', 'android', 'src', 'main');
const layoutPath = path.join(root, 'res', 'layout', 'rn_widget.xml');
const utilPath = path.join(root, 'java', 'com', 'reactnativeandroidwidget', 'RNWidgetUtil.java');

const ORIGINAL_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
        return AppWidgetManager.getInstance(context).getAppWidgetOptions(widgetId).getInt(key, 0);
    }`;

const PREVIOUS_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
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

const PREVIOUS_V2_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
        int value = AppWidgetManager.getInstance(context).getAppWidgetOptions(widgetId).getInt(key, 0);
        if (value > 0) {
            return value;
        }

        AppWidgetProviderInfo providerInfo = AppWidgetManager.getInstance(context).getAppWidgetInfo(widgetId);
        if (providerInfo == null) {
            return 0;
        }

        boolean small = providerInfo.provider.getShortClassName().endsWith("ClearwaySmall");
        boolean isWidth = AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH.equals(key)
            || AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH.equals(key);
        if (isWidth) {
            return small ? 158 : 320;
        }
        return small ? 158 : 168;
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

        int base = context.getResources().getConfiguration().screenWidthDp - 42;
        boolean small = providerInfo.provider.getShortClassName().endsWith("ClearwaySmall");
        if (small) {
            return Math.max(150, Math.round(base * 0.48f));
        }

        boolean isWidth = AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH.equals(key)
            || AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH.equals(key);
        if (isWidth) {
            return Math.max(300, base);
        }
        return Math.max(160, Math.round(base * 0.55f));
    }`;

const layout = fs.readFileSync(layoutPath, 'utf8');
fs.writeFileSync(layoutPath, layout.replace(/android:scaleType="matrix"/g, 'android:scaleType="fitXY"'));

let util = fs.readFileSync(utilPath, 'utf8').replace(/\r\n/g, '\n');
if (!util.includes('screenWidthDp - 42')) {
  if (util.includes(PREVIOUS_V2_SIZE_FN)) {
    util = util.replace(PREVIOUS_V2_SIZE_FN, PATCHED_SIZE_FN);
  } else if (util.includes(PREVIOUS_SIZE_FN)) {
    util = util.replace(PREVIOUS_SIZE_FN, PATCHED_SIZE_FN);
  } else if (util.includes(ORIGINAL_SIZE_FN)) {
    util = util.replace(ORIGINAL_SIZE_FN, PATCHED_SIZE_FN);
  } else {
    console.error('[fix-android-widget] RNWidgetUtil.java has unexpected content — update scripts/fix-android-widget.js');
    process.exit(1);
  }
  fs.writeFileSync(utilPath, util);
}

console.log('[fix-android-widget] fitXY + widget size fallback applied');
