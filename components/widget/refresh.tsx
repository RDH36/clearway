import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { ClearwayMediumWidget, ClearwaySmallWidget } from './ClearwayWidget';
import { buildWidgetData } from './data';

export async function refreshWidget() {
  if (Platform.OS !== 'android') return;
  try {
    const data = await buildWidgetData();
    requestWidgetUpdate({
      widgetName: 'Clearway',
      renderWidget: (info) => (
        <ClearwayMediumWidget data={data} width={info.width || 396} height={info.height || 176} />
      ),
      widgetNotFound: () => {},
    });
    requestWidgetUpdate({
      widgetName: 'ClearwaySmall',
      renderWidget: (info) => (
        <ClearwaySmallWidget data={data} width={info.width || 176} height={info.height || 176} />
      ),
      widgetNotFound: () => {},
    });
  } catch {
    return;
  }
}
