import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { renderClearwayWidget } from './taskHandler';
import { buildWidgetData } from './data';

export async function refreshWidget() {
  if (Platform.OS !== 'android') return;
  try {
    const data = await buildWidgetData();
    requestWidgetUpdate({
      widgetName: 'Clearway',
      renderWidget: (info) => renderClearwayWidget(info, data),
      widgetNotFound: () => {},
    });
    requestWidgetUpdate({
      widgetName: 'ClearwaySmall',
      renderWidget: (info) => renderClearwayWidget(info, data),
      widgetNotFound: () => {},
    });
  } catch {
    return;
  }
}
