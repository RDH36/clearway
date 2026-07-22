import React from 'react';
import type { WidgetInfo, WidgetTaskHandlerProps } from 'react-native-android-widget';
import { ClearwayMediumWidget, ClearwaySmallWidget } from './ClearwayWidget';
import { buildWidgetData } from './data';
import type { WidgetData } from './data';

export function renderClearwayWidget(info: WidgetInfo, data: WidgetData) {
  const small = info.widgetName === 'ClearwaySmall';
  const width = info.width || (small ? 158 : 320);
  const height = info.height || (small ? 158 : 168);
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
