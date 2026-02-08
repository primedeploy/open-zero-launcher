import { Dimensions, PixelRatio, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

export function wp(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * widthScale));
}

export function hp(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * heightScale));
}

export function fp(size: number): number {
  const scale = Math.min(widthScale, heightScale);
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function isTablet(): boolean {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return SCREEN_WIDTH >= 600 || aspectRatio < 1.6;
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };
