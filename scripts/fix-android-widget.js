const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'react-native-android-widget', 'android', 'src', 'main');
const layoutPath = path.join(root, 'res', 'layout', 'rn_widget.xml');
const utilPath = path.join(root, 'java', 'com', 'reactnativeandroidwidget', 'RNWidgetUtil.java');

const SIZE_FN_REGEX = /    private static int getWidgetSizeInDp\(Context context, int widgetId, String key\) \{[\s\S]*?\n    \}/;

const PATCHED_SIZE_FN = `    private static int getWidgetSizeInDp(Context context, int widgetId, String key) {
        int value = AppWidgetManager.getInstance(context).getAppWidgetOptions(widgetId).getInt(key, 0);
        if (value > 0) {
            return value;
        }

        AppWidgetProviderInfo providerInfo = AppWidgetManager.getInstance(context).getAppWidgetInfo(widgetId);
        if (providerInfo == null) {
            return 0;
        }

        int base = context.getResources().getConfiguration().screenWidthDp - 15;
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

function applyWidgetFixes() {
  const layout = fs.readFileSync(layoutPath, 'utf8');
  fs.writeFileSync(layoutPath, layout.replace(/android:scaleType="matrix"/g, 'android:scaleType="fitXY"'));

  let util = fs.readFileSync(utilPath, 'utf8').replace(/\r\n/g, '\n');
  if (!util.includes('screenWidthDp - 15')) {
    if (!SIZE_FN_REGEX.test(util)) {
      throw new Error('RNWidgetUtil.java has unexpected content — update scripts/fix-android-widget.js');
    }
    fs.writeFileSync(utilPath, util.replace(SIZE_FN_REGEX, PATCHED_SIZE_FN));
  }

  console.log('[fix-android-widget] fitXY + widget size fallback applied');
}

module.exports = { applyWidgetFixes };

if (require.main === module) {
  try {
    applyWidgetFixes();
  } catch (e) {
    console.error('[fix-android-widget] ' + e.message);
    process.exit(1);
  }
}
