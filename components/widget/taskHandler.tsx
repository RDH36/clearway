import React from 'react';
import type { WidgetInfo, WidgetTaskHandlerProps } from 'react-native-android-widget';
import { ClearwayMediumWidget, ClearwaySmallWidget } from './ClearwayWidget';
import { buildWidgetData } from './data';
import type { WidgetData } from './data';

export function renderClearwayWidget(info: WidgetInfo, data: WidgetData) {
  const small = info.widgetName === 'ClearwaySmall';
  const maxW = info.screenInfo?.screenWidthDp ? info.screenInfo.screenWidthDp - 24 : Infinity;
  const width = Math.min(info.width || (small ? 176 : 396), maxW);
  const height = info.height || 176;
  return small ? (
    <ClearwaySmallWidget data={data} width={width} height={height} />
  ) : (
    <ClearwayMediumWidget data={data} width={width} height={height} />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await buildWidgetData();
      props.renderWidget(renderClearwayWidget(props.widgetInfo, data));
      break;
    }
    default:
      break;
  }
}
