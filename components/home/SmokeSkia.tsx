import { StyleSheet, Dimensions } from 'react-native';
import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Throttled clock — the smoke drifts slowly so fewer frames are imperceptible but
// roughly proportionally cut the GPU cost of the full-screen shader.
function useSmokeClock(fps: number) {
  const clock = useSharedValue(0);
  const last = useSharedValue(0);
  const step = 1000 / fps;
  useFrameCallback((frame) => {
    'worklet';
    if (frame.timeSinceFirstFrame - last.value >= step) {
      last.value = frame.timeSinceFirstFrame;
      clock.value = frame.timeSinceFirstFrame;
    }
  });
  return clock;
}

const noiseSrc = (octaves: number) => `
float hash(float2 p){ p = fract(p * float2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(float2 p){
  float2 i = floor(p); float2 f = fract(p); float2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i); float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0)); float d = hash(i + float2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(float2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < ${octaves}; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }
`;

const smokeShader = (octaves: number) =>
  Skia.RuntimeEffect.Make(`
uniform float time;
uniform float2 resolution;
uniform float density;
${noiseSrc(octaves)}
half4 main(float2 xy) {
  float2 uv = xy / resolution.y;
  float t = time + 18.0;
  float2 q = uv * 2.2;
  q.y += t * 0.14;
  q.x += t * 0.03;
  float2 warp = float2(fbm(q + float2(0.0, t * 0.10)), fbm(q + float2(4.7, 1.3) - float2(0.0, t * 0.08)));
  float d = fbm(q + warp * 1.6);
  d = smoothstep(0.30, 0.90, d);
  half3 col = half3(0.63, 0.71, 0.71);
  float a = d * density;
  return half4(col * a, a);
}
`)!;

// Home = light (3 octaves), onboarding backdrop = quality (4 octaves).
const smokeLo = smokeShader(3);
const smokeHi = smokeShader(4);

const splitSource = Skia.RuntimeEffect.Make(`
uniform float time;
uniform float2 resolution;
uniform float split;
${noiseSrc(4)}
half4 main(float2 xy) {
  float2 uv = xy / resolution.y;
  float t = time + 18.0;
  float2 q = uv * 2.2;
  q.y += t * 0.14;
  q.x += t * 0.03;
  float2 warp = float2(fbm(q + float2(0.0, t * 0.10)), fbm(q + float2(4.7, 1.3) - float2(0.0, t * 0.08)));
  float sm = fbm(q + warp * 1.6);
  sm = smoothstep(0.30, 0.90, sm);
  float side = smoothstep(split - 0.012, split + 0.012, xy.x / resolution.x);
  float dens = mix(0.95, 0.10, side);
  half3 bg = mix(half3(0.043, 0.094, 0.110), half3(0.055, 0.120, 0.125), side);
  half3 smokeCol = half3(0.72, 0.80, 0.80);
  float a = clamp(sm * dens, 0.0, 1.0);
  half3 outc = mix(bg, smokeCol, a);
  return half4(outc, 1.0);
}
`)!;

export function SmokeSkia({ opacity, hq = false }: { opacity: number; hq?: boolean }) {
  const clock = useSmokeClock(hq ? 60 : 30);
  const uniforms = useDerivedValue(
    () => ({ time: clock.value / 1000, resolution: [width, height], density: opacity }),
    [opacity]
  );
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Fill>
        <Shader source={hq ? smokeHi : smokeLo} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}

export function SmokeSplit({ split }: { split: SharedValue<number> }) {
  const clock = useSmokeClock(60);
  const uniforms = useDerivedValue(() => ({
    time: clock.value / 1000,
    resolution: [width, height],
    split: split.value,
  }));
  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Fill>
        <Shader source={splitSource} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
}
