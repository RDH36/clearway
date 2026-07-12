import React from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetData } from './data';

const INK = '#EAF4F2';
const ACCENT = '#5BE0C6';
const MUTED = '#9FB4B3';
const DIM = '#7E9A9B';

type Dims = { width: number; height: number };
type Props = { data: WidgetData } & Dims;

const bgSvg = (w: number, h: number) => {
  const aqX = (w * (w > h ? 0.18 : 0.5)).toFixed(0);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="p" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${(w * 0.25).toFixed(0)}" y2="${h}"><stop offset="0" stop-color="#16302F"/><stop offset="0.52" stop-color="#0E2024"/><stop offset="1" stop-color="#10261F"/></linearGradient><radialGradient id="aq" gradientUnits="userSpaceOnUse" cx="${aqX}" cy="${(-h * 0.08).toFixed(0)}" r="${(Math.max(w, h) * 0.8).toFixed(0)}"><stop offset="0" stop-color="#5BE0C6" stop-opacity="0.48"/><stop offset="0.6" stop-color="#5BE0C6" stop-opacity="0"/></radialGradient><radialGradient id="dw" gradientUnits="userSpaceOnUse" cx="${(w * 0.6).toFixed(0)}" cy="${(h * 1.18).toFixed(0)}" r="${(h * 1.1).toFixed(0)}"><stop offset="0" stop-color="#FFBA80" stop-opacity="0.3"/><stop offset="0.65" stop-color="#FFBA80" stop-opacity="0"/></radialGradient></defs><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="30" fill="url(#p)" stroke="#23383E" stroke-opacity="0.65"/><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="30" fill="url(#aq)"/><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="30" fill="url(#dw)"/></svg>`;
};

const ring = (pct: number) => {
  const off = Math.round(113.1 * (1 - Math.max(0, Math.min(1, pct))) * 10) / 10;
  return `<svg width="40" height="40" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="#23383E" stroke-width="3.5" stroke-opacity="0.9"/><circle cx="22" cy="22" r="18" fill="none" stroke="#5BE0C6" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="113.1" stroke-dashoffset="${off}" transform="rotate(-90 22 22)"/></svg>`;
};

function Brand() {
  return (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
      <FlexWidget
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          backgroundColor: '#0C2025',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FlexWidget style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: ACCENT }} />
      </FlexWidget>
      <TextWidget
        text="CLEARWAY"
        style={{ fontSize: 10, fontFamily: 'GeistMono_500Medium', color: MUTED, marginLeft: 8 }}
      />
    </FlexWidget>
  );
}

function DaysBlock({ days, daysLabel, big }: { days: number; daysLabel: string; big: number }) {
  return (
    <FlexWidget style={{ flexDirection: 'column' }}>
      <TextWidget
        text={String(days)}
        style={{ fontSize: big, fontFamily: 'BricolageGrotesque_700Bold', color: INK }}
      />
      <TextWidget
        text={daysLabel}
        maxLines={1}
        style={{ fontSize: 15, fontFamily: 'HankenGrotesk_600SemiBold', color: ACCENT }}
      />
    </FlexWidget>
  );
}

function MessageBlock({ label, text, sub, lines }: { label: string; text: string; sub?: string; lines: number }) {
  return (
    <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'column', justifyContent: 'center' }}>
      <TextWidget text={label} maxLines={1} style={{ fontSize: 9, fontFamily: 'GeistMono_500Medium', color: ACCENT }} />
      <TextWidget
        text={text}
        maxLines={lines}
        truncate="END"
        style={{ fontSize: 15, fontFamily: 'HankenGrotesk_600SemiBold', color: INK, marginTop: 5 }}
      />
      {sub ? (
        <TextWidget
          text={sub}
          maxLines={2}
          truncate="END"
          style={{ fontSize: 12, fontFamily: 'HankenGrotesk_400Regular', color: MUTED, marginTop: 3 }}
        />
      ) : null}
    </FlexWidget>
  );
}

function Message({ data, lines }: { data: WidgetData; lines: number }) {
  if (data.phase === 'why') {
    return <MessageBlock label="✦ WE'RE WITH YOU" text={data.affirmation} lines={lines} />;
  }
  return (
    <MessageBlock
      label="✦ CLEARWAY PREMIUM"
      text="Reactivate premium"
      sub="Your streak kept counting. Premium brings it back here."
      lines={1}
    />
  );
}

export function ClearwaySmallWidget({ data, width, height }: Props) {
  return (
    <OverlapWidget clickAction="OPEN_APP" style={{ width, height }}>
      <SvgWidget svg={bgSvg(width, height)} style={{ width, height }} />
      <FlexWidget
        style={{ width, height, padding: 17, flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <Brand />
        {data.phase === 'live' ? (
          <DaysBlock days={data.days} daysLabel={data.daysLabel} big={56} />
        ) : (
          <Message data={data} lines={4} />
        )}
      </FlexWidget>
    </OverlapWidget>
  );
}

export function ClearwayMediumWidget({ data, width, height }: Props) {
  if (data.phase !== 'live') {
    return (
      <OverlapWidget clickAction="OPEN_APP" style={{ width, height }}>
        <SvgWidget svg={bgSvg(width, height)} style={{ width, height }} />
        <FlexWidget style={{ width, height, padding: 20, flexDirection: 'column' }}>
          <Brand />
          <Message data={data} lines={3} />
        </FlexWidget>
      </OverlapWidget>
    );
  }

  const rightW = 150;
  return (
    <OverlapWidget clickAction="OPEN_APP" style={{ width, height }}>
      <SvgWidget svg={bgSvg(width, height)} style={{ width, height }} />
      <FlexWidget
        style={{
          width,
          height,
          paddingTop: 16,
          paddingBottom: 14,
          paddingLeft: 20,
          paddingRight: 20,
          flexDirection: 'column',
        }}
      >
        <FlexWidget style={{ flex: 1, width: 'match_parent', flexDirection: 'row' }}>
          <FlexWidget
            style={{ flex: 1, height: 'match_parent', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Brand />
            <DaysBlock days={data.days} daysLabel={data.daysLabel} big={58} />
          </FlexWidget>

          <FlexWidget
            style={{ width: 1, height: 'match_parent', backgroundColor: '#23383EE6', marginRight: 16 }}
          />

          <FlexWidget style={{ width: rightW, height: 'match_parent', flexDirection: 'column', justifyContent: 'center' }}>
            <FlexWidget style={{ flexDirection: 'column' }}>
              <TextWidget text="SAVED" style={{ fontSize: 9, fontFamily: 'GeistMono_500Medium', color: DIM }} />
              <TextWidget
                text={data.money}
                maxLines={1}
                truncate="END"
                style={{ fontSize: 25, fontFamily: 'BricolageGrotesque_700Bold', color: INK, marginTop: 1 }}
              />
            </FlexWidget>
            <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13 }}>
              <SvgWidget svg={ring(data.nextPct)} style={{ width: 40, height: 40 }} />
              <FlexWidget style={{ width: rightW - 51, flexDirection: 'column', marginLeft: 11 }}>
                <TextWidget text="NEXT" style={{ fontSize: 9, fontFamily: 'GeistMono_500Medium', color: DIM }} />
                <TextWidget
                  text={data.nextLabel}
                  maxLines={1}
                  truncate="END"
                  style={{ fontSize: 14, fontFamily: 'HankenGrotesk_600SemiBold', color: INK }}
                />
                <TextWidget
                  text={data.nextRemaining}
                  maxLines={1}
                  truncate="END"
                  style={{ fontSize: 12, fontFamily: 'HankenGrotesk_400Regular', color: MUTED }}
                />
              </FlexWidget>
            </FlexWidget>
          </FlexWidget>
        </FlexWidget>

        <FlexWidget
          style={{
            width: 'match_parent',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 11,
            borderRadius: 13,
            backgroundColor: '#5BE0C614',
            borderWidth: 1,
            borderColor: '#5BE0C629',
            paddingTop: 9,
            paddingBottom: 9,
            paddingLeft: 13,
            paddingRight: 13,
          }}
        >
          <FlexWidget
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: ACCENT,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TextWidget text="✓" style={{ fontSize: 10, color: '#08221D' }} />
          </FlexWidget>
          <TextWidget
            text={data.healthTitle}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 12.5, fontFamily: 'HankenGrotesk_600SemiBold', color: INK, marginLeft: 9 }}
          />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
