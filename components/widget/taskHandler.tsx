import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { ClearwayMediumWidget, ClearwaySmallWidget } from './ClearwayWidget';
import { buildWidgetData } from './data';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const data = await buildWidgetData();
      const small = props.widgetInfo.widgetName === 'ClearwaySmall';
      const width = props.widgetInfo.width || (small ? 176 : 396);
      const height = props.widgetInfo.height || 176;
      props.renderWidget(
        small ? (
          <ClearwaySmallWidget data={data} width={width} height={height} />
        ) : (
          <ClearwayMediumWidget data={data} width={width} height={height} />
        )
      );
      break;
    }
    default:
      break;
  }
}
